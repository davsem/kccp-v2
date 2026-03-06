import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { getSectionById } from "@/lib/pitch-data";
import type { SectionOwnerConfig, BillingAddress } from "@/lib/types";

interface RequestBody {
  sectionIds: string[];
  ownerConfigs: SectionOwnerConfig[];
  billing: BillingAddress;
  giftAid: boolean;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: RequestBody;
  try {
    body = await request.json() as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { sectionIds, ownerConfigs, billing, giftAid } = body;

  if (!Array.isArray(sectionIds) || sectionIds.length === 0) {
    return NextResponse.json({ error: "No sections provided" }, { status: 400 });
  }

  // Validate all section IDs exist in pitch data
  const sections = sectionIds.map((id) => getSectionById(id));
  if (sections.some((s) => !s)) {
    return NextResponse.json({ error: "Invalid section ID" }, { status: 400 });
  }

  // Check none are already purchased
  const { data: alreadySold } = await supabase
    .from("purchased_sections")
    .select("section_id")
    .in("section_id", sectionIds);

  if (alreadySold && alreadySold.length > 0) {
    return NextResponse.json(
      { error: "One or more sections are already sold", soldIds: alreadySold.map((r) => r.section_id) },
      { status: 409 }
    );
  }

  // Calculate total server-side (never trust client)
  const amountTotal = sections.reduce((sum, s) => sum + (s!.price * 100), 0);

  // Create Stripe PaymentIntent
  const orderId = crypto.randomUUID();
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountTotal,
    currency: "gbp",
    metadata: {
      orderId,
      sectionIds: sectionIds.join(","),
      userId: user.id,
    },
  });

  // Insert order (pending)
  const { error: orderError } = await supabase.from("orders").insert({
    id: orderId,
    user_id: user.id,
    stripe_payment_intent_id: paymentIntent.id,
    amount_total: amountTotal,
    currency: "gbp",
    status: "pending",
    gift_aid: giftAid,
    billing_name: billing.name,
    billing_address_line1: billing.address_line1,
    billing_address_line2: billing.address_line2 || null,
    billing_city: billing.city,
    billing_postal_code: billing.postal_code,
    billing_country: billing.country,
  });

  if (orderError) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }

  // Insert order items
  const ownerMap = new Map(ownerConfigs.map((c) => [c.section_id, c]));
  const orderItems = sectionIds.map((sectionId) => {
    const section = getSectionById(sectionId)!;
    const ownerConfig = ownerMap.get(sectionId);
    return {
      order_id: orderId,
      section_id: sectionId,
      price: section.price * 100,
      owner_name: ownerConfig?.owner_name ?? null,
      show_owner_name: ownerConfig?.show_owner_name ?? true,
    };
  });

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

  if (itemsError) {
    return NextResponse.json({ error: "Failed to create order items" }, { status: 500 });
  }

  return NextResponse.json({ clientSecret: paymentIntent.client_secret, orderId });
}

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
  } else if (event.type === "payment_intent.payment_failed") {
    await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { orderId, sectionIds: sectionIdsStr, userId } = paymentIntent.metadata;

  if (!orderId || !sectionIdsStr || !userId) return;

  const sectionIds = sectionIdsStr.split(",");

  // Fetch order items to get owner info
  const { data: orderItems } = await supabaseAdmin
    .from("order_items")
    .select("section_id, owner_name, show_owner_name")
    .eq("order_id", orderId);

  const ownerMap = new Map(
    (orderItems ?? []).map((item) => [item.section_id, item])
  );

  // Try to insert purchased_sections — PK conflict means someone else beat us
  const insertData = sectionIds.map((sectionId) => {
    const item = ownerMap.get(sectionId);
    return {
      section_id: sectionId,
      order_id: orderId,
      user_id: userId,
      owner_name: item?.owner_name ?? null,
      show_owner_name: item?.show_owner_name ?? true,
    };
  });

  const { error: insertError } = await supabaseAdmin
    .from("purchased_sections")
    .insert(insertData);

  if (insertError) {
    // Race condition: at least one section was already purchased — refund and mark failed
    await stripe.refunds.create({ payment_intent: paymentIntent.id });
    await supabaseAdmin
      .from("orders")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", orderId);
    return;
  }

  await supabaseAdmin
    .from("orders")
    .update({ status: "completed", updated_at: new Date().toISOString() })
    .eq("id", orderId);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { orderId } = paymentIntent.metadata;
  if (!orderId) return;

  await supabaseAdmin
    .from("orders")
    .update({ status: "failed", updated_at: new Date().toISOString() })
    .eq("id", orderId);
}

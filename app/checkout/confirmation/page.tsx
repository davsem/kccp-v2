import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ClearBasketOnSuccess } from "@/components/checkout/clear-basket-on-success";

export const metadata = {
  title: "Order Confirmation — Khalsa Community Pitch Project",
};

interface Props {
  searchParams: Promise<{ payment_intent?: string; orderId?: string }>;
}

export default async function ConfirmationPage({ searchParams }: Props) {
  const params = await searchParams;
  const paymentIntentId = params.payment_intent;
  const orderId = params.orderId;

  if (!paymentIntentId) redirect("/pitch");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  // Verify PaymentIntent status server-side
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  // Fetch order
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .single();

  const { data: orderItems } = order
    ? await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id)
    : { data: [] };

  const isProcessing = paymentIntent.status === "processing";
  const isSucceeded = paymentIntent.status === "succeeded";
  const isFailed = !isProcessing && !isSucceeded;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
      {isSucceeded && <ClearBasketOnSuccess />}

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isSucceeded ? "Thank you!" : isProcessing ? "Processing…" : "Payment failed"}
        </h1>
        {order && (
          <p className="mt-1 text-muted-foreground text-sm">
            Order reference: <code className="font-mono">{order.id.slice(0, 8).toUpperCase()}</code>
          </p>
        )}
      </div>

      {isProcessing && (
        <Alert>
          <AlertDescription>
            Your payment is being processed. Your sections will be confirmed shortly — refresh this
            page in a few moments.
          </AlertDescription>
        </Alert>
      )}

      {isFailed && (
        <Alert variant="destructive">
          <AlertDescription>
            Your payment did not complete. No charge has been taken.{" "}
            <Link href="/basket" className="underline font-medium">Return to basket</Link> to try again.
          </AlertDescription>
        </Alert>
      )}

      {(isSucceeded || isProcessing) && orderItems && orderItems.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold">Your sections</h2>
          {orderItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.section_id}</span>
                  <span className="text-muted-foreground">£{(item.price / 100).toFixed(2)}</span>
                </div>
                {item.owner_name && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {item.owner_name}
                    {!item.show_owner_name && " (private)"}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {order && (isSucceeded || isProcessing) && (
        <div className="space-y-2 border rounded-lg p-4 bg-muted/30">
          <h3 className="font-medium">Billing</h3>
          <p className="text-sm">{order.billing_name}</p>
          <p className="text-sm">{order.billing_address_line1}</p>
          {order.billing_address_line2 && <p className="text-sm">{order.billing_address_line2}</p>}
          <p className="text-sm">{order.billing_city}, {order.billing_postal_code}</p>
          <p className="text-sm">{order.billing_country}</p>
          {order.gift_aid && (
            <p className="text-sm font-medium text-green-700 dark:text-green-400 mt-2">GiftAid declared ✓</p>
          )}
          <p className="text-sm font-semibold mt-2">
            Total: £{(order.amount_total / 100).toFixed(2)}
          </p>
        </div>
      )}

      <Button asChild variant={isFailed ? "outline" : "default"}>
        <Link href="/pitch">{isFailed ? "Back to Pitch" : "Return to Pitch"}</Link>
      </Button>
    </div>
  );
}

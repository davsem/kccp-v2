import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ClearBasketOnSuccess } from "@/components/checkout/clear-basket-on-success";
import { ConfirmationCelebration } from "@/components/checkout/confirmation-celebration";
import { ConfirmationShare } from "@/components/checkout/confirmation-share";

export const metadata = {
  title: "Order Confirmation — Khalsa Community Pitch Project",
};

interface Props {
  searchParams: Promise<{ payment_intent?: string; orderId?: string }>;
}

export default async function ConfirmationPage({ searchParams }: Props) {
  const params = await searchParams;
  const paymentIntentId = params.payment_intent;

  if (!paymentIntentId) redirect("/pitch");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

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
  const sectionCount = orderItems?.length ?? 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
      {isSucceeded && <ClearBasketOnSuccess />}
      {isSucceeded && <ConfirmationCelebration />}

      {/* Hero */}
      <div
        className="flex flex-col items-center text-center gap-5 py-6"
        style={{ animation: "pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both" }}
      >
        {isSucceeded && (
          <svg
            width="96"
            height="96"
            viewBox="0 0 120 120"
            aria-hidden="true"
            className="drop-shadow-md"
          >
            {/* Crimson filled circle background */}
            <circle cx="60" cy="60" r="54" fill="var(--color-brand-crimson)" opacity="0.1" />
            {/* Animated circle stroke */}
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="var(--color-brand-crimson)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="327"
              strokeDashoffset="327"
              style={{
                animation: "draw-circle 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.1s forwards",
                transformOrigin: "center",
                transform: "rotate(-90deg)",
              }}
            />
            {/* Animated checkmark */}
            <path
              d="M37 60 L52 75 L83 43"
              fill="none"
              stroke="var(--color-brand-crimson)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="63"
              strokeDashoffset="63"
              style={{
                animation: "draw-check 0.45s cubic-bezier(0.4, 0, 0.2, 1) 0.75s forwards",
              }}
            />
          </svg>
        )}

        {isProcessing && (
          <div className="size-24 rounded-full border-4 border-muted flex items-center justify-center">
            <div
              className="size-12 rounded-full border-4 border-primary border-t-transparent"
              style={{ animation: "spin 1s linear infinite" }}
              role="status"
              aria-label="Payment processing"
            />
          </div>
        )}

        {isFailed && (
          <div className="size-24 rounded-full bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center">
            <span className="text-4xl" aria-hidden="true">✕</span>
          </div>
        )}

        <div className="space-y-2">
          <h1
            className="text-4xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {isSucceeded
              ? "You're part of it now."
              : isProcessing
              ? "Processing…"
              : "Payment failed"}
          </h1>

          {isSucceeded && sectionCount > 0 && (
            <p className="text-muted-foreground text-base max-w-sm">
              {sectionCount === 1
                ? "Your section on the Khalsa Community Pitch is reserved. Thank you."
                : `Your ${sectionCount} sections on the Khalsa Community Pitch are reserved. Thank you.`}
            </p>
          )}

          {isProcessing && (
            <p className="text-muted-foreground text-sm">
              Your payment is being processed. Refresh this page shortly to confirm your sections.
            </p>
          )}

          {order && (
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Ref: {order.id.slice(0, 8).toUpperCase()}
            </p>
          )}
        </div>
      </div>

      {isFailed && (
        <Alert variant="destructive">
          <AlertDescription>
            Your payment did not complete. No charge has been taken.{" "}
            <Link href="/basket" className="underline font-medium">
              Return to basket
            </Link>{" "}
            to try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Sections sponsored */}
      {(isSucceeded || isProcessing) && orderItems && orderItems.length > 0 && (
        <div
          className="space-y-3"
          style={{ animation: "slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Your sections</h2>
            {order && (
              <span className="text-sm font-semibold text-primary">
                £{(order.amount_total / 100).toFixed(2)} total
              </span>
            )}
          </div>
          {orderItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.section_id}</span>
                  <span className="text-muted-foreground text-sm">
                    £{(item.price / 100).toFixed(2)}
                  </span>
                </div>
                {item.owner_name && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {item.owner_name}
                    {!item.show_owner_name && (
                      <span className="ml-1 text-xs">(private)</span>
                    )}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Social share */}
      {isSucceeded && sectionCount > 0 && (
        <div style={{ animation: "slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both" }}>
          <ConfirmationShare sectionCount={sectionCount} />
        </div>
      )}

      {/* Billing summary */}
      {order && (isSucceeded || isProcessing) && (
        <div
          className="space-y-1.5 border rounded-lg p-4 bg-muted/30 text-sm"
          style={{ animation: "slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.65s both" }}
        >
          <p className="font-medium mb-2">Billing</p>
          <p>{order.billing_name}</p>
          <p>{order.billing_address_line1}</p>
          {order.billing_address_line2 && <p>{order.billing_address_line2}</p>}
          <p>
            {order.billing_city}, {order.billing_postal_code}
          </p>
          <p>{order.billing_country}</p>
          {order.gift_aid && (
            <p className="font-medium text-green-700 dark:text-green-400 mt-2 flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
                className="shrink-0"
              >
                <circle cx="7" cy="7" r="6.5" stroke="currentColor" />
                <path
                  d="M4 7L6 9L10 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>GiftAid declared</span>
              <span className="sr-only"> — GiftAid enabled on this donation</span>
            </p>
          )}
        </div>
      )}

      <div style={{ animation: "slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.8s both" }}>
        <Button asChild variant={isFailed ? "outline" : "default"}>
          <Link href="/pitch">{isFailed ? "Back to Pitch" : "Return to Pitch"}</Link>
        </Button>
      </div>
    </div>
  );
}

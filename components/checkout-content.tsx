"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBasket } from "@/lib/basket-context";
import { Button } from "@/components/ui/button";
import { SectionOwnerNames } from "@/components/checkout/section-owner-names";
import { BillingPayment } from "@/components/checkout/billing-payment";
import { OrderReview } from "@/components/checkout/order-review";
import type { Profile, BillingAddress, SectionOwnerConfig } from "@/lib/types";

type Step = "names" | "billing" | "review";

interface CheckoutContentProps {
  profile: Profile;
}

export function CheckoutContent({ profile }: CheckoutContentProps) {
  const router = useRouter();
  const { selectedIds } = useBasket();
  const sectionIds = Array.from(selectedIds);

  const [step, setStep] = useState<Step>("names");
  const [ownerConfigs, setOwnerConfigs] = useState<SectionOwnerConfig[]>([]);
  const [billing, setBilling] = useState<BillingAddress | null>(null);
  const [giftAid, setGiftAid] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [amountTotal, setAmountTotal] = useState(0);

  const defaultName = `${profile.first_name} ${profile.last_name}`;

  if (sectionIds.length === 0) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-muted-foreground">Your basket is empty.</p>
        <Button variant="outline" onClick={() => router.push("/pitch")}>
          Browse The Pitch
        </Button>
      </div>
    );
  }

  async function handleBillingReview(billingData: BillingAddress, giftAidValue: boolean) {
    setBilling(billingData);
    setGiftAid(giftAidValue);

    const res = await fetch("/api/checkout/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sectionIds,
        ownerConfigs,
        billing: billingData,
        giftAid: giftAidValue,
      }),
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      throw new Error(data.error ?? "Failed to create payment intent");
    }

    const data = (await res.json()) as { clientSecret: string; orderId: string };
    setClientSecret(data.clientSecret);
    setOrderId(data.orderId);

    const { getSectionById } = await import("@/lib/pitch-data");
    const derivedTotal = sectionIds.reduce((sum, id) => sum + (getSectionById(id)?.price ?? 0) * 100, 0);
    setAmountTotal(derivedTotal);

    setStep("review");
  }

  return (
    <div>
      {step === "names" && (
        <SectionOwnerNames
          sectionIds={sectionIds}
          defaultName={defaultName}
          onContinue={(configs) => {
            setOwnerConfigs(configs);
            setStep("billing");
          }}
        />
      )}

      {step === "billing" && (
        <BillingPayment
          defaultName={defaultName}
          sectionIds={sectionIds}
          ownerConfigs={ownerConfigs}
          onReview={handleBillingReview}
          onBack={() => setStep("names")}
        />
      )}

      {step === "review" && clientSecret && orderId && billing && (
        <OrderReview
          sectionIds={sectionIds}
          ownerConfigs={ownerConfigs}
          billing={billing}
          giftAid={giftAid}
          clientSecret={clientSecret}
          orderId={orderId}
          amountTotal={amountTotal}
          onBack={() => setStep("billing")}
        />
      )}
    </div>
  );
}

"use client";

import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe/client";
import { PaymentForm } from "@/components/checkout/payment-form";
import { Card, CardContent } from "@/components/ui/card";
import { getSectionById } from "@/lib/pitch-data";
import { Check } from "lucide-react";
import type { BillingAddress, SectionOwnerConfig } from "@/lib/types";

interface OrderReviewProps {
  sectionIds: string[];
  ownerConfigs: SectionOwnerConfig[];
  billing: BillingAddress;
  giftAid: boolean;
  clientSecret: string;
  orderId: string;
  amountTotal: number;
  onBack: () => void;
}

export function OrderReview({
  sectionIds,
  ownerConfigs,
  billing,
  giftAid,
  clientSecret,
  orderId,
  amountTotal,
  onBack,
}: OrderReviewProps) {
  const ownerMap = new Map(ownerConfigs.map((c) => [c.section_id, c]));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Review & Pay</h2>

      <div className="space-y-3">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Sections</h3>
        {sectionIds.map((id) => {
          const section = getSectionById(id);
          const config = ownerMap.get(id);
          return (
            <Card key={id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{section?.label}</span>
                  <span className="text-muted-foreground">£{section?.price}</span>
                </div>
                {config?.owner_name && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {config.owner_name}
                    {!config.show_owner_name && " (private)"}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="space-y-2 border rounded-lg p-4 bg-muted/30">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Billing</h3>
        <p className="text-sm">{billing.name}</p>
        <p className="text-sm">{billing.address_line1}</p>
        {billing.address_line2 && <p className="text-sm">{billing.address_line2}</p>}
        <p className="text-sm">{billing.city}, {billing.postal_code}</p>
        <p className="text-sm">{billing.country}</p>
        {giftAid && (
          <p className="text-sm font-medium text-green-700 dark:text-green-400 mt-2 flex items-center gap-1.5">
            <Check aria-hidden="true" className="size-3.5 shrink-0" />
            <span>GiftAid declared</span>
          </p>
        )}
      </div>

      <div className="flex justify-between font-semibold text-lg border-t pt-4">
        <span>Total</span>
        <span>£{(amountTotal / 100).toFixed(2)}</span>
      </div>

      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <PaymentForm amountTotal={amountTotal} orderId={orderId} onBack={onBack} />
      </Elements>
    </div>
  );
}

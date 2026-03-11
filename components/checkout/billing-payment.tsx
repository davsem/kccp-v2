"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { BillingAddress, SectionOwnerConfig } from "@/lib/types";

interface BillingPaymentProps {
  defaultName: string;
  sectionIds: string[];
  ownerConfigs: SectionOwnerConfig[];
  onReview: (billing: BillingAddress, giftAid: boolean) => Promise<void>;
  onBack: () => void;
}

export function BillingPayment({ defaultName, onReview, onBack }: BillingPaymentProps) {
  const [billing, setBilling] = useState<BillingAddress>({
    name: defaultName,
    address_line1: "",
    address_line2: "",
    city: "",
    postal_code: "",
    country: "GB",
  });
  const [giftAid, setGiftAid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField(field: keyof BillingAddress, value: string) {
    setBilling((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onReview(billing, giftAid);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold">Billing Details</h2>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="billing-name">Full name</Label>
          <Input
            id="billing-name"
            required
            value={billing.name}
            onChange={(e) => setField("name", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address-line1">Address line 1</Label>
          <Input
            id="address-line1"
            required
            value={billing.address_line1}
            onChange={(e) => setField("address_line1", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address-line2">Address line 2 (optional)</Label>
          <Input
            id="address-line2"
            value={billing.address_line2}
            onChange={(e) => setField("address_line2", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              required
              value={billing.city}
              onChange={(e) => setField("city", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="postal-code">Postcode</Label>
            <Input
              id="postal-code"
              required
              value={billing.postal_code}
              onChange={(e) => setField("postal_code", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            required
            value={billing.country}
            onChange={(e) => setField("country", e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
        <h3 className="font-semibold">GiftAid Declaration</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          I am a UK taxpayer and understand that if I pay less Income Tax and/or Capital Gains Tax than
          the amount of Gift Aid claimed on all my donations in that tax year, it is my responsibility
          to pay any difference. I want Khalsa Hockey Club to reclaim Gift Aid on this donation and any
          donations I make in the future or have made in the past 4 years. I confirm I have paid or will
          pay an amount of Income Tax and/or Capital Gains Tax for each tax year at least equal to the
          amount of tax that Khalsa Hockey Club and any other charities or Community Amateur Sports Clubs
          (CASCs) to which I donate will reclaim on my gifts.
        </p>
        <div className="flex items-start gap-2">
          <Checkbox
            id="gift-aid"
            checked={giftAid}
            onCheckedChange={(checked) => setGiftAid(!!checked)}
            className="mt-0.5"
          />
          <Label htmlFor="gift-aid" className="text-sm cursor-pointer leading-relaxed">
            I confirm the above GiftAid declaration and would like Khalsa Hockey Club to reclaim tax
            on this donation.
          </Label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "Processing…" : "Review Order"}
        </Button>
      </div>
    </form>
  );
}

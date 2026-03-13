"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { BillingAddress, SectionOwnerConfig } from "@/lib/types";

// Common countries for a UK-based fundraiser; value = ISO 3166-1 alpha-2 code
const COUNTRIES = [
  { code: "GB", name: "United Kingdom" },
  { code: "IE", name: "Ireland" },
  { code: "AU", name: "Australia" },
  { code: "CA", name: "Canada" },
  { code: "IN", name: "India" },
  { code: "NZ", name: "New Zealand" },
  { code: "US", name: "United States" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "DE", name: "Germany" },
  { code: "DK", name: "Denmark" },
  { code: "ES", name: "Spain" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "MY", name: "Malaysia" },
  { code: "NL", name: "Netherlands" },
  { code: "NO", name: "Norway" },
  { code: "PL", name: "Poland" },
  { code: "SE", name: "Sweden" },
  { code: "SG", name: "Singapore" },
  { code: "ZA", name: "South Africa" },
];

const selectClassName = cn(
  "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs",
  "transition-[color,box-shadow] outline-none",
  "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "md:text-sm dark:bg-input/30"
);

// Required field label suffix
function Req() {
  return (
    <span aria-hidden="true" className="ml-0.5 text-destructive">
      *
    </span>
  );
}

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

      <p className="text-xs text-muted-foreground">
        Fields marked{" "}
        <span aria-hidden="true" className="text-destructive font-medium">
          *
        </span>{" "}
        <span className="sr-only">with an asterisk</span>
        are required.
      </p>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="billing-name">
            Full name <Req />
          </Label>
          <Input
            id="billing-name"
            required
            autoComplete="name"
            value={billing.name}
            onChange={(e) => setField("name", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address-line1">
            Address line 1 <Req />
          </Label>
          <Input
            id="address-line1"
            required
            autoComplete="address-line1"
            value={billing.address_line1}
            onChange={(e) => setField("address_line1", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address-line2">Address line 2 (optional)</Label>
          <Input
            id="address-line2"
            autoComplete="address-line2"
            value={billing.address_line2}
            onChange={(e) => setField("address_line2", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="city">
              City <Req />
            </Label>
            <Input
              id="city"
              required
              autoComplete="address-level2"
              value={billing.city}
              onChange={(e) => setField("city", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="postal-code">
              Postcode <Req />
            </Label>
            <Input
              id="postal-code"
              required
              autoComplete="postal-code"
              value={billing.postal_code}
              onChange={(e) => setField("postal_code", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="country">
            Country <Req />
          </Label>
          <select
            id="country"
            required
            autoComplete="country"
            value={billing.country}
            onChange={(e) => setField("country", e.target.value)}
            className={selectClassName}
          >
            {COUNTRIES.map(({ code, name }) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
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

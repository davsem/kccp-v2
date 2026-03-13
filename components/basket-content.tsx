"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useBasket } from "@/lib/basket-context";
import { getSectionById } from "@/lib/pitch-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";

export function BasketContent() {
  const { selectedIds, count, clear, removeMultiple } = useBasket();
  const [staleIds, setStaleIds] = useState<string[]>([]);

  const items = Array.from(selectedIds)
    .map((id) => getSectionById(id))
    .filter(Boolean);

  const total = items.reduce((sum, s) => sum + (s?.price ?? 0), 0);

  // Check for sections purchased by others while user was browsing
  useEffect(() => {
    if (selectedIds.size === 0) return;
    const supabase = createClient();
    const ids = Array.from(selectedIds);
    supabase
      .from("purchased_sections")
      .select("section_id")
      .in("section_id", ids)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setStaleIds(data.map((d) => d.section_id));
        }
      });
  }, [selectedIds]);

  if (count === 0) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-muted-foreground">Your basket is empty.</p>
        <Button asChild variant="outline">
          <Link href="/pitch">Browse The Pitch</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {staleIds.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
            <span>
              {staleIds.length === 1
                ? "1 section in your basket has just been sold to someone else."
                : `${staleIds.length} sections in your basket have just been sold to someone else.`}{" "}
              They are marked below.
            </span>
            <button
              className="underline font-medium whitespace-nowrap"
              onClick={() => {
                removeMultiple(staleIds);
                setStaleIds([]);
              }}
            >
              Remove unavailable sections
            </button>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        {items.map((section) =>
          section ? (
            <Card key={section.id} className={staleIds.includes(section.id) ? "opacity-60" : ""}>
              <CardContent className="flex items-center justify-between py-3 px-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{section.label}</span>
                  {staleIds.includes(section.id) && (
                    <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive">
                      Sold
                    </span>
                  )}
                </div>
                <span className="text-muted-foreground">£{section.price}</span>
              </CardContent>
            </Card>
          ) : null
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t pt-4">
        <p className="font-semibold">
          Total: £{total}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clear} className="flex-1 sm:flex-initial">
            Clear Basket
          </Button>
          <Button asChild disabled={staleIds.length > 0} className="flex-1 sm:flex-initial">
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

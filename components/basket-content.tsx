"use client";

import Link from "next/link";
import { useBasket } from "@/lib/basket-context";
import { getSectionById } from "@/lib/pitch-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function BasketContent() {
  const { selectedIds, count, clear } = useBasket();

  const items = Array.from(selectedIds)
    .map((id) => getSectionById(id))
    .filter(Boolean);

  const total = items.reduce((sum, s) => sum + (s?.price ?? 0), 0);

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
      <div className="space-y-2">
        {items.map((section) =>
          section ? (
            <Card key={section.id}>
              <CardContent className="flex items-center justify-between py-3 px-4">
                <span className="font-medium">{section.label}</span>
                <span className="text-muted-foreground">£{section.price}</span>
              </CardContent>
            </Card>
          ) : null
        )}
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <p className="font-semibold">
          Total: £{total}
        </p>
        <Button variant="destructive" onClick={clear}>
          Clear Basket
        </Button>
      </div>
    </div>
  );
}

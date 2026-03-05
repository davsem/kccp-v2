"use client";

import Link from "next/link";
import { useBasket } from "@/lib/basket-context";
import { pitchSections, GRID_COLS } from "@/lib/pitch-data";
import { getSectionById } from "@/lib/pitch-data";
import { PitchSectionCell } from "@/components/pitch-section-cell";
import { Button } from "@/components/ui/button";

export function PitchGrid() {
  const { selectedIds, count } = useBasket();

  const total = Array.from(selectedIds).reduce((sum, id) => {
    const section = getSectionById(id);
    return sum + (section?.price ?? 0);
  }, 0);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div
          className="grid gap-0.5"
          style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(2rem, 1fr))`, minWidth: "40rem" }}
        >
          {pitchSections.map((section) => (
            <PitchSectionCell key={section.id} section={section} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {count} section{count !== 1 ? "s" : ""} selected &mdash; Total: <strong>£{total}</strong>
        </p>
        <Button asChild disabled={count === 0}>
          <Link href="/basket">View Basket</Link>
        </Button>
      </div>
    </div>
  );
}

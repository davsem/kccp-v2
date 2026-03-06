"use client";

import type { PitchSection, PurchasedSection } from "@/lib/types";
import { useBasket } from "@/lib/basket-context";
import { cn } from "@/lib/utils";

interface PitchSectionCellProps {
  section: PitchSection;
  purchased?: PurchasedSection;
}

export function PitchSectionCell({ section, purchased }: PitchSectionCellProps) {
  const { toggle, isSelected } = useBasket();
  const selected = isSelected(section.id);
  const isSold = !!purchased;

  const ownerLabel =
    isSold && purchased!.show_owner_name && purchased!.owner_name
      ? purchased!.owner_name
      : undefined;

  const title = isSold
    ? ownerLabel
      ? `${section.label} — Sponsored by ${ownerLabel}`
      : `${section.label} — Sold`
    : `${section.label} — £${section.price}`;

  return (
    <button
      type="button"
      title={title}
      disabled={isSold || !section.available}
      onClick={() => !isSold && toggle(section.id)}
      className={cn(
        "aspect-square w-full rounded-sm border text-[9px] font-medium transition-colors",
        isSold
          ? "cursor-not-allowed border-slate-400 bg-slate-300 text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400"
          : section.available
            ? selected
              ? "border-amber-500 bg-amber-400 text-amber-900 hover:bg-amber-300"
              : "border-green-600 bg-green-500 text-green-900 hover:bg-green-400"
            : "cursor-not-allowed border-muted bg-muted text-muted-foreground"
      )}
    >
      {section.label}
    </button>
  );
}

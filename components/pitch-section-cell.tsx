"use client";

import type { PitchSection } from "@/lib/types";
import { useBasket } from "@/lib/basket-context";
import { cn } from "@/lib/utils";

export function PitchSectionCell({ section }: { section: PitchSection }) {
  const { toggle, isSelected } = useBasket();
  const selected = isSelected(section.id);

  return (
    <button
      type="button"
      title={`${section.label} — £${section.price}`}
      disabled={!section.available}
      onClick={() => toggle(section.id)}
      className={cn(
        "aspect-square w-full rounded-sm border text-[9px] font-medium transition-colors",
        section.available
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

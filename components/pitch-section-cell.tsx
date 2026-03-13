"use client";

import type { PitchSection } from "@/lib/types";
import { useBasket } from "@/lib/basket-context";
import { cn } from "@/lib/utils";

interface PitchSectionCellProps {
  section: PitchSection;
  isSold: boolean;
  tabIndex?: number;
  onFocus?: () => void;
}

export function PitchSectionCell({ section, isSold, tabIndex, onFocus }: PitchSectionCellProps) {
  const { toggle, isSelected } = useBasket();
  const selected = isSelected(section.id);

  if (isSold) {
    return (
      <button
        type="button"
        aria-label={`Section ${section.label} — Sold`}
        aria-disabled="true"
        data-section-id={section.id}
        tabIndex={tabIndex}
        onFocus={onFocus}
        className="w-full h-full cursor-not-allowed rounded-sm border border-slate-400/50 bg-slate-300/50 transition-colors"
      />
    );
  }

  const state = selected ? "Selected — click to deselect" : "Available — click to select";

  return (
    <button
      type="button"
      aria-label={`Section ${section.label} — £${section.price} — ${state}`}
      aria-pressed={selected}
      disabled={!section.available}
      data-section-id={section.id}
      tabIndex={tabIndex}
      onFocus={onFocus}
      onClick={() => toggle(section.id)}
      className={cn(
        "w-full h-full rounded-sm border transition-colors",
        section.available
          ? selected
            ? "border-amber-500/60 bg-amber-400/60 hover:bg-amber-400/80"
            : "border-green-600/40 bg-green-500/40 hover:bg-green-500/60"
          : "cursor-not-allowed border-muted/50 bg-muted/30"
      )}
    />
  );
}

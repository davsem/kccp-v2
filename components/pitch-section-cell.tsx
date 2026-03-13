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
        className="w-full h-full cursor-not-allowed rounded-sm border border-pitch-sold-border transition-colors"
        style={{
          background: `repeating-linear-gradient(-45deg, var(--pitch-sold) 0px, var(--pitch-sold) 1.5px, transparent 1.5px, transparent 5px)`,
        }}
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
            ? "border-pitch-selected-border bg-pitch-selected/70 hover:bg-pitch-selected-hover/85"
            : "border-pitch-available-border bg-pitch-available/35 hover:bg-pitch-available-hover/55"
          : "cursor-not-allowed border-muted/50 bg-muted/30"
      )}
    />
  );
}

"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useBasket } from "@/lib/basket-context";
import { pitchSections, getSectionById, GRID_COLS, GRID_ROWS } from "@/lib/pitch-data";
import { PitchSectionCell } from "@/components/pitch-section-cell";
import { Button } from "@/components/ui/button";
import type { PurchasedSection } from "@/lib/types";

interface PitchGridProps {
  purchasedSections?: PurchasedSection[];
}

interface TooltipState {
  content: string;
  detail?: string;
  x: number;
  y: number;
}

export function PitchGrid({ purchasedSections = [] }: PitchGridProps) {
  const { count, isSelected, selectedIds } = useBasket();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const purchasedMap = useMemo(() => new Map(
      purchasedSections.map((ps) => [ps.section_id, ps])
    ), [purchasedSections]
  );

  const total = Array.from(selectedIds).reduce((sum, id) => {
    const s = getSectionById(id);
    return sum + (s?.price ?? 0);
  }, 0);

  const handlePointerEnter = useCallback(
    (e: React.PointerEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-section-id]"
      );
      if (!target) return;
      const id = target.dataset.sectionId || null;
      if (!id) return;
      const section = getSectionById(id);
      if (!section) return;

      const purchased = purchasedMap.get(id);
      const rect = target.getBoundingClientRect();

      let content: string;
      let detail: string | undefined;

      if (purchased) {
        content = section.label;
        detail =
          purchased.show_owner_name && purchased.owner_name
            ? `Sponsored by ${purchased.owner_name}`
            : "Anonymous Sponsor";
      } else {
        const state = isSelected(id) ? "Selected" : "Available";
        content = `${section.label} — £${section.price} — ${state}`;
      }

      setTooltip({
        content,
        detail,
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [purchasedMap, isSelected]
  );

  const handlePointerLeave = useCallback(
    (e: React.PointerEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      if (related?.closest?.("[data-section-id]")) return;
      setTooltip(null);
    },
    []
  );

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div
          className="min-w-[768px] w-full"
          style={{
            aspectRatio: "544.25 / 327.35",
            backgroundImage: "url('/pitch.svg')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            padding: "0.6%",
          }}
        >
          <div
            ref={gridRef}
            className="grid gap-0.5 h-full"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
            }}
            onPointerEnter={handlePointerEnter}
            onPointerOver={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
          >
            {pitchSections.map((section) => (
              <PitchSectionCell
                key={section.id}
                section={section}
                isSold={purchasedMap.has(section.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-md border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%) translateY(-6px)",
          }}
        >
          <p className={tooltip.detail ? "font-semibold" : undefined}>
            {tooltip.content}
          </p>
          {tooltip.detail && (
            <p className="text-muted-foreground">{tooltip.detail}</p>
          )}
        </div>
      )}

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

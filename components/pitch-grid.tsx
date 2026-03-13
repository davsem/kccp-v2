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

// Half the estimated maximum tooltip width in px — used to clamp tooltip within viewport
const TOOLTIP_HALF_WIDTH = 110;

export function PitchGrid({ purchasedSections = [] }: PitchGridProps) {
  const { count, isSelected, selectedIds } = useBasket();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [mobileStatus, setMobileStatus] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  const purchasedMap = useMemo(() => new Map(
      purchasedSections.map((ps) => [ps.section_id, ps])
    ), [purchasedSections]
  );

  const priceTotal = useMemo(
    () =>
      Array.from(selectedIds).reduce((sum, id) => {
        const s = getSectionById(id);
        return sum + (s?.price ?? 0);
      }, 0),
    [selectedIds]
  );

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
      // Clamp x so tooltip never clips at viewport edges (M3)
      const clampedX = Math.max(
        TOOLTIP_HALF_WIDTH,
        Math.min(rect.left + rect.width / 2, window.innerWidth - TOOLTIP_HALF_WIDTH)
      );

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

      setTooltip({ content, detail, x: clampedX, y: rect.top });
    },
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

  // Mobile-only: show section info in a status bar on tap (C3)
  const handleGridClick = useCallback(
    (e: React.MouseEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>("[data-section-id]");
      if (!target) return;
      const id = target.dataset.sectionId || null;
      if (!id) return;
      const section = getSectionById(id);
      if (!section) return;

      if (purchasedMap.has(id)) {
        setMobileStatus(`${section.label} — Sold`);
        return;
      }
      // By the time this handler fires, the cell's onClick has already toggled the basket
      const nowSelected = isSelected(id);
      setMobileStatus(
        `${section.label} — £${section.price} — ${nowSelected ? "Added to basket" : "Removed"}`
      );
    },
    [purchasedMap, isSelected]
  );

  // Arrow-key roving tabindex for keyboard navigation (H7)
  const handleGridKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
      e.preventDefault();

      let next = focusedIndex;
      if (e.key === "ArrowRight") next = Math.min(focusedIndex + 1, pitchSections.length - 1);
      if (e.key === "ArrowLeft") next = Math.max(focusedIndex - 1, 0);
      if (e.key === "ArrowDown") next = Math.min(focusedIndex + GRID_COLS, pitchSections.length - 1);
      if (e.key === "ArrowUp") next = Math.max(focusedIndex - GRID_COLS, 0);

      if (next !== focusedIndex) {
        setFocusedIndex(next);
        const cells = gridRef.current?.querySelectorAll<HTMLElement>("[data-section-id]");
        cells?.[next]?.focus();
      }
    },
    [focusedIndex]
  );

  return (
    <div className="space-y-4">
      <div
        className="overflow-x-auto"
        style={{
          maxHeight: "70vh",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-x pan-y pinch-zoom",
        }}
      >
        <div
          className="min-w-[600px] w-full"
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
            aria-label="Pitch sections — use arrow keys to navigate, Space or Enter to select"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
            }}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onClick={handleGridClick}
            onKeyDown={handleGridKeyDown}
          >
            {pitchSections.map((section, index) => (
              <PitchSectionCell
                key={section.id}
                section={section}
                isSold={purchasedMap.has(section.id)}
                tabIndex={index === focusedIndex ? 0 : -1}
                onFocus={() => setFocusedIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile-only status bar — shows last-tapped section info (C3) */}
      {mobileStatus && (
        <p
          aria-live="polite"
          aria-atomic="true"
          className="text-sm text-center text-muted-foreground sm:hidden"
        >
          {mobileStatus}
        </p>
      )}

      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 hidden sm:block rounded-md border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md"
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

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {count} section{count !== 1 ? "s" : ""} selected &mdash; Total: <strong>£{priceTotal}</strong>
        </p>
        {/* M9: don't use asChild+Link when disabled — <a> ignores the disabled attribute */}
        {count === 0 ? (
          <Button disabled>View Basket</Button>
        ) : (
          <Button asChild>
            <Link href="/basket">View Basket</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

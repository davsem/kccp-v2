"use client";

import { useState } from "react";
import type { PitchSection, PurchasedSection } from "@/lib/types";
import { useBasket } from "@/lib/basket-context";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface PitchSectionCellProps {
  section: PitchSection;
  purchased?: PurchasedSection;
}

export function PitchSectionCell({ section, purchased }: PitchSectionCellProps) {
  const { toggle, isSelected } = useBasket();
  const selected = isSelected(section.id);
  const isSold = !!purchased;

  if (isSold && purchased) {
    return <SoldCell section={section} purchased={purchased} />;
  }

  const title = `${section.label} — £${section.price}`;

  return (
    <button
      type="button"
      title={title}
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

function SoldCell({
  section,
  purchased,
}: {
  section: PitchSection;
  purchased: PurchasedSection;
}) {
  const [open, setOpen] = useState(false);

  const sponsorLabel =
    purchased.show_owner_name && purchased.owner_name
      ? `Sponsored by ${purchased.owner_name}`
      : "Anonymous Sponsor";

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-disabled="true"
          onClick={() => setOpen((prev) => !prev)}
          className="aspect-square w-full cursor-not-allowed rounded-sm border border-slate-400 bg-slate-300 text-[9px] font-medium text-slate-500 transition-colors dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400"
        >
          {section.label}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-semibold">{section.label}</p>
        <p className="text-muted-foreground">{sponsorLabel}</p>
      </TooltipContent>
    </Tooltip>
  );
}

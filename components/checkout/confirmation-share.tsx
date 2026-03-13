"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";

interface Props {
  sectionCount: number;
}

export function ConfirmationShare({ sectionCount }: Props) {
  const [copied, setCopied] = useState(false);

  const shareText =
    `I just sponsored ${sectionCount} section${sectionCount !== 1 ? "s" : ""} of the Khalsa Community Pitch! ` +
    `Help us build a new artificial hockey pitch for the club. 🏑 #KhalsaHockey`;

  const handleShare = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Khalsa Community Pitch Project",
          text: shareText,
        });
        return;
      } catch {
        // User cancelled or API unavailable — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Clipboard unavailable — silently no-op
    }
  };

  return (
    <div className="rounded-xl border bg-muted/40 p-5 space-y-3">
      <p className="font-semibold text-sm">Help spread the word</p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Every share brings us closer to a full pitch. Tell your community.
      </p>
      <Button variant="outline" size="sm" onClick={() => { void handleShare(); }} className="gap-2">
        {copied ? (
          <>
            <Check className="size-4" aria-hidden="true" />
            <span>Copied to clipboard</span>
          </>
        ) : (
          <>
            <Share2 className="size-4" aria-hidden="true" />
            <span>Share your support</span>
          </>
        )}
      </Button>
    </div>
  );
}

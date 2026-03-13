import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { PitchGrid } from "@/components/pitch-grid";
import type { PurchasedSection } from "@/lib/types";

export const metadata = {
  title: "The Pitch — Khalsa Community Pitch Project",
};

async function PitchGridLoader() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchased_sections")
    .select("section_id, owner_name, show_owner_name");

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center space-y-3">
        <p className="font-semibold text-destructive">Unable to load pitch data</p>
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t verify which sections have already been purchased. Please try again before making a selection.
        </p>
        <a
          href="/pitch"
          className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </a>
      </div>
    );
  }

  const purchasedSections: PurchasedSection[] = (data ?? []) as PurchasedSection[];
  return <PitchGrid purchasedSections={purchasedSections} />;
}

function PitchGridSkeleton() {
  return (
    <div className="space-y-4">
      <div
        className="overflow-x-auto border rounded-lg animate-pulse bg-muted/40"
        style={{ minHeight: "min(70vh, 420px)" }}
      />
      <div className="flex justify-between items-center">
        <div className="h-4 w-40 rounded bg-muted animate-pulse" />
        <div className="h-9 w-28 rounded-md bg-muted animate-pulse" />
      </div>
    </div>
  );
}

export default function PitchPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">The Pitch</h1>
        <p className="mt-1 text-muted-foreground">
          Click any green section to add it to your basket. Each section costs £50.
        </p>
        <p className="mt-1 text-sm text-muted-foreground md:hidden">
          Pinch to zoom and scroll to explore the full pitch.
        </p>
      </div>
      <Suspense fallback={<PitchGridSkeleton />}>
        <PitchGridLoader />
      </Suspense>
    </div>
  );
}

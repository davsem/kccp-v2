import { createClient } from "@/lib/supabase/server";
import { PitchGrid } from "@/components/pitch-grid";
import type { PurchasedSection } from "@/lib/types";

export const metadata = {
  title: "The Pitch — Khalsa Community Pitch Project",
};

export default async function PitchPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("purchased_sections")
    .select("section_id, owner_name, show_owner_name");

  const purchasedSections: PurchasedSection[] = (data ?? []) as PurchasedSection[];

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
      <PitchGrid purchasedSections={purchasedSections} />
    </div>
  );
}

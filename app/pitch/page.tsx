import { PitchGrid } from "@/components/pitch-grid";

export const metadata = {
  title: "The Pitch — Khalsa Community Pitch Project",
};

export default function PitchPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">The Pitch</h1>
        <p className="mt-1 text-muted-foreground">
          Click any green section to add it to your basket. Centre sections are
          £100; all others are £50.
        </p>
      </div>
      <PitchGrid />
    </div>
  );
}

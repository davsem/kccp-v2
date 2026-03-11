import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">
          Khalsa Community Pitch Project
        </h1>
        <p className="text-xl text-muted-foreground">
          Help Khalsa &amp; Leamington Hockey Club build a world-class artificial pitch.
        </p>
      </div>

      <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
        We&apos;re raising funds by selling individual 1m² sections of our new
        artificial hockey pitch. Sponsor a section — or several — and your name
        will be part of our club&apos;s history. Every square matters.
      </p>

      <Button asChild size="lg">
        <Link href="/pitch">Browse The Pitch</Link>
      </Button>
    </div>
  );
}

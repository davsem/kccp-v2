import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Khalsa Community Pitch Project — Sponsor a Section",
  description:
    "Help Khalsa & Leamington Hockey Club build a world-class artificial pitch. Sponsor a 1m² section from £50 — your name becomes part of our club's story.",
};

export default function Home() {
  return (
    <section className="relative overflow-hidden bg-brand-crimson text-white">
      {/* Pitch texture — very faint background depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "url('/pitch.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Hero content */}
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:gap-16 md:py-28">

        {/* Left: copy */}
        <div className="space-y-8">

          {/* Logo */}
          <div className="animate-fade-in">
            <Image
              src="/logo.png"
              alt="Khalsa Hockey Club"
              width={200}
              height={200}
              className="w-auto"
              priority
            />
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl font-bold leading-[1.06] tracking-tight animate-slide-up sm:text-6xl lg:text-7xl">
            Help us build<br />
            <em className="not-italic text-brand-gold">our pitch.</em>
          </h1>

          {/* Subtext */}
          <p
            className="max-w-md text-base leading-relaxed text-white/75 animate-slide-up sm:text-lg"
            style={{ animationDelay: "150ms" }}
          >
            Sponsor a 1m² section of Khalsa &amp; Leamington Hockey Club&apos;s
            new artificial pitch — and your name becomes part of our
            community&apos;s story, forever.
          </p>

          {/* CTA */}
          <div
            className="flex flex-wrap items-center gap-4 animate-slide-up"
            style={{ animationDelay: "300ms" }}
          >
            <Button
              asChild
              size="lg"
              className="bg-brand-gold text-brand-crimson font-bold text-base hover:bg-brand-gold/90 focus-visible:ring-brand-gold/50"
            >
              <Link href="/pitch">Browse the pitch →</Link>
            </Button>
            <p className="text-sm text-white/50">Sections from £50</p>
          </div>
        </div>

        {/* Right: pitch preview */}
        <div
          className="animate-slide-up"
          style={{ animationDelay: "200ms" }}
        >
          <div className="overflow-hidden border border-white/[0.12] bg-white/[0.06] shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/pitch.svg"
              alt="Pitch layout — 200 sponsorable 1m² sections arranged in a 20×10 grid"
              className="w-full"
            />
          </div>
          <p className="mt-3 text-center text-xs text-white/40">
            200 individual 1m² sections — each one yours to sponsor
          </p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="relative border-t border-white/10">
        <dl className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-white/10 px-4">
          {[
            { value: "200", label: "sections" },
            { value: "£50–100", label: "per section" },
            { value: "Forever", label: "on the pitch" },
          ].map(({ value, label }) => (
            <div key={label} className="py-6 text-center">
              <dt className="text-xl font-bold text-brand-gold sm:text-2xl">
                {value}
              </dt>
              <dd className="mt-0.5 text-xs uppercase tracking-widest text-white/50">
                {label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

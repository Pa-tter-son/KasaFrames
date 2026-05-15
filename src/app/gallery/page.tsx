import type { Metadata } from "next";
import { GalleryExplorer } from "@/components/gallery/gallery-explorer";

export const metadata: Metadata = {
  title: "Portfolio gallery",
  description: "A curated gallery of KasaFrames installations—living rooms, staircases, offices, hospitality, and more.",
};

export default function GalleryPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Portfolio</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl text-balance">
          Walls that read like editorial spreads.
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">
          Filter by space type or search by mood. Each project is composed for real life—not showroom fantasy.
        </p>
      </header>

      <div className="mt-12">
        <GalleryExplorer />
      </div>
    </div>
  );
}

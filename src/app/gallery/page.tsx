import type { Metadata } from "next";
import { GalleryExplorer } from "@/components/gallery/gallery-explorer";
import { loadGalleryItems } from "@/lib/data/media";

export const metadata: Metadata = {
  title: "Portfolio gallery",
  description:
    "KasaFrames work by finish—acrylic gloss, matte framed, canvas wrap, photo blocks, gallery walls and staircase cascades.",
};

export default function GalleryPage() {
  // Read at build time from public/media/, so adding a photo needs no code change.
  const items = loadGalleryItems();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Portfolio</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl text-balance">
          Walls that read like editorial spreads.
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">
          Filter by finish—acrylic gloss, matte framed, canvas wrap, photo block—or by the kind of wall you are
          planning. Tap any piece for the sizes and spacing behind it.
        </p>
      </header>

      <div className="mt-12">
        <GalleryExplorer items={items} />
      </div>
    </div>
  );
}

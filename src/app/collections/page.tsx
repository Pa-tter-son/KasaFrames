import type { Metadata } from "next";
import { CollectionsExplorer } from "@/components/collections/collections-explorer";

export const metadata: Metadata = {
  title: "Collections",
  description: "Explore KasaFrames signature framing systems—ring, canvas, thick edge, and float.",
};

export default function CollectionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Collections</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl text-balance">
          Interior-grade systems—not “frames off a shelf.”
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">
          Filter by mood or keyword, then step into a collection for styling notes, layouts, and configured pieces.
        </p>
      </header>

      <div className="mt-12">
        <CollectionsExplorer />
      </div>
    </div>
  );
}

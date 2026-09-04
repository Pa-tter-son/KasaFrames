import type { Metadata } from "next";
import { MockupPreview } from "@/components/visualizer/mockup-preview";

export const metadata: Metadata = {
  title: "Your wall preview",
  description: "The wall you composed, at full size, with the cost of every piece.",
};

export default function VisualizerPreviewPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Preview</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl text-balance">
          Here is the wall, before anything is ordered.
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">
          Every piece at true size against your wall, with what each one costs. Send it to the studio and we will
          take it from here.
        </p>
      </header>

      <div className="mt-12">
        <MockupPreview />
      </div>
    </div>
  );
}

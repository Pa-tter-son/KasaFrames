import type { Metadata } from "next";
import { WallVisualizer } from "@/components/visualizer/wall-visualizer";

export const metadata: Metadata = {
  title: "Wall visualizer",
  description: "Upload your wall and preview KasaFrames compositions—drag, scale, and test layouts.",
};

export default function VisualizerPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Visualizer</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl text-balance">
          See the composition before we install a single anchor.
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">
          MVP preview tool: upload, drag frames, switch styles, and test scale. Final curation still happens with our team.
        </p>
      </header>

      <div className="mt-12">
        <WallVisualizer />
      </div>
    </div>
  );
}

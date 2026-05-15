import type { Metadata } from "next";
import { ConsultationBooker } from "@/components/book/consultation-booker";

export const metadata: Metadata = {
  title: "Book consultation",
  description: "Schedule a home visit or virtual consultation with KasaFrames.",
};

export default function BookPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Consultation</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl text-balance">
          Begin with listening. End with a wall that feels inevitable.
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">
          Share your space, your dimensions, and your references. We’ll respond with a composed direction—not a catalog PDF.
        </p>
      </header>

      <div className="mt-12">
        <ConsultationBooker />
      </div>
    </div>
  );
}

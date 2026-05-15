import type { Metadata } from "next";
import { ContactPanel } from "@/components/contact/contact-panel";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact KasaFrames for consultations, collaborations, and commercial wall styling across Accra.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Contact</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl text-balance">
          Speak with the studio.
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">
          For fastest routing, WhatsApp us with a photo of your wall and approximate dimensions.
        </p>
      </header>

      <div className="mt-12">
        <ContactPanel />
      </div>
    </div>
  );
}

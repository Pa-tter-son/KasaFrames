import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "KasaFrames is a Ghana-based luxury wall aesthetics studio transforming interiors across Accra.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">About</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl text-balance">
          Modern Ghanaian aesthetics, composed with global editorial discipline.
        </h1>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-center">
        <Reveal className="relative aspect-[16/12] overflow-hidden rounded-[2rem] border border-kasa-black/10 dark:border-white/10">
          <Image
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=80"
            alt="KasaFrames interior"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </Reveal>
        <Reveal>
          <p className="text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">
            KasaFrames exists because walls are architecture too often treated as afterthoughts. We work like an interior studio—
            measuring light, rhythm, and daily movement—then specifying framing systems that feel native to the room.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">
            Our practice blends African-luxury warmth with minimalist precision: matte blacks, soft creams, gold accents used
            sparingly, and installations executed with the calm confidence of a private gallery.
          </p>
          <Button asChild className="mt-8" size="lg">
            <Link href="/book">Book a consultation</Link>
          </Button>
        </Reveal>
      </div>

      <section className="mt-20 grid gap-8 border-t border-kasa-black/10 pt-16 dark:border-white/10 lg:grid-cols-3">
        {[
          {
            title: "Mission",
            body: "Transform empty walls into modern statement spaces—without visual noise.",
          },
          {
            title: "Philosophy",
            body: "Composition first. Product second. Installation as the final brushstroke.",
          },
          {
            title: "Craft",
            body: "Behind-the-scenes tolerances, edge control, and hardware you never see—but always feel.",
          },
        ].map((b) => (
          <Reveal key={b.title}>
            <h2 className="font-display text-xl font-semibold">{b.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">{b.body}</p>
          </Reveal>
        ))}
      </section>
    </div>
  );
}

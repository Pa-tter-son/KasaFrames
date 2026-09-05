import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Installation experience",
  description: "White-glove installation, precision alignment, and calm project management across Accra.",
};

export default function InstallationPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Installation</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl text-balance">
          The install is where luxury becomes real.
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">
          Dust control, laser alignment, and quiet coordination—so your home or venue stays composed.
        </p>
      </header>

      <section className="mt-14 grid gap-8 lg:grid-cols-3">
        {[
          { title: "Survey & mark", body: "Stud mapping, load planning, and sightline checks before any anchor touches the wall." },
          { title: "Precision hang", body: "Micro-adjustments until the composition reads as one gesture—not separate objects." },
          { title: "Reveal & care", body: "Final cleaning, hardware concealment, and guidance on maintaining the finish." },
        ].map((s) => (
          <Reveal key={s.title} className="rounded-[2rem] border border-kasa-black/10 bg-white/70 p-8 dark:border-white/10 dark:bg-white/5">
            <h2 className="font-display text-xl font-semibold">{s.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">{s.body}</p>
          </Reveal>
        ))}
      </section>

      <section className="mt-16 grid gap-6 sm:grid-cols-2">
        {[
          { src: "/media/gallery-wall/corridor-portrait-grid.jpg", caption: "Corridor grid · A4 and A3, black moulding" },
          { src: "/media/staircase/stair-cascade-quotes.jpg", caption: "Stair cascade · set out from the nosing, not the floor" },
        ].map((shot) => (
          <Reveal key={shot.src} className="overflow-hidden rounded-[2rem] border border-kasa-black/10 dark:border-white/10">
            <div className="relative aspect-[4/3]">
              <Image src={shot.src} alt={shot.caption} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
            </div>
            <p className="border-t border-kasa-black/10 px-6 py-4 text-sm text-kasa-muted dark:border-white/10 dark:text-kasa-sand/80">
              {shot.caption}
            </p>
          </Reveal>
        ))}
      </section>

      <section className="mt-16">
        <Reveal className="relative aspect-[21/9] overflow-hidden rounded-[2rem] border border-kasa-black/10 dark:border-white/10">
          <Image
            src="/media/gallery-wall/corridor-salon-wall.jpg"
            alt="Time-lapse still"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-kasa-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 max-w-xl text-kasa-cream">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-kasa-gold">Time-lapse</p>
            <p className="mt-2 text-sm text-kasa-sand/90">
              Replace this hero with a hosted video (Mux / Vimeo) for a cinematic install story—optimized for mobile streaming.
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

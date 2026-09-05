"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { Ruler, Scan, Wallet } from "lucide-react";

/**
 * Took the place of a "Before / After" block that paired two unrelated finished
 * photographs as though they were the same wall. This sells the thing we can
 * actually prove: try it on your own wall before you spend anything.
 */
const points = [
  { icon: Scan, text: "Photograph your wall and mark its corners—pieces hang in the room's own perspective." },
  { icon: Ruler, text: "Everything is drawn at true size against the measurements you give us." },
  { icon: Wallet, text: "The cost updates as you go, from the same price list we quote from." },
];

export function VisualizerPromo() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
      <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
        <Reveal className="lg:col-span-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Before you commit</p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl text-balance">
            See it on your wall first.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">
            Guessing whether a 16 × 20 will look small over the sofa is how people end up with the wrong frame. Put
            your own photograph in, and find out before anything is made.
          </p>

          <ul className="mt-8 grid gap-4">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex gap-3 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-kasa-gold" />
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/visualizer">Open the visualizer</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/collections">Browse the frame types</Link>
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="lg:col-span-6">
          <div className="relative overflow-hidden rounded-[2rem] border border-kasa-black/10 shadow-card dark:border-white/10">
            <div className="relative aspect-[4/3]">
              <Image
                src="/media/rooms/loft-sofa.jpg"
                alt="A living room wall ready for framing"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Indicative frames, drawn to show what the tool does. */}
              <div className="absolute inset-0">
                {[38, 50, 62].map((left) => (
                  <span
                    key={left}
                    className="absolute block rounded-[2px] border-[3px] border-kasa-black bg-white/70 shadow-lg"
                    style={{ left: `${left}%`, top: "30%", width: "9%", height: "22%", transform: "translateX(-50%)" }}
                  />
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

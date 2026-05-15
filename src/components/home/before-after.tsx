"use client";

import Image from "next/image";
import { useState } from "react";
import { beforeAfter } from "@/lib/data/site";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export function BeforeAfterSection() {
  const [i, setI] = useState(0);
  const item = beforeAfter[i];

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Transformations</p>
        <h2 className="mt-4 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl text-balance">
          Before silence. After story.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">
          Real walls, real light, real scale—composed the way interior designers think about space.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Reveal className="relative overflow-hidden rounded-[2rem] border border-kasa-black/10 bg-white/50 shadow-card dark:border-white/10 dark:bg-white/5">
          <div className="grid grid-cols-2">
            <div className="relative aspect-[4/5]">
              <Image src={item.before} alt="Before" fill className="object-cover" sizes="(max-width: 1024px) 50vw, 25vw" />
              <span className="absolute left-4 top-4 rounded-full bg-kasa-black/70 px-3 py-1 text-xs font-semibold text-kasa-cream backdrop-blur">
                Before
              </span>
            </div>
            <div className="relative aspect-[4/5]">
              <Image src={item.after} alt="After" fill className="object-cover" sizes="(max-width: 1024px) 50vw, 25vw" />
              <span className="absolute left-4 top-4 rounded-full bg-kasa-gold/90 px-3 py-1 text-xs font-semibold text-kasa-black backdrop-blur">
                After
              </span>
            </div>
          </div>
          <p className="border-t border-kasa-black/10 px-6 py-4 text-sm text-kasa-muted dark:border-white/10 dark:text-kasa-sand/80">
            {item.caption}
          </p>
        </Reveal>

        <Reveal className="flex flex-col justify-between gap-6 rounded-[2rem] border border-kasa-black/10 bg-kasa-sand/30 p-8 dark:border-white/10 dark:bg-white/5">
          <div>
            <h3 className="font-display text-2xl font-semibold">See another wall</h3>
            <p className="mt-3 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">
              Toggle between recent compositions. Each project begins with listening—then lighting, then layout.
            </p>
          </div>
          <div className="flex gap-2">
            {beforeAfter.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setI(idx)}
                className={cn(
                  "h-2 flex-1 rounded-full transition",
                  idx === i ? "bg-kasa-black dark:bg-kasa-cream" : "bg-kasa-black/15 dark:bg-white/15",
                )}
                aria-label={`Show transformation ${idx + 1}`}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

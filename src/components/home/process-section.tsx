"use client";

import { processSteps } from "@/lib/data/site";
import { Reveal } from "@/components/motion/reveal";

export function ProcessSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">The experience</p>
        <h2 className="mt-4 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl text-balance">
          A quiet process. A loud transformation.
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {processSteps.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.06} className="rounded-[2rem] border border-kasa-black/10 bg-white/70 p-8 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-kasa-muted">0{i + 1}</p>
            <h3 className="mt-4 font-display text-xl font-semibold">{s.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">{s.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

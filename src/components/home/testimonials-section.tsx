"use client";

import { testimonials } from "@/lib/data/site";
import { Reveal } from "@/components/motion/reveal";

export function TestimonialsSection() {
  return (
    <section className="border-y border-kasa-black/10 bg-kasa-sand/25 py-20 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Voices</p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl text-balance">
            Trusted where aesthetics matter.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.06} className="rounded-[2rem] border border-kasa-black/10 bg-kasa-cream p-8 dark:border-white/10 dark:bg-kasa-charcoal">
              <p className="text-sm leading-relaxed text-kasa-black/85 dark:text-kasa-cream/90">“{t.quote}”</p>
              <div className="mt-8">
                <p className="font-medium">{t.name}</p>
                <p className="mt-1 text-xs text-kasa-muted">{t.role}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

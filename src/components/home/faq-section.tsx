"use client";

import { useState } from "react";
import { faqs } from "@/lib/data/site";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export function FaqSection() {
  const [open, setOpen] = useState(0);

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">FAQ</p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl text-balance">
            Answers, calmly delivered.
          </h2>
        </Reveal>
        <div className="lg:col-span-8">
          <div className="divide-y divide-kasa-black/10 dark:divide-white/10">
            {faqs.map((item, i) => {
              const isOpen = open === i;
              return (
                <Reveal key={item.q} delay={i * 0.04}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="flex w-full items-start justify-between gap-6 py-6 text-left"
                  >
                    <span className="font-medium">{item.q}</span>
                    <ChevronDown className={cn("mt-1 h-4 w-4 shrink-0 transition", isOpen && "rotate-180")} />
                  </button>
                  {isOpen ? <p className="pb-6 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">{item.a}</p> : null}
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

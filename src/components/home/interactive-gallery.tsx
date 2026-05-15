"use client";

import Image from "next/image";
import { useRef } from "react";
import { collections } from "@/lib/data/catalog";
import { Reveal } from "@/components/motion/reveal";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function InteractiveGallery() {
  const scroller = useRef<HTMLDivElement>(null);

  return (
    <section className="border-y border-kasa-black/10 bg-white/40 py-20 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Interactive gallery</p>
          <h2 className="mt-4 max-w-xl font-display text-3xl font-semibold tracking-tight sm:text-4xl text-balance">
            Scroll the wall. Feel the scale.
          </h2>
        </Reveal>
        <Reveal className="max-w-md text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">
          A tactile preview of how KasaFrames reads in real rooms—living, stair, office, hospitality.
        </Reveal>
      </div>

      <div ref={scroller} className="no-scrollbar mt-10 flex gap-4 overflow-x-auto px-4 pb-2 sm:px-6 lg:px-8">
        {collections.map((c) => (
          <Link
            key={c.slug}
            href={`/collections/${c.slug}`}
            className="group relative h-[420px] w-[min(78vw,320px)] flex-none overflow-hidden rounded-[2rem] border border-kasa-black/10 bg-kasa-black shadow-lift dark:border-white/10"
          >
            <Image
              src={c.heroImage}
              alt={c.title}
              fill
              className="object-cover opacity-90 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-100"
              sizes="320px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-kasa-black via-kasa-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-kasa-cream">
              <div className="flex items-center justify-between gap-3">
                <p className="font-display text-xl font-semibold">{c.title}</p>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur transition group-hover:bg-kasa-gold group-hover:text-kasa-black">
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-kasa-sand/80">{c.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

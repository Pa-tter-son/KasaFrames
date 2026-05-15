"use client";

import Link from "next/link";
import Image from "next/image";
import { collections } from "@/lib/data/catalog";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";

export function CollectionsPreview() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Collections</p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl text-balance">
            Four systems. Infinite compositions.
          </h2>
        </div>
        <Link href="/collections" className="text-sm font-semibold text-kasa-black underline-offset-4 hover:underline dark:text-kasa-cream">
          View all collections
        </Link>
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-12">
        {collections.map((c, idx) => (
          <Reveal
            key={c.slug}
            delay={idx * 0.05}
            className={idx === 0 ? "lg:col-span-7" : idx === 1 ? "lg:col-span-5" : idx === 2 ? "lg:col-span-5" : "lg:col-span-7"}
          >
            <Link
              href={`/collections/${c.slug}`}
              className="group relative block overflow-hidden rounded-[2rem] border border-kasa-black/10 bg-kasa-black shadow-card dark:border-white/10"
            >
              <div className={idx % 2 === 0 ? "relative aspect-[16/11] w-full" : "relative aspect-[16/12] w-full"}>
                <Image
                  src={c.heroImage}
                  alt={c.title}
                  fill
                  className="object-cover opacity-90 transition duration-700 group-hover:scale-[1.02] group-hover:opacity-100"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-kasa-black via-kasa-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8 text-kasa-cream">
                <Badge variant="gold" className="mb-3 border-kasa-gold/40 bg-kasa-gold/15 text-kasa-cream">
                  Signature
                </Badge>
                <p className="font-display text-2xl font-semibold">{c.title}</p>
                <p className="mt-2 max-w-prose text-sm text-kasa-sand/80">{c.mood}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

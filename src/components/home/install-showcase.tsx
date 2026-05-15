"use client";

import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

export function InstallShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <Reveal className="relative aspect-[16/12] overflow-hidden rounded-[2rem] border border-kasa-black/10 shadow-lift dark:border-white/10">
          <Image
            src="https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1800&q=80"
            alt="Professional installation"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-kasa-black/40 via-transparent to-transparent" />
        </Reveal>
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Installation</p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl text-balance">
            Precision is part of the product.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">
            Laser levels, dust control, and hardware engineered for Ghana’s climate cycles. We leave walls gallery-quiet.
          </p>
          <Button asChild className="mt-8" size="lg">
            <Link href="/installation">See the install experience</Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

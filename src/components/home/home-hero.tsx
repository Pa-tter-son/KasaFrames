"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2400&q=80"
          alt="Luxury interior wall with curated frames"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-kasa-black/70 via-kasa-black/55 to-kasa-cream dark:to-kasa-black" />
      </div>

      <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pb-24 lg:pt-32">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-xs font-semibold uppercase tracking-[0.35em] text-kasa-gold"
        >
          Accra · Luxury wall aesthetics
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-4xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-kasa-cream sm:text-6xl lg:text-7xl text-balance"
        >
          Luxury wall aesthetics for modern spaces.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-2xl text-base leading-relaxed text-kasa-sand/90 sm:text-lg"
        >
          Transform your empty walls into statement compositions—curated like interior architecture, installed with
          white-glove precision.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <Button asChild size="lg" variant="gold" className="h-12 px-8 text-base">
            <Link href="/book">
              Book consultation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="h-12 border-white/15 bg-white/10 px-8 text-base text-kasa-cream hover:bg-white/15"
          >
            <Link href="/collections">
              Explore collections
              <Play className="h-4 w-4 opacity-80" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="h-12 px-6 text-kasa-cream hover:bg-white/10"
          >
            <Link href="/visualizer">Wall visualizer</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.35 }}
          className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-white/15 pt-8 text-kasa-cream"
        >
          <div>
            <p className="font-display text-2xl font-semibold">500+</p>
            <p className="mt-1 text-xs text-kasa-sand/70">Walls transformed</p>
          </div>
          <div>
            <p className="font-display text-2xl font-semibold">48h</p>
            <p className="mt-1 text-xs text-kasa-sand/70">Consult response</p>
          </div>
          <div>
            <p className="font-display text-2xl font-semibold">4</p>
            <p className="mt-1 text-xs text-kasa-sand/70">Signature systems</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { commitments } from "@/lib/data/site";
import { Reveal } from "@/components/motion/reveal";

/**
 * Replaces the invented customer quotes that used to sit here. Until there are
 * real clients to quote, what we can honestly show is how the studio works.
 */
export function CommitmentsSection() {
  return (
    <section className="border-y border-kasa-black/10 bg-kasa-sand/25 py-16 dark:border-white/10 dark:bg-white/[0.04] sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Our promise</p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl text-balance">
            No surprises at the door.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">
            What you pay, when you pay it, and who turns up. All of it is on the site before you commit to anything.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {commitments.map((c, i) => (
            <Reveal
              key={c.title}
              delay={i * 0.06}
              className="rounded-[1.75rem] border border-kasa-black/10 bg-kasa-cream p-6 dark:border-white/10 dark:bg-kasa-charcoal sm:rounded-[2rem] sm:p-8"
            >
              <p className="font-display text-lg font-semibold">{c.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">{c.body}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8">
          <Link
            href="/policies"
            className="text-sm font-medium underline-offset-4 hover:underline dark:text-kasa-cream"
          >
            Read how we work, in full →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

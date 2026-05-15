"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { collections } from "@/lib/data/catalog";
import { Input } from "@/components/ui/input";

export function CollectionsExplorer() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return collections;
    return collections.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.subtitle.toLowerCase().includes(query) ||
        c.positioning.toLowerCase().includes(query),
    );
  }, [q]);

  return (
    <div>
      <div className="max-w-xl">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter collections…" />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {filtered.map((c) => (
          <Link
            key={c.slug}
            href={`/collections/${c.slug}`}
            className="group relative overflow-hidden rounded-[2rem] border border-kasa-black/10 bg-kasa-black shadow-lift dark:border-white/10"
          >
            <div className="relative aspect-[16/11] w-full">
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
              <p className="font-display text-2xl font-semibold">{c.title}</p>
              <p className="mt-2 text-sm text-kasa-sand/80">{c.subtitle}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-kasa-gold">Explore collection</p>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-sm text-kasa-muted">No collections match that filter.</p>
      ) : null}
    </div>
  );
}

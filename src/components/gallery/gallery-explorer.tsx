"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { portfolioItems } from "@/lib/data/site";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/motion/reveal";

const categories = ["All", ...Array.from(new Set(portfolioItems.map((p) => p.category)))];

export function GalleryExplorer() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const filtered = useMemo(() => {
    return portfolioItems.filter((p) => {
      const matchesCat = cat === "All" || p.category === cat;
      const matchesQ =
        q.trim().length === 0 ||
        p.title.toLowerCase().includes(q.toLowerCase()) ||
        p.category.toLowerCase().includes(q.toLowerCase());
      return matchesCat && matchesQ;
    });
  }, [cat, q]);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search spaces, moods, rooms…" className="max-w-xl" />
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                c === cat ? "bg-kasa-black text-kasa-cream dark:bg-kasa-cream dark:text-kasa-black" : "bg-kasa-black/5 hover:bg-kasa-black/10 dark:bg-white/10 dark:hover:bg-white/15"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {filtered.map((p, idx) => (
          <Reveal key={p.id} delay={(idx % 6) * 0.04} className="mb-4 break-inside-avoid">
            <div className="group relative overflow-hidden rounded-[2rem] border border-kasa-black/10 bg-kasa-black dark:border-white/10">
            <div className="relative aspect-[4/5]">
                <Image src={p.image} alt={p.title} fill className="object-cover opacity-90 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-100" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-kasa-black via-kasa-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-kasa-cream">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kasa-gold">{p.category}</p>
                <p className="mt-2 font-display text-lg font-semibold">{p.title}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

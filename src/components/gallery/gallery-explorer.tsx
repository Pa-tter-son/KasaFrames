"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/motion/reveal";
import {
  familyLabel,
  familyMeta,
  finishFamilies,
  type FinishFamily,
  type GalleryItem,
} from "@/lib/data/gallery";
import { whatsappLink } from "@/lib/utils";
import { MessageCircle, Search, X } from "lucide-react";

type Filter = FinishFamily | "all";

export function GalleryExplorer({ items }: { items: GalleryItem[] }) {
  // Only offer a filter for a finish that actually has photography behind it.
  const families = useMemo(() => {
    const present = new Set(items.map((i) => i.family));
    return finishFamilies.filter((f) => present.has(f.key));
  }, [items]);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<GalleryItem | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();

    return items.filter((item) => {
      if (filter !== "all" && item.family !== filter) return false;
      if (!needle) return true;

      return [item.title, item.room, item.sizes, item.blurb, familyLabel(item.family)]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [filter, items, q]);

  const activeMeta = filter === "all" ? null : familyMeta(filter);

  return (
    <div>
      <div className="flex flex-col gap-5">
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-kasa-muted" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a finish, a room, a size…"
            className="pl-11"
            aria-label="Search the gallery"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            All work
            <span className="ml-2 text-[10px] opacity-60">{items.length}</span>
          </FilterChip>

          {families.map((f) => {
            const count = items.filter((i) => i.family === f.key).length;
            return (
              <FilterChip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
                {f.label}
                <span className="ml-2 text-[10px] opacity-60">{count}</span>
              </FilterChip>
            );
          })}
        </div>

        {activeMeta ? (
          <p className="max-w-2xl text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">
            <span className="font-medium text-kasa-black dark:text-kasa-cream">{activeMeta.tagline}.</span>{" "}
            {activeMeta.description}
          </p>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 rounded-[2rem] border border-dashed border-kasa-black/15 p-12 text-center dark:border-white/15">
          <p className="font-display text-xl font-semibold">Nothing matches that yet.</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-kasa-muted dark:text-kasa-sand/80">
            Try a finish—canvas, matte, photo block—or clear the search and browse the whole archive.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => {
              setQ("");
              setFilter("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {filtered.map((item, idx) => (
            <Reveal key={item.id} delay={(idx % 6) * 0.04} className="mb-5 break-inside-avoid">
              <button
                type="button"
                onClick={() => setOpen(item)}
                className="group block w-full overflow-hidden rounded-[2rem] border border-kasa-black/10 bg-kasa-black text-left transition hover:border-kasa-gold/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-kasa-gold dark:border-white/10"
              >
                <div className="relative w-full" style={{ aspectRatio: item.ratio }}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-kasa-black via-kasa-black/20 to-transparent opacity-90" />

                  <div className="absolute inset-x-0 bottom-0 p-6 text-kasa-cream">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-kasa-gold">
                      {familyLabel(item.family)}
                    </p>
                    <p className="mt-2 font-display text-lg font-semibold leading-snug">{item.title}</p>
                    <p className="mt-1 text-xs text-kasa-sand/80">
                      {item.room} · {item.sizes}
                    </p>
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      )}

      <Dialog open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent showClose={false} className="max-w-5xl overflow-hidden p-0">
          {open ? (
            <div className="grid max-h-[85vh] gap-0 overflow-y-auto md:grid-cols-5">
              <div className="relative md:col-span-3">
                <div className="relative w-full bg-kasa-black" style={{ aspectRatio: open.ratio }}>
                  <Image
                    src={open.image}
                    alt={open.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 60vw"
                  />
                </div>
              </div>

              <div className="flex flex-col p-8 md:col-span-2">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-kasa-gold">
                    {familyLabel(open.family)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpen(null)}
                    aria-label="Close"
                    className="rounded-full p-1 text-kasa-muted transition hover:bg-kasa-black/5 dark:hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <DialogTitle className="mt-3 font-display text-2xl font-semibold">{open.title}</DialogTitle>
                <p className="mt-4 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">{open.blurb}</p>

                <dl className="mt-6 grid gap-3 text-sm">
                  <div className="flex justify-between gap-4 border-b border-kasa-black/10 pb-2 dark:border-white/10">
                    <dt className="text-kasa-muted dark:text-kasa-sand/70">Space</dt>
                    <dd className="text-right font-medium">{open.room}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-kasa-black/10 pb-2 dark:border-white/10">
                    <dt className="text-kasa-muted dark:text-kasa-sand/70">Sizes</dt>
                    <dd className="text-right font-medium">{open.sizes}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-kasa-muted dark:text-kasa-sand/70">Finish</dt>
                    <dd className="text-right font-medium">{familyMeta(open.family)?.tagline}</dd>
                  </div>
                </dl>

                <div className="mt-8 grid gap-2">
                  <Button asChild>
                    <Link href="/visualizer">See it on your wall</Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <a
                      href={whatsappLink(
                        `Hello KasaFrames — I'd like something like "${open.title}" (${familyLabel(open.family)}).`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Ask about this look
                    </a>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/book">Book a consultation</Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
        active
          ? "bg-kasa-black text-kasa-cream dark:bg-kasa-cream dark:text-kasa-black"
          : "bg-kasa-black/5 hover:bg-kasa-black/10 dark:bg-white/10 dark:hover:bg-white/15"
      }`}
    >
      {children}
    </button>
  );
}

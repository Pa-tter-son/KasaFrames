"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { FrameFinish, FrameMaterial, Product } from "@/lib/data/catalog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/context/cart-provider";
import { formatGhs, whatsappLink } from "@/lib/utils";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

const finishLabels: Record<FrameFinish, string> = {
  "matte-black": "Matte black",
  "warm-oak": "Warm oak",
  "gloss-charcoal": "Gloss charcoal",
  "gold-accent": "Gold accent",
};

const materialLabels: Record<FrameMaterial, string> = {
  wood: "Engineered wood",
  composite: "Archival composite",
  "metal-edge": "Metal edge",
};

export function ProductConfigurator({ product }: { product: Product }) {
  const { addLine } = useCart();
  const [sizeLabel, setSizeLabel] = useState(product.sizesCm[0]?.label ?? "");
  const [material, setMaterial] = useState<FrameMaterial>(product.materials[0] ?? "wood");
  const [finish, setFinish] = useState<FrameFinish>(product.finishes[0] ?? "matte-black");
  const [installation, setInstallation] = useState(false);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(product.heroImage);

  const selectedSize = useMemo(
    () => product.sizesCm.find((s) => s.label === sizeLabel) ?? product.sizesCm[0],
    [product.sizesCm, sizeLabel],
  );

  const price = product.basePriceGhs + (selectedSize?.priceDelta ?? 0);

  const installationFee = installation ? product.installationAddOnGhs : 0;

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-7">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-kasa-black/10 bg-kasa-sand/20 dark:border-white/10">
          <Image src={activeImage} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 58vw" priority />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[product.heroImage, ...product.gallery].map((src, idx) => (
            <button
              key={`${src}-${idx}`}
              type="button"
              onClick={() => setActiveImage(src)}
              className="relative aspect-square overflow-hidden rounded-2xl border border-kasa-black/10 bg-kasa-black/5 dark:border-white/10"
            >
              <Image src={src} alt="" fill className="object-cover" sizes="120px" />
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-5">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Signature piece</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">{product.name}</h1>
        <p className="mt-3 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">{product.description}</p>

        <div className="mt-8 rounded-[2rem] border border-kasa-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kasa-muted">From</p>
              <p className="font-display text-3xl font-semibold">{formatGhs(price)}</p>
            </div>
            <p className="text-xs text-kasa-muted">Incl. consultation notes</p>
          </div>
          <Separator className="my-6" />

          <div className="grid gap-5">
            <div className="grid gap-2">
              <Label>Size</Label>
              <Select value={sizeLabel} onValueChange={setSizeLabel}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose size" />
                </SelectTrigger>
                <SelectContent>
                  {product.sizesCm.map((s) => (
                    <SelectItem key={s.label} value={s.label}>
                      {s.label} {s.priceDelta !== 0 ? `(${s.priceDelta > 0 ? "+" : ""}${formatGhs(s.priceDelta)})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Material</Label>
              <Select value={material} onValueChange={(v) => setMaterial(v as FrameMaterial)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {product.materials.map((m) => (
                    <SelectItem key={m} value={m}>
                      {materialLabels[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Finish</Label>
              <Select value={finish} onValueChange={(v) => setFinish(v as FrameFinish)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {product.finishes.map((f) => (
                    <SelectItem key={f} value={f}>
                      {finishLabels[f]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-center justify-between gap-4 rounded-2xl border border-kasa-black/10 bg-kasa-cream/60 px-4 py-3 text-sm dark:border-white/10 dark:bg-kasa-black/40">
              <span>
                <span className="font-medium">White-glove installation</span>
                <span className="mt-1 block text-xs text-kasa-muted">+ {formatGhs(product.installationAddOnGhs)}</span>
              </span>
              <input
                type="checkbox"
                checked={installation}
                onChange={(e) => setInstallation(e.target.checked)}
                className="h-4 w-4 accent-kasa-gold"
              />
            </label>

            <div className="flex items-center gap-3">
              <Label className="sr-only">Quantity</Label>
              <Select value={String(qty)} onValueChange={(v) => setQty(Number(v))}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="flex-1"
                onClick={() =>
                  addLine({
                    product,
                    sizeLabel: selectedSize?.label ?? sizeLabel,
                    priceGhs: price,
                    material,
                    finish,
                    installation,
                    installationGhs: product.installationAddOnGhs,
                    qty,
                  })
                }
              >
                Add to cart — {formatGhs(qty * (price + installationFee))}
              </Button>
            </div>

            <Button asChild variant="outline" className="w-full">
              <a
                href={whatsappLink(
                  `Hello KasaFrames — I'm interested in ${product.name} (${selectedSize?.label}). Material: ${materialLabels[material]}, finish: ${finishLabels[finish]}.`,
                )}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp inquiry
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 rounded-[2rem] border border-kasa-black/10 bg-kasa-sand/25 p-6 text-sm dark:border-white/10 dark:bg-white/5">
          <p className="font-medium">Room preview</p>
          <p className="text-kasa-muted dark:text-kasa-sand/80">
            For a live mock on your wall, open the{" "}
            <Link href="/visualizer" className="font-semibold text-kasa-black underline-offset-4 hover:underline dark:text-kasa-cream">
              visualizer
            </Link>{" "}
            after you upload a photo.
          </p>
        </div>

        <div className="mt-8 space-y-3 text-sm text-kasa-muted dark:text-kasa-sand/80">
          <p className="font-medium text-kasa-black dark:text-kasa-cream">Delivery</p>
          <p>Greater Accra delivery in 3–7 business days depending on customization depth.</p>
          <p className="font-medium text-kasa-black dark:text-kasa-cream">Reviews</p>
          <p>“Reads like a gallery install—without the gallery attitude.” — Private client, Cantonments</p>
        </div>
      </div>
    </div>
  );
}

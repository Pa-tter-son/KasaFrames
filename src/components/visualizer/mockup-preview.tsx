"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WallStage } from "@/components/visualizer/wall-stage";
import { useCart } from "@/context/cart-provider";
import { getProduct } from "@/lib/data/catalog";
import { formatGhs, whatsappLink } from "@/lib/utils";
import { FLAT_WALL } from "@/lib/perspective";
import { costOf, loadComposition, pieceCm, type Composition } from "@/lib/visualizer";
import { ArrowLeft, MessageCircle, ShoppingBag } from "lucide-react";

export function MockupPreview() {
  const { addLine } = useCart();
  const [composition, setComposition] = React.useState<Composition | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [added, setAdded] = React.useState(false);

  React.useEffect(() => {
    setComposition(loadComposition());
    setLoaded(true);
  }, []);

  if (!loaded) {
    return <div className="h-64 animate-pulse rounded-[2rem] bg-kasa-black/5 dark:bg-white/5" />;
  }

  if (!composition || composition.pieces.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-kasa-black/15 p-12 text-center dark:border-white/15">
        <p className="font-display text-xl font-semibold">Nothing to preview yet.</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-kasa-muted dark:text-kasa-sand/80">
          Compose a wall in the visualizer and it will appear here, at full size, before you commit to anything.
        </p>
        <Button asChild className="mt-6">
          <Link href="/visualizer">Open the visualizer</Link>
        </Button>
      </div>
    );
  }

  const cost = costOf(composition.pieces, composition.installation);
  const deposit = Math.round(cost.totalGhs * 0.5);

  function addToCart() {
    if (!composition) return;

    for (const piece of composition.pieces) {
      const product = getProduct(piece.productId);
      if (!product) continue;
      const size = product.sizes.find((s) => s.label === piece.sizeLabel);
      if (!size) continue;

      addLine({
        product,
        sizeLabel: size.label,
        priceGhs: size.frameGhs,
        material: product.materials[0],
        finish: product.finishes[0],
        installation: composition.installation,
        installationGhs: product.installationGhs,
        qty: 1,
      });
    }

    setAdded(true);
  }

  const summary = composition.pieces
    .map((p) => `${getProduct(p.productId)?.name ?? p.productId} ${p.sizeLabel}in`)
    .join(", ");

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-8">
        <WallStage
          roomSrc={composition.roomSrc}
          wallCm={composition.wallCm}
          wallHeightCm={composition.wallHeightCm ?? 280}
          quad={composition.quad ?? FLAT_WALL}
          pieces={composition.pieces}
        />

        <p className="mt-4 text-xs text-kasa-muted dark:text-kasa-sand/70">
          Drawn against a {composition.wallCm} cm wall. This preview stays on the site—send it to the studio and we
          will work from it with you.
        </p>

        <div className="mt-6 overflow-x-auto rounded-[2rem] border border-kasa-black/10 dark:border-white/10">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="bg-kasa-black/5 text-xs uppercase tracking-wider text-kasa-muted dark:bg-white/5">
              <tr>
                <th className="px-4 py-3 font-semibold">Piece</th>
                <th className="px-4 py-3 font-semibold">Size</th>
                <th className="px-4 py-3 font-semibold">On the wall</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {cost.lines.map((line) => {
                const { wCm, hCm } = pieceCm(line.piece);
                return (
                  <tr key={line.piece.id} className="border-t border-kasa-black/5 dark:border-white/5">
                    <td className="px-4 py-3">{line.name}</td>
                    <td className="px-4 py-3 text-kasa-muted">{line.piece.sizeLabel} in</td>
                    <td className="px-4 py-3 text-kasa-muted">
                      {Math.round(wCm)} × {Math.round(hCm)} cm
                      {Math.round(line.piece.rotation) !== 0 ? ` · ${Math.round(line.piece.rotation)}°` : ""}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatGhs(line.totalGhs)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 lg:mt-0 lg:col-span-4">
        <div className="sticky top-24 rounded-[2rem] border border-kasa-black/10 bg-kasa-black p-6 text-kasa-cream dark:border-white/10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Your estimate</p>

          <dl className="mt-5 grid gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-kasa-sand/80">
                Frames ({composition.pieces.length})
              </dt>
              <dd>{formatGhs(cost.framesGhs)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-kasa-sand/80">Installation</dt>
              <dd>{cost.installGhs > 0 ? formatGhs(cost.installGhs) : "Not included"}</dd>
            </div>
            <div className="mt-2 flex justify-between border-t border-white/15 pt-3 text-base">
              <dt className="font-medium">Total</dt>
              <dd className="font-display text-2xl font-semibold">{formatGhs(cost.totalGhs)}</dd>
            </div>
            <div className="flex justify-between text-xs text-kasa-sand/70">
              <dt>50% deposit to begin</dt>
              <dd>{formatGhs(deposit)}</dd>
            </div>
          </dl>

          <div className="mt-6 grid gap-2">
            <Button onClick={addToCart} className="w-full">
              <ShoppingBag className="h-4 w-4" />
              {added ? "Added to cart ✓" : "Add this wall to cart"}
            </Button>
            <Button asChild variant="secondary" className="w-full">
              <a
                href={whatsappLink(
                  `Hello KasaFrames — here is the wall I put together: ${summary}. Estimate ${formatGhs(
                    cost.totalGhs,
                  )}${composition.installation ? " including installation" : " excluding installation"}. Can we confirm?`,
                )}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="h-4 w-4" />
                Send it to the studio
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full border-white/20 text-kasa-cream hover:bg-white/10">
              <Link href="/visualizer">
                <ArrowLeft className="h-4 w-4" />
                Back to editing
              </Link>
            </Button>
          </div>

          <p className="mt-5 text-[11px] leading-relaxed text-kasa-sand/60">
            Prices are from our published list. Transport for a site visit is charged at the Uber or Bolt fare and
            agreed with you before we travel. See{" "}
            <Link href="/policies" className="underline underline-offset-2">
              how we work
            </Link>{" "}
            for deposits and timelines.
          </p>
        </div>
      </div>
    </div>
  );
}

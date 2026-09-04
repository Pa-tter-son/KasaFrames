"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/context/cart-provider";
import { getProduct, products, type Product, type ProductId } from "@/lib/data/catalog";
import { formatGhs, whatsappLink } from "@/lib/utils";
import {
  Copy,
  Download,
  ImagePlus,
  LayoutGrid,
  MessageCircle,
  RotateCw,
  Ruler,
  Trash2,
  Upload,
} from "lucide-react";

type FrameStyle = "matte-black" | "gloss-acrylic" | "canvas" | "gold-ring" | "float";

interface StyleMeta {
  key: FrameStyle;
  label: string;
  /** Frame border in cm, so the moulding scales with the room like everything else. */
  borderCm: number;
  /** Mat border in cm. Zero for frameless finishes. */
  matCm: number;
}

const STYLES: StyleMeta[] = [
  { key: "matte-black", label: "Matte black + mat", borderCm: 2, matCm: 4 },
  { key: "gold-ring", label: "Glossy black + gold ring", borderCm: 2.4, matCm: 2.5 },
  { key: "gloss-acrylic", label: "Acrylic gloss panel", borderCm: 0, matCm: 0 },
  { key: "canvas", label: "Canvas wrap", borderCm: 0, matCm: 0 },
  { key: "float", label: "Float frame", borderCm: 0.8, matCm: 0 },
];

const SAMPLE_ROOMS = [
  { id: "loft-sofa", label: "Loft lounge", src: "/rooms/loft-sofa.jpg", wallCm: 420 },
  { id: "warm-sideboard", label: "Warm sideboard", src: "/rooms/warm-sideboard.jpg", wallCm: 380 },
  { id: "lilac-lounge", label: "Lilac corner", src: "/rooms/lilac-lounge.jpg", wallCm: 300 },
];

interface Piece {
  id: string;
  productId: ProductId;
  sizeLabel: string;
  wCm: number;
  hCm: number;
  /** Centre of the piece, as a percentage of the room image. */
  xPct: number;
  yPct: number;
  style: FrameStyle;
  rotated: boolean;
  artUrl?: string;
}

let counter = 1;
const uid = () => `p${counter++}`;

function styleMeta(key: FrameStyle) {
  return STYLES.find((s) => s.key === key) ?? STYLES[0];
}

function priceOf(piece: Piece) {
  const product = getProduct(piece.productId);
  if (!product) return 0;
  const size = product.sizesCm.find((s) => s.label === piece.sizeLabel);
  return product.basePriceGhs + (size?.priceDelta ?? 0);
}

export function WallVisualizer() {
  const { addLine } = useCart();

  const [room, setRoom] = React.useState<{ src: string; uploaded: boolean }>({
    src: SAMPLE_ROOMS[0].src,
    uploaded: false,
  });
  const [wallCm, setWallCm] = React.useState(SAMPLE_ROOMS[0].wallCm);
  const [pieces, setPieces] = React.useState<Piece[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [productId, setProductId] = React.useState<ProductId>(products[0].id);
  const [sizeLabel, setSizeLabel] = React.useState(products[0].sizesCm[0].label);
  const [style, setStyle] = React.useState<FrameStyle>("matte-black");
  const [installation, setInstallation] = React.useState(false);
  const [showGuide, setShowGuide] = React.useState(true);
  const [added, setAdded] = React.useState(false);

  const stageRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const dragRef = React.useRef<{ id: string; grabDxPct: number; grabDyPct: number } | null>(null);
  const [stageWidth, setStageWidth] = React.useState(0);

  const product = getProduct(productId) as Product;
  const selected = pieces.find((p) => p.id === selectedId) ?? null;
  const pxPerCm = stageWidth > 0 ? stageWidth / wallCm : 0;

  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setStageWidth(el.clientWidth));
    observer.observe(el);
    setStageWidth(el.clientWidth);
    return () => observer.disconnect();
  }, []);

  // Keep the size selector valid when the product changes.
  React.useEffect(() => {
    if (!product.sizesCm.some((s) => s.label === sizeLabel)) {
      setSizeLabel(product.sizesCm[0].label);
    }
  }, [product, sizeLabel]);

  const subtotal = pieces.reduce((sum, p) => {
    const prod = getProduct(p.productId);
    return sum + priceOf(p) + (installation && prod ? prod.installationAddOnGhs : 0);
  }, 0);

  function currentSize() {
    return product.sizesCm.find((s) => s.label === sizeLabel) ?? product.sizesCm[0];
  }

  function makePiece(overrides: Partial<Piece> = {}): Piece {
    const size = currentSize();
    return {
      id: uid(),
      productId,
      sizeLabel: size.label,
      wCm: size.w,
      hCm: size.h,
      xPct: 50,
      yPct: 38,
      style,
      rotated: false,
      ...overrides,
    };
  }

  function addPiece() {
    const piece = makePiece({ xPct: 42 + (pieces.length % 4) * 5, yPct: 34 + (pieces.length % 3) * 4 });
    setPieces((prev) => [...prev, piece]);
    setSelectedId(piece.id);
    setAdded(false);
  }

  function applyPreset(preset: "single" | "triptych" | "grid" | "stair") {
    if (pxPerCm === 0) return;
    const size = currentSize();
    const gapCm = 6;
    const wPct = ((size.w * pxPerCm) / stageWidth) * 100;
    const gapPct = ((gapCm * pxPerCm) / stageWidth) * 100;
    const base = { productId, sizeLabel: size.label, wCm: size.w, hCm: size.h, style, rotated: false };
    const next: Piece[] = [];

    if (preset === "single") {
      next.push({ ...base, id: uid(), xPct: 50, yPct: 36 });
    }

    if (preset === "triptych") {
      const step = wPct + gapPct;
      [-1, 0, 1].forEach((i) => next.push({ ...base, id: uid(), xPct: 50 + i * step, yPct: 36 }));
    }

    const stageHeight = imgRef.current?.clientHeight || 1;
    const hPct = ((size.h * pxPerCm) / stageHeight) * 100;
    const gapYPct = ((gapCm * pxPerCm) / stageHeight) * 100;

    if (preset === "grid") {
      // Two rows of three, gaps measured rather than eyeballed.
      const stepX = wPct + gapPct;
      const stepY = hPct + gapYPct;
      [-1, 0].forEach((row) =>
        [-1, 0, 1].forEach((col) =>
          next.push({ ...base, id: uid(), xPct: 50 + col * stepX, yPct: 36 + (row + 0.5) * stepY }),
        ),
      );
    }

    if (preset === "stair") {
      // Centre line climbs with the treads. The horizontal step has to clear a
      // full frame width plus the gap, or the pieces sit on top of each other.
      const stepX = wPct + gapPct;
      const stepY = hPct * 0.45;
      const startX = 50 - stepX * 2;
      [0, 1, 2, 3, 4].forEach((i) =>
        next.push({ ...base, id: uid(), xPct: startX + i * stepX, yPct: 66 - i * stepY }),
      );
    }

    setPieces(next.map((p) => ({ ...p, xPct: clamp(p.xPct, 4, 96), yPct: clamp(p.yPct, 4, 96) })));
    setSelectedId(null);
    setAdded(false);
  }

  function updateSelected(patch: Partial<Piece>) {
    if (!selectedId) return;
    setPieces((prev) => prev.map((p) => (p.id === selectedId ? { ...p, ...patch } : p)));
  }

  function onRoomFile(file?: File) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setRoom((prev) => {
      if (prev.uploaded) URL.revokeObjectURL(prev.src);
      return { src: url, uploaded: true };
    });
    setPieces([]);
    setSelectedId(null);
  }

  function onArtFile(file?: File) {
    if (!file || !selectedId) return;
    updateSelected({ artUrl: URL.createObjectURL(file) });
  }

  const onPointerDown = (id: string) => (event: React.PointerEvent) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const piece = pieces.find((p) => p.id === id);
    if (!piece) return;

    setSelectedId(id);
    dragRef.current = {
      id,
      grabDxPct: ((event.clientX - rect.left) / rect.width) * 100 - piece.xPct,
      grabDyPct: ((event.clientY - rect.top) / rect.height) * 100 - piece.yPct,
    };
    (event.target as Element).setPointerCapture?.(event.pointerId);
    event.preventDefault();
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    const stage = stageRef.current;
    if (!drag || !stage) return;

    const rect = stage.getBoundingClientRect();
    let xPct = ((event.clientX - rect.left) / rect.width) * 100 - drag.grabDxPct;
    let yPct = ((event.clientY - rect.top) / rect.height) * 100 - drag.grabDyPct;

    // Snap to the shared centre line of the other pieces, the way a hang is set out.
    const others = pieces.filter((p) => p.id !== drag.id);
    if (others.length > 0) {
      const line = others.reduce((sum, p) => sum + p.yPct, 0) / others.length;
      if (Math.abs(yPct - line) < 1.2) yPct = line;
      const nearestX = others.reduce(
        (best, p) => (Math.abs(p.xPct - xPct) < Math.abs(best - xPct) ? p.xPct : best),
        Infinity,
      );
      if (Math.abs(nearestX - xPct) < 0.8) xPct = nearestX;
    }

    setPieces((prev) =>
      prev.map((p) => (p.id === drag.id ? { ...p, xPct: clamp(xPct, 2, 98), yPct: clamp(yPct, 2, 98) } : p)),
    );
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!selected) return;
    const step = event.shiftKey ? 2 : 0.4;

    if (event.key === "Delete" || event.key === "Backspace") {
      setPieces((prev) => prev.filter((p) => p.id !== selected.id));
      setSelectedId(null);
      event.preventDefault();
      return;
    }

    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };

    const move = moves[event.key];
    if (!move) return;
    updateSelected({ xPct: clamp(selected.xPct + move[0], 2, 98), yPct: clamp(selected.yPct + move[1], 2, 98) });
    event.preventDefault();
  };

  function addAllToCart() {
    for (const piece of pieces) {
      const prod = getProduct(piece.productId);
      if (!prod) continue;
      addLine({
        product: prod,
        sizeLabel: piece.sizeLabel,
        priceGhs: priceOf(piece),
        material: prod.materials[0],
        finish: prod.finishes[0],
        installation,
        installationGhs: prod.installationAddOnGhs,
        qty: 1,
      });
    }
    setAdded(true);
  }

  async function downloadMockup() {
    const image = imgRef.current;
    if (!image) return;

    const canvas = document.createElement("canvas");
    const scale = 1400 / image.naturalWidth;
    canvas.width = 1400;
    canvas.height = Math.round(image.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const cmToPx = canvas.width / wallCm;

    for (const piece of pieces) {
      const w = (piece.rotated ? piece.hCm : piece.wCm) * cmToPx;
      const h = (piece.rotated ? piece.wCm : piece.hCm) * cmToPx;
      const x = (piece.xPct / 100) * canvas.width - w / 2;
      const y = (piece.yPct / 100) * canvas.height - h / 2;
      const meta = styleMeta(piece.style);

      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = 18 * (cmToPx / 4);
      ctx.shadowOffsetY = 8 * (cmToPx / 4);

      if (piece.style === "canvas" || piece.style === "gloss-acrylic") {
        ctx.fillStyle = piece.style === "gloss-acrylic" ? "#101014" : "#efe9df";
        ctx.fillRect(x, y, w, h);
      } else {
        ctx.fillStyle = piece.style === "float" ? "#f7f4ef" : "#111111";
        ctx.fillRect(x, y, w, h);
      }
      ctx.restore();

      const border = meta.borderCm * cmToPx;
      const mat = meta.matCm * cmToPx;

      if (mat > 0) {
        ctx.fillStyle = "#f6f3ee";
        ctx.fillRect(x + border, y + border, w - border * 2, h - border * 2);
      }

      const inset = border + mat;
      const artX = x + inset;
      const artY = y + inset;
      const artW = Math.max(0, w - inset * 2);
      const artH = Math.max(0, h - inset * 2);

      if (piece.artUrl) {
        const art = await loadImage(piece.artUrl).catch(() => null);
        if (art) {
          drawCover(ctx, art, artX, artY, artW, artH);
        } else {
          ctx.fillStyle = "#9c9188";
          ctx.fillRect(artX, artY, artW, artH);
        }
      } else {
        const gradient = ctx.createLinearGradient(artX, artY, artX + artW, artY + artH);
        gradient.addColorStop(0, piece.style === "gloss-acrylic" ? "#2a2a30" : "#b9ada0");
        gradient.addColorStop(1, piece.style === "gloss-acrylic" ? "#0d0d10" : "#8d8177");
        ctx.fillStyle = gradient;
        ctx.fillRect(artX, artY, artW, artH);
      }

      if (piece.style === "gloss-acrylic") {
        const sheen = ctx.createLinearGradient(x, y, x + w, y + h);
        sheen.addColorStop(0, "rgba(255,255,255,0.22)");
        sheen.addColorStop(0.45, "rgba(255,255,255,0.03)");
        sheen.addColorStop(1, "rgba(255,255,255,0.10)");
        ctx.fillStyle = sheen;
        ctx.fillRect(x, y, w, h);
      }

      if (piece.style === "gold-ring") {
        ctx.strokeStyle = "rgba(201,169,98,0.95)";
        ctx.lineWidth = Math.max(1, 0.5 * cmToPx);
        ctx.strokeRect(x + border * 0.6, y + border * 0.6, w - border * 1.2, h - border * 1.2);
      }
    }

    const link = document.createElement("a");
    link.download = "kasaframes-mockup.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const waMessage = whatsappLink(
    pieces.length > 0
      ? `Hello KasaFrames — I mocked up ${pieces.length} piece${pieces.length > 1 ? "s" : ""} on my wall (${pieces
          .map((p) => `${getProduct(p.productId)?.name ?? p.productId} ${p.sizeLabel}`)
          .join(", ")}). Subtotal ${formatGhs(subtotal)}. Can we confirm?`
      : "Hello KasaFrames — I'd like help visualising frames on my wall.",
  );

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <div
          ref={stageRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClick={(e) => {
            if (e.target === e.currentTarget || e.target === imgRef.current) setSelectedId(null);
          }}
          className="relative w-full touch-none overflow-hidden rounded-[2rem] border border-kasa-black/10 bg-kasa-sand/20 outline-none focus-visible:ring-2 focus-visible:ring-kasa-gold dark:border-white/10"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={room.src}
            alt="Your wall"
            crossOrigin="anonymous"
            className="block h-auto w-full select-none"
            draggable={false}
          />

          {showGuide && pieces.length > 1 ? (
            <div
              className="pointer-events-none absolute inset-x-0 border-t border-dashed border-kasa-gold/70"
              style={{ top: `${pieces.reduce((s, p) => s + p.yPct, 0) / pieces.length}%` }}
            />
          ) : null}

          {pieces.map((piece) => (
            <FrameView
              key={piece.id}
              piece={piece}
              pxPerCm={pxPerCm}
              stageHeight={imgRef.current?.clientHeight ?? 0}
              selected={piece.id === selectedId}
              onPointerDown={onPointerDown(piece.id)}
            />
          ))}

          {pieces.length === 0 ? (
            <div className="pointer-events-none absolute inset-x-6 bottom-6 rounded-2xl bg-kasa-black/70 p-4 text-center text-xs text-kasa-cream backdrop-blur">
              Choose a piece, then press <span className="font-semibold">Add to wall</span>—or start from a layout.
              Drag to move, arrow keys to nudge.
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-kasa-muted dark:text-kasa-sand/70">
          <span className="inline-flex items-center gap-1.5">
            <Ruler className="h-3.5 w-3.5" />
            Scaled to a {wallCm} cm wall — sizes are true to each other
          </span>
          {selected ? (
            <span>
              Selected: {getProduct(selected.productId)?.name} ·{" "}
              {selected.rotated ? `${selected.hCm} × ${selected.wCm}` : `${selected.wCm} × ${selected.hCm}`} cm
            </span>
          ) : (
            <span>Click a frame to select it</span>
          )}
        </div>
      </div>

      <div className="lg:col-span-4">
        <div className="rounded-[2rem] border border-kasa-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Your room</p>

          <div className="mt-4 grid gap-2">
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_ROOMS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => {
                    setRoom({ src: sample.src, uploaded: false });
                    setWallCm(sample.wallCm);
                    setPieces([]);
                  }}
                  className={`overflow-hidden rounded-xl border text-left transition ${
                    room.src === sample.src
                      ? "border-kasa-gold ring-2 ring-kasa-gold/30"
                      : "border-kasa-black/10 hover:border-kasa-gold/50 dark:border-white/10"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sample.src} alt={sample.label} className="h-14 w-full object-cover" />
                </button>
              ))}
            </div>

            <label className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-kasa-black/20 px-4 py-3 text-sm font-medium transition hover:border-kasa-gold hover:text-kasa-gold dark:border-white/20">
              <Upload className="h-4 w-4" />
              Upload a photo of your wall
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => onRoomFile(e.target.files?.[0])}
              />
            </label>
            <p className="text-[11px] leading-relaxed text-kasa-muted dark:text-kasa-sand/70">
              Stand square to the wall and keep the camera level. Phone ultra-wide lenses bend the edges and throw the
              scale off.
            </p>
          </div>

          <div className="mt-6 grid gap-2">
            <Label>How wide is that wall? ({wallCm} cm)</Label>
            <input
              type="range"
              min={150}
              max={700}
              step={10}
              value={wallCm}
              onChange={(e) => setWallCm(Number(e.target.value))}
              className="accent-kasa-gold"
            />
            <p className="text-[11px] text-kasa-muted dark:text-kasa-sand/70">
              This is what makes the preview honest—every frame is drawn against it at true size.
            </p>
          </div>

          <div className="mt-6 h-px bg-kasa-black/10 dark:bg-white/10" />

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">The piece</p>

          <div className="mt-4 grid gap-4">
            <div className="grid gap-2">
              <Label>Product</Label>
              <Select value={productId} onValueChange={(v) => setProductId(v as ProductId)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Size</Label>
              <Select value={sizeLabel} onValueChange={setSizeLabel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {product.sizesCm.map((s) => (
                    <SelectItem key={s.label} value={s.label}>
                      {s.label} cm · {formatGhs(product.basePriceGhs + s.priceDelta)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Finish</Label>
              <Select value={style} onValueChange={(v) => setStyle(v as FrameStyle)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLES.map((s) => (
                    <SelectItem key={s.key} value={s.key}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={addPiece} className="w-full">
              <ImagePlus className="h-4 w-4" />
              Add to wall
            </Button>

            <div className="grid gap-2">
              <Label>Start from a layout</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => applyPreset("single")}>
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Single
                </Button>
                <Button variant="outline" size="sm" onClick={() => applyPreset("triptych")}>
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Triptych
                </Button>
                <Button variant="outline" size="sm" onClick={() => applyPreset("grid")}>
                  <LayoutGrid className="h-3.5 w-3.5" />
                  2 × 3 grid
                </Button>
                <Button variant="outline" size="sm" onClick={() => applyPreset("stair")}>
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Staircase
                </Button>
              </div>
            </div>
          </div>
        </div>

        {selected ? (
          <div className="mt-4 rounded-[2rem] border border-kasa-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Selected piece</p>

            <div className="mt-4 grid gap-3">
              <Select value={selected.sizeLabel} onValueChange={(v) => {
                const prod = getProduct(selected.productId);
                const size = prod?.sizesCm.find((s) => s.label === v);
                if (size) updateSelected({ sizeLabel: size.label, wCm: size.w, hCm: size.h });
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(getProduct(selected.productId)?.sizesCm ?? []).map((s) => (
                    <SelectItem key={s.label} value={s.label}>
                      {s.label} cm
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={() => updateSelected({ rotated: !selected.rotated })}>
                  <RotateCw className="h-3.5 w-3.5" />
                  Turn
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const copy = { ...selected, id: uid(), xPct: clamp(selected.xPct + 6, 2, 98) };
                    setPieces((prev) => [...prev, copy]);
                    setSelectedId(copy.id);
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPieces((prev) => prev.filter((p) => p.id !== selected.id));
                    setSelectedId(null);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-kasa-black/20 px-4 py-2.5 text-xs font-medium transition hover:border-kasa-gold hover:text-kasa-gold dark:border-white/20">
                <ImagePlus className="h-3.5 w-3.5" />
                {selected.artUrl ? "Change the photo inside" : "Put your photo inside"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => onArtFile(e.target.files?.[0])}
                />
              </label>
            </div>
          </div>
        ) : null}

        <div className="mt-4 rounded-[2rem] border border-kasa-black/10 bg-kasa-black p-6 text-kasa-cream dark:border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-kasa-sand/80">
              {pieces.length} piece{pieces.length === 1 ? "" : "s"}
            </span>
            <span className="font-display text-xl font-semibold">{formatGhs(subtotal)}</span>
          </div>

          <label className="mt-4 flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={installation}
              onChange={(e) => setInstallation(e.target.checked)}
              className="h-4 w-4 accent-kasa-gold"
            />
            Include white-glove installation
          </label>

          <label className="mt-2 flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={showGuide}
              onChange={(e) => setShowGuide(e.target.checked)}
              className="h-4 w-4 accent-kasa-gold"
            />
            Show the centre line
          </label>

          <div className="mt-6 grid gap-2">
            <Button onClick={addAllToCart} disabled={pieces.length === 0} className="w-full">
              {added ? "Added to cart ✓" : "Add this wall to cart"}
            </Button>
            <Button variant="secondary" onClick={downloadMockup} disabled={pieces.length === 0} className="w-full">
              <Download className="h-4 w-4" />
              Download the mockup
            </Button>
            <Button asChild variant="outline" className="w-full border-white/20 text-kasa-cream hover:bg-white/10">
              <a href={waMessage} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" />
                Send it to the studio
              </a>
            </Button>
            {pieces.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setPieces([]);
                  setSelectedId(null);
                  setAdded(false);
                }}
                className="mt-1 text-xs text-kasa-sand/70 underline-offset-4 hover:underline"
              >
                Start the wall again
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function FrameView({
  piece,
  pxPerCm,
  stageHeight,
  selected,
  onPointerDown,
}: {
  piece: Piece;
  pxPerCm: number;
  stageHeight: number;
  selected: boolean;
  onPointerDown: (event: React.PointerEvent) => void;
}) {
  const meta = styleMeta(piece.style);
  const wCm = piece.rotated ? piece.hCm : piece.wCm;
  const hCm = piece.rotated ? piece.wCm : piece.hCm;
  const widthPx = wCm * pxPerCm;
  const heightPx = hCm * pxPerCm;

  if (pxPerCm === 0 || stageHeight === 0) return null;

  const border = Math.max(1, meta.borderCm * pxPerCm);
  const mat = meta.matCm * pxPerCm;

  const frameBg =
    piece.style === "float"
      ? "#f7f4ef"
      : piece.style === "canvas"
        ? "#efe9df"
        : piece.style === "gloss-acrylic"
          ? "#101014"
          : "#111111";

  return (
    <div
      onPointerDown={onPointerDown}
      className="absolute cursor-grab touch-none active:cursor-grabbing"
      style={{
        left: `${piece.xPct}%`,
        top: `${piece.yPct}%`,
        width: widthPx,
        height: heightPx,
        transform: "translate(-50%, -50%)",
        background: frameBg,
        padding: border,
        boxShadow: selected
          ? "0 0 0 2px rgba(201,169,98,0.95), 0 18px 34px rgba(0,0,0,0.32)"
          : piece.style === "canvas"
            ? "0 12px 24px rgba(0,0,0,0.26)"
            : "0 16px 30px rgba(0,0,0,0.30)",
        borderRadius: 2,
      }}
    >
      {/* Mat board */}
      <div
        className="relative h-full w-full"
        style={{ background: mat > 0 ? "#f6f3ee" : "transparent", padding: mat }}
      >
        <div className="relative h-full w-full overflow-hidden">
          {piece.artUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={piece.artUrl} alt="" className="h-full w-full object-cover" draggable={false} />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background:
                  piece.style === "gloss-acrylic"
                    ? "linear-gradient(135deg,#2a2a30,#0d0d10)"
                    : "linear-gradient(135deg,#b9ada0,#8d8177)",
              }}
            />
          )}

          {piece.style === "gloss-acrylic" ? (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(120deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.03) 42%, rgba(255,255,255,0.12) 100%)",
              }}
            />
          ) : null}
        </div>
      </div>

      {piece.style === "gold-ring" ? (
        <div
          className="pointer-events-none absolute"
          style={{
            inset: border * 0.35,
            border: `${Math.max(1, 0.35 * pxPerCm)}px solid rgba(201,169,98,0.92)`,
          }}
        />
      ) : null}

      {/* Canvas wrap: the returned edge catching light down one side. */}
      {piece.style === "canvas" ? (
        <div
          className="pointer-events-none absolute inset-y-0 right-0"
          style={{
            width: Math.max(2, 3.8 * pxPerCm * 0.25),
            background: "linear-gradient(90deg, rgba(0,0,0,0.10), rgba(0,0,0,0.28))",
          }}
        />
      ) : null}
    </div>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.naturalWidth - sw) / 2;
  const sy = (img.naturalHeight - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

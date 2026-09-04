"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WallStage } from "@/components/visualizer/wall-stage";
import { getProduct, type ProductId } from "@/lib/data/catalog";
import { formatGhs } from "@/lib/utils";
import {
  CM_PER_INCH,
  costOf,
  downscaleImage,
  pieceCm,
  saveComposition,
  STYLES,
  STYLE_PRODUCT,
  type FrameStyle,
  type Piece,
} from "@/lib/visualizer";
import { Copy, Eye, ImagePlus, LayoutGrid, RotateCcw, RotateCw, Ruler, Trash2, Upload } from "lucide-react";

const SAMPLE_ROOMS = [
  { id: "loft-sofa", label: "Loft lounge", src: "/media/rooms/loft-sofa.jpg", wallCm: 420 },
  { id: "warm-sideboard", label: "Warm sideboard", src: "/media/rooms/warm-sideboard.jpg", wallCm: 380 },
  { id: "lilac-lounge", label: "Lilac corner", src: "/media/rooms/lilac-lounge.jpg", wallCm: 300 },
];

let counter = 1;
const uid = () => `p${counter++}`;

export function WallVisualizer() {
  const router = useRouter();

  const [roomSrc, setRoomSrc] = React.useState(SAMPLE_ROOMS[0].src);
  const [wallCm, setWallCm] = React.useState(SAMPLE_ROOMS[0].wallCm);
  const [pieces, setPieces] = React.useState<Piece[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [style, setStyle] = React.useState<FrameStyle>("black-mat");
  const [sizeLabel, setSizeLabel] = React.useState("");
  const [installation, setInstallation] = React.useState(true);
  const [notice, setNotice] = React.useState<string | null>(null);

  const stageRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const dragRef = React.useRef<{ id: string; grabDxPct: number; grabDyPct: number } | null>(null);

  // The finish decides which price table applies.
  const product = getProduct(STYLE_PRODUCT[style]);
  const selected = pieces.find((p) => p.id === selectedId) ?? null;
  const cost = costOf(pieces, installation);

  React.useEffect(() => {
    if (!product) return;
    if (!product.sizes.some((s) => s.label === sizeLabel)) {
      setSizeLabel(product.sizes[Math.min(2, product.sizes.length - 1)].label);
    }
  }, [product, sizeLabel]);

  function currentSize() {
    return product?.sizes.find((s) => s.label === sizeLabel) ?? product?.sizes[0];
  }

  function basePiece(): Omit<Piece, "id" | "xPct" | "yPct"> | null {
    const size = currentSize();
    if (!product || !size) return null;
    return {
      productId: product.id as ProductId,
      sizeLabel: size.label,
      rotation: 0,
      style,
      rotated: false,
    };
  }

  function addPiece() {
    const base = basePiece();
    if (!base) return;
    const piece: Piece = {
      ...base,
      id: uid(),
      xPct: 42 + (pieces.length % 4) * 5,
      yPct: 34 + (pieces.length % 3) * 4,
    };
    setPieces((prev) => [...prev, piece]);
    setSelectedId(piece.id);
  }

  function applyPreset(preset: "single" | "triptych" | "grid" | "stair") {
    const base = basePiece();
    const stageWidth = stageRef.current?.clientWidth ?? 0;
    const stageHeight = imgRef.current?.clientHeight ?? 0;
    if (!base || stageWidth === 0 || stageHeight === 0) return;

    const pxPerCm = stageWidth / wallCm;
    const size = currentSize();
    if (!size) return;

    const wCm = size.widthIn * CM_PER_INCH;
    const hCm = size.heightIn * CM_PER_INCH;
    const gapCm = 6;

    const wPct = ((wCm * pxPerCm) / stageWidth) * 100;
    const gapXPct = ((gapCm * pxPerCm) / stageWidth) * 100;
    const hPct = ((hCm * pxPerCm) / stageHeight) * 100;
    const gapYPct = ((gapCm * pxPerCm) / stageHeight) * 100;

    const next: Piece[] = [];

    if (preset === "single") {
      next.push({ ...base, id: uid(), xPct: 50, yPct: 38 });
    }

    if (preset === "triptych") {
      const stepX = wPct + gapXPct;
      [-1, 0, 1].forEach((i) => next.push({ ...base, id: uid(), xPct: 50 + i * stepX, yPct: 38 }));
    }

    if (preset === "grid") {
      const stepX = wPct + gapXPct;
      const stepY = hPct + gapYPct;
      [-1, 0].forEach((row) =>
        [-1, 0, 1].forEach((col) =>
          next.push({ ...base, id: uid(), xPct: 50 + col * stepX, yPct: 38 + (row + 0.5) * stepY }),
        ),
      );
    }

    if (preset === "stair") {
      // Each piece clears a full width plus the gap, and steps up by roughly a
      // stair rise, so the line climbs the way the treads do.
      const stepX = wPct + gapXPct;
      const stepY = hPct * 0.45;
      const startX = 50 - stepX * 2;
      [0, 1, 2, 3, 4].forEach((i) =>
        next.push({ ...base, id: uid(), xPct: startX + i * stepX, yPct: 66 - i * stepY }),
      );
    }

    setPieces(next.map((p) => ({ ...p, xPct: clamp(p.xPct, 4, 96), yPct: clamp(p.yPct, 4, 96) })));
    setSelectedId(null);
  }

  function updateSelected(patch: Partial<Piece>) {
    if (!selectedId) return;
    setPieces((prev) => prev.map((p) => (p.id === selectedId ? { ...p, ...patch } : p)));
  }

  function tiltAll(rotation: number) {
    setPieces((prev) => prev.map((p) => ({ ...p, rotation })));
  }

  async function onRoomFile(file?: File) {
    if (!file) return;
    setNotice(null);
    try {
      // Downscaled up front: phone photos are far larger than this needs.
      setRoomSrc(await downscaleImage(file));
      setPieces([]);
      setSelectedId(null);
    } catch {
      setNotice("We couldn't read that image. Try a JPG or PNG from your camera roll.");
    }
  }

  async function onArtFile(file?: File) {
    if (!file || !selectedId) return;
    try {
      updateSelected({ artUrl: await downscaleImage(file, 900) });
    } catch {
      setNotice("We couldn't read that image.");
    }
  }

  const onPointerDownPiece = (id: string) => (event: React.PointerEvent) => {
    const stage = stageRef.current;
    const piece = pieces.find((p) => p.id === id);
    if (!stage || !piece) return;

    const rect = stage.getBoundingClientRect();
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

    // Snap to the line the other pieces share, the way a hang is set out.
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

    if (event.key === "[" || event.key === "]") {
      updateSelected({ rotation: clamp(selected.rotation + (event.key === "[" ? -1 : 1), -60, 60) });
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

  function openPreview() {
    const ok = saveComposition({ roomSrc, wallCm, installation, pieces, savedAt: new Date().toISOString() });
    if (!ok) {
      setNotice("That room photo is too large to carry to the preview. Try a smaller image.");
      return;
    }
    router.push("/visualizer/preview");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <WallStage
          roomSrc={roomSrc}
          wallCm={wallCm}
          pieces={pieces}
          selectedId={selectedId}
          onPointerDownPiece={onPointerDownPiece}
          stageRef={stageRef}
          imgRef={imgRef}
          interactive
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClick={(e) => {
            if (e.target === e.currentTarget || e.target === imgRef.current) setSelectedId(null);
          }}
          className="relative w-full touch-none overflow-hidden rounded-[2rem] border border-kasa-black/10 bg-kasa-sand/20 outline-none focus-visible:ring-2 focus-visible:ring-kasa-gold dark:border-white/10"
        />

        {pieces.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-kasa-black/90 p-4 text-center text-xs text-kasa-cream">
            Choose a finish and size, then press <span className="font-semibold">Add to wall</span>—or start from a
            layout. Drag to move, arrow keys to nudge, <span className="font-semibold">[</span> and{" "}
            <span className="font-semibold">]</span> to tilt.
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-kasa-muted dark:text-kasa-sand/70">
          <span className="inline-flex items-center gap-1.5">
            <Ruler className="h-3.5 w-3.5" />
            Drawn against a {wallCm} cm wall, so the sizes are true
          </span>
          {selected ? (
            <span>
              Selected: {getProduct(selected.productId)?.name} · {selected.sizeLabel} in ·{" "}
              {Math.round(selected.rotation)}°
            </span>
          ) : (
            <span>Tap a frame to select it</span>
          )}
        </div>

        {pieces.length > 0 ? (
          <div className="mt-6 overflow-hidden rounded-[2rem] border border-kasa-black/10 dark:border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-kasa-black/5 text-xs uppercase tracking-wider text-kasa-muted dark:bg-white/5">
                <tr>
                  <th className="px-4 py-3 font-semibold">Piece</th>
                  <th className="px-4 py-3 font-semibold">Size</th>
                  <th className="px-4 py-3 text-right font-semibold">Frame</th>
                  <th className="px-4 py-3 text-right font-semibold">Install</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {cost.lines.map((line) => (
                  <tr key={line.piece.id} className="border-t border-kasa-black/5 dark:border-white/5">
                    <td className="px-4 py-3">{line.name}</td>
                    <td className="px-4 py-3 text-kasa-muted">{line.piece.sizeLabel} in</td>
                    <td className="px-4 py-3 text-right">{formatGhs(line.frameGhs)}</td>
                    <td className="px-4 py-3 text-right text-kasa-muted">
                      {line.installGhs > 0 ? formatGhs(line.installGhs) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatGhs(line.totalGhs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <div className="lg:col-span-4">
        <div className="rounded-[2rem] border border-kasa-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Your room</p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {SAMPLE_ROOMS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => {
                  setRoomSrc(sample.src);
                  setWallCm(sample.wallCm);
                  setPieces([]);
                  setSelectedId(null);
                }}
                className={`overflow-hidden rounded-xl border transition ${
                  roomSrc === sample.src
                    ? "border-kasa-gold ring-2 ring-kasa-gold/30"
                    : "border-kasa-black/10 hover:border-kasa-gold/50 dark:border-white/10"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sample.src} alt={sample.label} className="h-14 w-full object-cover" />
              </button>
            ))}
          </div>

          <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-kasa-black/20 px-4 py-3 text-sm font-medium transition hover:border-kasa-gold hover:text-kasa-gold dark:border-white/20">
            <Upload className="h-4 w-4" />
            Upload a photo of your wall
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => onRoomFile(e.target.files?.[0])} />
          </label>

          <div className="mt-5 grid gap-2">
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
              Measure the wall once—everything is drawn against it at true size.
            </p>
          </div>

          <div className="mt-6 h-px bg-kasa-black/10 dark:bg-white/10" />
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">The piece</p>

          <div className="mt-4 grid gap-4">
            <div className="grid gap-2">
              <Label>Frame type</Label>
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

            <div className="grid gap-2">
              <Label>Size (inches)</Label>
              <Select value={sizeLabel} onValueChange={setSizeLabel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(product?.sizes ?? []).map((s) => (
                    <SelectItem key={s.label} value={s.label}>
                      {s.label} · {formatGhs(s.frameGhs)}
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

            {pieces.length > 0 ? (
              <div className="grid gap-2">
                <Label>Tilt every piece</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 15, 30, 45].map((deg) => (
                    <Button key={deg} variant="outline" size="sm" onClick={() => tiltAll(deg)}>
                      {deg}°
                    </Button>
                  ))}
                </div>
                <p className="text-[11px] text-kasa-muted dark:text-kasa-sand/70">
                  For a sloped ceiling or a wall that follows the stairs.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {selected ? (
          <div className="mt-4 rounded-[2rem] border border-kasa-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Selected piece</p>

            <div className="mt-4 grid gap-3">
              <Select
                value={selected.sizeLabel}
                onValueChange={(v) => updateSelected({ sizeLabel: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(getProduct(selected.productId)?.sizes ?? []).map((s) => (
                    <SelectItem key={s.label} value={s.label}>
                      {s.label} in · {formatGhs(s.frameGhs)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="grid gap-2">
                <Label className="flex items-center justify-between">
                  <span>Tilt</span>
                  <span className="font-mono text-xs text-kasa-muted">{Math.round(selected.rotation)}°</span>
                </Label>
                <input
                  type="range"
                  min={-60}
                  max={60}
                  step={1}
                  value={selected.rotation}
                  onChange={(e) => updateSelected({ rotation: Number(e.target.value) })}
                  className="accent-kasa-gold"
                />
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" onClick={() => updateSelected({ rotation: selected.rotation - 5 })}>
                    <RotateCcw className="h-3.5 w-3.5" />
                    -5°
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => updateSelected({ rotation: 0 })}>
                    Level
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => updateSelected({ rotation: selected.rotation + 5 })}>
                    <RotateCw className="h-3.5 w-3.5" />
                    +5°
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={() => updateSelected({ rotated: !selected.rotated })}>
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
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => onArtFile(e.target.files?.[0])} />
              </label>

              <p className="text-[11px] text-kasa-muted dark:text-kasa-sand/70">
                {(() => {
                  const { wCm, hCm } = pieceCm(selected);
                  return `About ${Math.round(wCm)} × ${Math.round(hCm)} cm on the wall.`;
                })()}
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-4 rounded-[2rem] border border-kasa-black/10 bg-kasa-black p-6 text-kasa-cream dark:border-white/10">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-kasa-sand/80">
              {pieces.length} piece{pieces.length === 1 ? "" : "s"}
            </span>
            <span className="font-display text-2xl font-semibold">{formatGhs(cost.totalGhs)}</span>
          </div>

          <dl className="mt-3 grid gap-1 text-xs text-kasa-sand/80">
            <div className="flex justify-between">
              <dt>Frames</dt>
              <dd>{formatGhs(cost.framesGhs)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Installation</dt>
              <dd>{cost.installGhs > 0 ? formatGhs(cost.installGhs) : "Not included"}</dd>
            </div>
          </dl>

          <label className="mt-4 flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={installation}
              onChange={(e) => setInstallation(e.target.checked)}
              className="h-4 w-4 accent-kasa-gold"
            />
            Include installation (GHS 100 per frame)
          </label>

          <div className="mt-5 grid gap-2">
            <Button onClick={openPreview} disabled={pieces.length === 0} className="w-full">
              <Eye className="h-4 w-4" />
              Preview the finished wall
            </Button>
            {pieces.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setPieces([]);
                  setSelectedId(null);
                }}
                className="text-xs text-kasa-sand/70 underline-offset-4 hover:underline"
              >
                Start the wall again
              </button>
            ) : null}
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-kasa-sand/60">
            An estimate from our published price list. A 50% deposit confirms the order; site visit transport is
            charged at the Uber or Bolt fare and agreed with you first.
          </p>
        </div>

        {notice ? <p className="mt-3 text-xs text-red-600">{notice}</p> : null}
      </div>
    </div>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

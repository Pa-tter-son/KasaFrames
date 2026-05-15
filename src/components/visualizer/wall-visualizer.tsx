"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Reveal } from "@/components/motion/reveal";
import { LayoutTemplate, Plus, Upload } from "lucide-react";

type FrameStyle = "ring-black" | "ring-gold" | "canvas" | "thick" | "float";

type Frame = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  style: FrameStyle;
};

const styleClass: Record<FrameStyle, string> = {
  "ring-black": "border-[10px] border-kasa-black shadow-[0_0_0_6px_rgba(201,169,98,0.0)] ring-2 ring-kasa-black/30",
  "ring-gold": "border-[10px] border-kasa-black shadow-[inset_0_0_0_3px_rgba(201,169,98,0.9)] ring-2 ring-kasa-gold/40",
  canvas: "border border-kasa-black/10 shadow-inner bg-white/30 backdrop-blur-[1px]",
  thick: "border-[18px] border-kasa-black shadow-lift",
  float: "border-[3px] border-white/70 shadow-[0_20px_60px_rgba(0,0,0,0.25)] bg-white/5 backdrop-blur-[0.5px]",
};

let idCounter = 1;
const uid = () => `f-${idCounter++}`;

export function WallVisualizer() {
  const [bg, setBg] = useState<string | null>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [style, setStyle] = useState<FrameStyle>("float");
  const [scale, setScale] = useState(28);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onFile = useCallback((file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBg((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setFrames([]);
  }, []);

  const addFrame = useCallback(() => {
    setFrames((prev) => [
      ...prev,
      {
        id: uid(),
        x: 36 + prev.length * 3,
        y: 32 + prev.length * 2,
        w: scale,
        h: scale * 1.25,
        style,
      },
    ]);
  }, [scale, style]);

  const applyLayout = useCallback(
    (preset: "single" | "triptych") => {
      if (!bg) return;
      if (preset === "single") {
        setFrames([{ id: uid(), x: 30, y: 28, w: scale * 1.4, h: scale * 1.4 * 1.25, style }]);
      } else {
        const w = scale * 0.85;
        const h = w * 1.25;
        setFrames([
          { id: uid(), x: 12, y: 30, w, h, style },
          { id: uid(), x: 38, y: 26, w: w * 1.05, h: h * 1.05, style },
          { id: uid(), x: 66, y: 30, w, h, style },
        ]);
      }
    },
    [bg, scale, style],
  );

  const onPointerDown =
    (id: string) =>
    (e: React.PointerEvent) => {
      const el = containerRef.current;
      if (!el) return;
      el.setPointerCapture(e.pointerId);
      drag.current = { id, dx: e.clientX, dy: e.clientY };
    };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - drag.current.dx) / rect.width) * 100;
    const dy = ((e.clientY - drag.current.dy) / rect.height) * 100;
    drag.current.dx = e.clientX;
    drag.current.dy = e.clientY;
    const id = drag.current.id;
    setFrames((prev) =>
      prev.map((f) => (f.id === id ? { ...f, x: clamp(f.x + dx, 2, 92 - f.w), y: clamp(f.y + dy, 2, 92 - f.h) } : f)),
    );
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const el = containerRef.current;
    if (!el) return;
    try {
      el.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    drag.current = null;
  };

  const hint = useMemo(
    () =>
      bg
        ? "Drag frames into position. Adjust scale for sightline accuracy."
        : "Upload a straight-on wall photo for best results (natural light, no wide-angle distortion).",
    [bg],
  );

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <Reveal className="lg:col-span-8">
        <div
          ref={containerRef}
          className="relative aspect-[16/11] w-full overflow-hidden rounded-[2rem] border border-kasa-black/10 bg-kasa-sand/30 dark:border-white/10"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {bg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bg} alt="Your wall" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
              <Upload className="h-6 w-6 text-kasa-muted" />
              <p className="max-w-sm text-sm text-kasa-muted">Drop a wall image to begin your composition.</p>
            </div>
          )}

          {frames.map((f) => (
            <div
              key={f.id}
              className={`absolute cursor-grab touch-none active:cursor-grabbing rounded-lg bg-kasa-black/5 ${styleClass[f.style]}`}
              style={{ left: `${f.x}%`, top: `${f.y}%`, width: `${f.w}%`, height: `${f.h}%` }}
              onPointerDown={onPointerDown(f.id)}
            >
              <div className="pointer-events-none absolute inset-3 overflow-hidden rounded-sm bg-gradient-to-br from-white/25 to-transparent" />
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-kasa-muted">{hint}</p>
      </Reveal>

      <Reveal className="lg:col-span-4">
        <div className="rounded-[2rem] border border-kasa-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Controls</p>
          <h2 className="mt-3 font-display text-2xl font-semibold">Compose your wall</h2>

          <div className="mt-6 grid gap-4">
            <div>
              <Label className="mb-2 block">Wall image</Label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onFile(e.target.files?.[0])}
                className="block w-full text-sm text-kasa-muted file:mr-4 file:rounded-full file:border-0 file:bg-kasa-black file:px-4 file:py-2 file:text-xs file:font-semibold file:text-kasa-cream hover:file:bg-kasa-charcoal"
              />
            </div>

            <div className="grid gap-2">
              <Label>Frame style</Label>
              <Select value={style} onValueChange={(v) => setStyle(v as FrameStyle)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ring-black">Wooden glossy + black ring</SelectItem>
                  <SelectItem value="ring-gold">Wooden glossy + gold ring</SelectItem>
                  <SelectItem value="canvas">Canvas mount</SelectItem>
                  <SelectItem value="thick">Thick black edge</SelectItem>
                  <SelectItem value="float">Float (thin edge)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Scale ({scale}%)</Label>
              <input
                type="range"
                min={16}
                max={44}
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="accent-kasa-gold"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" onClick={addFrame} className="flex-1" disabled={!bg}>
                <Plus className="h-4 w-4" />
                Add frame
              </Button>
              <Button type="button" variant="secondary" onClick={() => setFrames([])} disabled={frames.length === 0}>
                Clear
              </Button>
            </div>

            <div className="grid gap-2">
              <Label>Layouts</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" onClick={() => applyLayout("single")} disabled={!bg}>
                  <LayoutTemplate className="h-4 w-4" />
                  Single hero
                </Button>
                <Button type="button" variant="outline" onClick={() => applyLayout("triptych")} disabled={!bg}>
                  <LayoutTemplate className="h-4 w-4" />
                  Triptych
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[2rem] border border-kasa-black/10 dark:border-white/10">
          <div className="relative aspect-[16/10]">
            <Image
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80"
              alt="Reference interior"
              fill
              className="object-cover"
              sizes="400px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-kasa-black/70 to-transparent" />
            <p className="absolute bottom-4 left-4 right-4 text-xs text-kasa-cream/90">
              Reference mood: float frames in a low-contrast living volume—your upload replaces this canvas.
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

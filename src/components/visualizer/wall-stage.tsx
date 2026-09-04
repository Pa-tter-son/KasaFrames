"use client";

import * as React from "react";
import { matrix3dFor, planeToImage, type Quad } from "@/lib/perspective";
import { pieceCm, styleMeta, type Piece } from "@/lib/visualizer";

/** Reference width of the wall plane in its own pixel space. */
export const PLANE_W = 1200;

/**
 * Draws the room, then lays the pieces onto the wall *plane* rather than onto
 * the flat photograph. Everything inside the plane is positioned in wall
 * coordinates; one CSS matrix3d carries the whole set into the picture's
 * perspective, so a piece narrows as the wall turns away and its edges follow
 * the ceiling line instead of cutting across it.
 *
 * Shared by the editor and the preview, so what the customer approves is exactly
 * what they were arranging.
 */
export function WallStage({
  roomSrc,
  wallCm,
  wallHeightCm,
  quad,
  pieces,
  selectedId,
  onPointerDownPiece,
  imgRef,
  stageRef,
  interactive = false,
  showCorners = false,
  onCornerPointerDown,
  ...rest
}: {
  roomSrc: string;
  wallCm: number;
  wallHeightCm: number;
  quad: Quad;
  pieces: Piece[];
  selectedId?: string | null;
  onPointerDownPiece?: (id: string) => (event: React.PointerEvent) => void;
  imgRef?: React.RefObject<HTMLImageElement | null>;
  stageRef?: React.RefObject<HTMLDivElement | null>;
  interactive?: boolean;
  showCorners?: boolean;
  onCornerPointerDown?: (index: number) => (event: React.PointerEvent) => void;
} & React.HTMLAttributes<HTMLDivElement>) {
  const localImg = React.useRef<HTMLImageElement>(null);
  const localStage = React.useRef<HTMLDivElement>(null);
  const image = imgRef ?? localImg;
  const stage = stageRef ?? localStage;

  const [size, setSize] = React.useState({ w: 0, h: 0 });

  React.useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: image.current?.clientHeight ?? 0 });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    if (image.current) observer.observe(image.current);
    measure();
    return () => observer.disconnect();
  }, [stage, image]);

  const planeH = PLANE_W * (wallHeightCm / wallCm);
  const pxPerCm = PLANE_W / wallCm;
  const ready = size.w > 0 && size.h > 0;

  return (
    <div
      ref={stage}
      className="relative w-full overflow-hidden rounded-[2rem] border border-kasa-black/10 bg-kasa-sand/20 dark:border-white/10"
      {...rest}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={image}
        src={roomSrc}
        alt="The wall"
        className="block h-auto w-full select-none"
        draggable={false}
        onLoad={() => setSize({ w: stage.current?.clientWidth ?? 0, h: image.current?.clientHeight ?? 0 })}
      />

      {ready ? (
        <div
          className="absolute left-0 top-0"
          style={{
            width: PLANE_W,
            height: planeH,
            transformOrigin: "0 0",
            transform: matrix3dFor(quad, PLANE_W, planeH, size.w, size.h),
          }}
        >
          {pieces.map((piece) => (
            <FrameView
              key={piece.id}
              piece={piece}
              pxPerCm={pxPerCm}
              selected={interactive && piece.id === selectedId}
              onPointerDown={onPointerDownPiece?.(piece.id)}
              interactive={interactive}
            />
          ))}
        </div>
      ) : null}

      {showCorners && ready
        ? quad.map((corner, index) => {
            const at = planeToImage(quad, index === 0 ? { x: 0, y: 0 } : index === 1 ? { x: 1, y: 0 } : index === 2 ? { x: 1, y: 1 } : { x: 0, y: 1 });
            return (
              <button
                key={index}
                type="button"
                aria-label={`Wall corner ${index + 1}`}
                onPointerDown={onCornerPointerDown?.(index)}
                className="absolute z-10 h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full border-2 border-white bg-kasa-gold shadow-lg active:cursor-grabbing"
                style={{ left: `${at.x * 100}%`, top: `${at.y * 100}%` }}
              />
            );
          })
        : null}

      {showCorners && ready ? (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon
            points={quad.map((p) => `${p.x * 100},${p.y * 100}`).join(" ")}
            fill="rgba(201,169,98,0.10)"
            stroke="rgba(201,169,98,0.9)"
            strokeWidth="0.35"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ) : null}
    </div>
  );
}

export function FrameView({
  piece,
  pxPerCm,
  selected,
  onPointerDown,
  interactive,
}: {
  piece: Piece;
  pxPerCm: number;
  selected: boolean;
  onPointerDown?: (event: React.PointerEvent) => void;
  interactive: boolean;
}) {
  const meta = styleMeta(piece.style);
  const { wCm, hCm } = pieceCm(piece);

  if (pxPerCm === 0 || wCm === 0) return null;

  const border = meta.borderCm > 0 ? Math.max(1, meta.borderCm * pxPerCm) : 0;
  const mat = meta.matCm * pxPerCm;

  const frameBg =
    piece.style === "float"
      ? "#f7f4ef"
      : piece.style === "canvas"
        ? "#efe9df"
        : piece.style === "gloss-plain" || piece.style === "gloss-ring"
          ? "#101014"
          : "#111111";

  return (
    <div
      onPointerDown={onPointerDown}
      className={interactive ? "absolute cursor-grab touch-none active:cursor-grabbing" : "absolute"}
      style={{
        left: `${piece.xPct}%`,
        top: `${piece.yPct}%`,
        width: wCm * pxPerCm,
        height: hCm * pxPerCm,
        transform: `translate(-50%, -50%) rotate(${piece.rotation}deg)`,
        background: frameBg,
        padding: border,
        boxShadow: selected
          ? "0 0 0 6px rgba(201,169,98,0.95), 0 40px 70px rgba(0,0,0,0.32)"
          : piece.style === "float"
            ? "0 36px 60px rgba(0,0,0,0.34)"
            : piece.style === "canvas"
              ? "0 26px 44px rgba(0,0,0,0.26)"
              : "0 30px 52px rgba(0,0,0,0.30)",
        borderRadius: 2,
      }}
    >
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
                  piece.style === "gloss-plain" || piece.style === "gloss-ring"
                    ? "linear-gradient(135deg,#2a2a30,#0d0d10)"
                    : "linear-gradient(135deg,#b9ada0,#8d8177)",
              }}
            />
          )}

          {piece.style === "gloss-plain" || piece.style === "gloss-ring" ? (
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

      {piece.style === "gloss-ring" ? (
        <div
          className="pointer-events-none absolute"
          style={{
            inset: Math.max(1, 0.5 * pxPerCm),
            border: `${Math.max(1, 0.3 * pxPerCm)}px solid rgba(201,169,98,0.9)`,
          }}
        />
      ) : null}

      {piece.style === "canvas" ? (
        <div
          className="pointer-events-none absolute inset-y-0 right-0"
          style={{
            width: Math.max(2, 0.9 * pxPerCm),
            background: "linear-gradient(90deg, rgba(0,0,0,0.10), rgba(0,0,0,0.28))",
          }}
        />
      ) : null}
    </div>
  );
}

"use client";

import * as React from "react";
import { pieceCm, styleMeta, type Piece } from "@/lib/visualizer";

/**
 * Draws the room and the pieces on it. Shared by the editor and the preview so
 * what the customer approves is the same rendering they were dragging around.
 */
export function WallStage({
  roomSrc,
  wallCm,
  pieces,
  selectedId,
  onPointerDownPiece,
  imgRef,
  stageRef,
  interactive = false,
  ...rest
}: {
  roomSrc: string;
  wallCm: number;
  pieces: Piece[];
  selectedId?: string | null;
  onPointerDownPiece?: (id: string) => (event: React.PointerEvent) => void;
  imgRef?: React.RefObject<HTMLImageElement | null>;
  stageRef?: React.RefObject<HTMLDivElement | null>;
  interactive?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  const localImg = React.useRef<HTMLImageElement>(null);
  const localStage = React.useRef<HTMLDivElement>(null);
  const image = imgRef ?? localImg;
  const stage = stageRef ?? localStage;
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setWidth(el.clientWidth));
    observer.observe(el);
    setWidth(el.clientWidth);
    return () => observer.disconnect();
  }, [stage]);

  const pxPerCm = width > 0 ? width / wallCm : 0;

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
      />

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
          ? "0 0 0 2px rgba(201,169,98,0.95), 0 18px 34px rgba(0,0,0,0.32)"
          : piece.style === "float"
            ? "0 20px 34px rgba(0,0,0,0.34)"
            : piece.style === "canvas"
              ? "0 12px 24px rgba(0,0,0,0.26)"
              : "0 16px 30px rgba(0,0,0,0.30)",
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

          {/* Gloss finishes catch the light across the face. */}
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

      {/* The ring detail sits just inside the edge of a glossy print. */}
      {piece.style === "gloss-ring" ? (
        <div
          className="pointer-events-none absolute"
          style={{
            inset: Math.max(1, 0.5 * pxPerCm),
            border: `${Math.max(1, 0.3 * pxPerCm)}px solid rgba(201,169,98,0.9)`,
          }}
        />
      ) : null}

      {/* Canvas returns the image around the side, catching a little shade. */}
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

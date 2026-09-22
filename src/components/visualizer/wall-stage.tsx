"use client";

import * as React from "react";
import { matrix3dFor, planeToImage, type Point, type Quad } from "@/lib/perspective";
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
  measure,
  onMeasurePointerDown,
  showRule = false,
  eyeLevelPct,
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
  /** The measuring line, in image fractions, while the scale is being set. */
  measure?: { a: Point; b: Point } | null;
  onMeasurePointerDown?: (end: "a" | "b") => (event: React.PointerEvent) => void;
  /** Draws a one-metre bar and the hanging line for a scale sanity check. */
  showRule?: boolean;
  /** The 145 cm hanging line, in wall percent, drawn with the rule. */
  eyeLevelPct?: number;
} & React.HTMLAttributes<HTMLDivElement>) {
  const localImg = React.useRef<HTMLImageElement>(null);
  const localStage = React.useRef<HTMLDivElement>(null);
  const image = imgRef ?? localImg;
  const stage = stageRef ?? localStage;

  const [size, setSize] = React.useState({ w: 0, h: 0 });

  React.useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;

    // Measure the photo, not the stage. A tall portrait is letterboxed inside
    // the stage, and hanging the wall plane off the stage's width would slide
    // every piece sideways by the margin.
    const syncSize = () =>
      setSize({ w: image.current?.clientWidth ?? 0, h: image.current?.clientHeight ?? 0 });
    const observer = new ResizeObserver(syncSize);
    observer.observe(el);
    if (image.current) observer.observe(image.current);
    syncSize();

    // A cached photo can finish decoding before this runs, so the first
    // measurement sees a zero-height image and onLoad never fires to correct
    // it. Without these the stage stays blank and no frame ever appears.
    const frame = requestAnimationFrame(syncSize);
    const settle = window.setTimeout(syncSize, 250);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
    };
  }, [stage, image, roomSrc]);

  const planeH = PLANE_W * (wallHeightCm / wallCm);
  const pxPerCm = PLANE_W / wallCm;
  const ready = size.w > 0 && size.h > 0;

  return (
    <div
      ref={stage}
      className="relative w-full overflow-hidden rounded-[2rem] border border-kasa-black/10 bg-kasa-sand/20 dark:border-white/10"
      {...rest}
    >
      {/* Shrink-wrapped around the photo, so the overlays below share its exact
          box however the image is letterboxed by the height cap. */}
      <div className="relative mx-auto w-fit overflow-hidden rounded-[1.75rem]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={image}
        src={roomSrc}
        alt="The wall"
        className="mx-auto block max-h-[72vh] w-auto max-w-full select-none"
        draggable={false}
        onLoad={() =>
          setSize({ w: image.current?.clientWidth ?? 0, h: image.current?.clientHeight ?? 0 })
        }
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
          {/* A metre standing on the floor and the 145 cm hanging line, both
              drawn on the wall itself. Between them you can check the scale
              against the furniture without leaving the page. */}
          {showRule ? (
            <>
              <div
                className="pointer-events-none absolute"
                style={{
                  left: 4 * pxPerCm,
                  bottom: 0,
                  width: 3 * pxPerCm,
                  height: 100 * pxPerCm,
                  background: "rgba(201,169,98,0.95)",
                }}
              >
                <span
                  className="absolute left-full whitespace-nowrap font-bold text-kasa-black dark:text-white"
                  style={{ bottom: 0, marginLeft: 4 * pxPerCm, fontSize: 13 * pxPerCm }}
                >
                  1 m
                </span>
              </div>

              {typeof eyeLevelPct === "number" && eyeLevelPct > 0 && eyeLevelPct < 100 ? (
                <div
                  className="pointer-events-none absolute left-0 w-full"
                  style={{
                    top: `${eyeLevelPct}%`,
                    height: Math.max(1, 0.7 * pxPerCm),
                    backgroundImage:
                      "repeating-linear-gradient(90deg, rgba(201,169,98,0.95) 0 14px, transparent 14px 26px)",
                  }}
                >
                  <span
                    className="absolute right-0 whitespace-nowrap font-bold text-kasa-black dark:text-white"
                    style={{ bottom: 3 * pxPerCm, fontSize: 13 * pxPerCm }}
                  >
                    145 cm · eye level
                  </span>
                </div>
              ) : null}
            </>
          ) : null}

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

      {/* The measuring line: drag its ends across something of known size. */}
      {measure && ready ? (
        <>
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line
              x1={measure.a.x * 100}
              y1={measure.a.y * 100}
              x2={measure.b.x * 100}
              y2={measure.b.y * 100}
              stroke="#12b981"
              strokeWidth="3"
              strokeDasharray="6 4"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {(["a", "b"] as const).map((end) => (
            <button
              key={end}
              type="button"
              aria-label={`Measuring point ${end.toUpperCase()}`}
              onPointerDown={onMeasurePointerDown?.(end)}
              className="absolute z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-[11px] font-bold text-white shadow-lg active:cursor-grabbing"
              style={{ left: `${measure[end].x * 100}%`, top: `${measure[end].y * 100}%` }}
            >
              {end.toUpperCase()}
            </button>
          ))}
        </>
      ) : null}
      </div>
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
            <img
              src={piece.artUrl}
              alt=""
              className="h-full w-full"
              draggable={false}
              style={{
                objectFit: piece.artFit ?? "cover",
                // Pan first, then zoom about the centre, so the sliders behave
                // the way a phone's photo cropper does.
                transform: `translate(${piece.artX ?? 0}%, ${piece.artY ?? 0}%) scale(${piece.artZoom ?? 1})`,
                transformOrigin: "center",
              }}
            />
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

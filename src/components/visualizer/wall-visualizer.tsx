"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  aspectFromQuad,
  detectWallQuad,
  fittedQuad,
  imageToPlane,
  wallWidthFromReference,
  type Point,
  type Quad,
} from "@/lib/perspective";
import { formatGhs } from "@/lib/utils";
import {
  CM_PER_INCH,
  costOf,
  downscaleImage,
  artPanLimit,
  EYE_LEVEL_CM,
  hangHeightCm,
  pieceCm,
  yPctForHang,
  saveComposition,
  SCALE_REFERENCES,
  STYLES,
  STYLE_PRODUCT,
  type FrameStyle,
  type Piece,
} from "@/lib/visualizer";
import {
  Copy,
  Crop,
  Eye,
  ImagePlus,
  LayoutGrid,
  RotateCcw,
  RotateCw,
  Ruler,
  Scan,
  Trash2,
  Upload,
} from "lucide-react";

interface SampleRoom {
  id: string;
  label: string;
  src: string;
  /** Width of the marked wall in cm, measured off the furniture—never guessed. */
  wallCm: number;
  /**
   * Height of the same wall. The corners imply it, but stating it stops the
   * first render using a height carried over from the room before this one.
   */
  wallHeightCm: number;
  /**
   * The wall in the photo, bottom edge on the skirting. Everything is hung
   * against this, so a piece's height above the floor is a real number.
   */
  quad: Quad;
  /** What we put the tape to, shown to the customer so the scale is checkable. */
  measuredAgainst: string;
}

/**
 * The sample rooms, each one calibrated rather than estimated.
 *
 * A frame is drawn at cm per pixel, so the whole illusion rests on how wide the
 * wall really is. These three were measured against furniture of known size—a
 * sofa, a sideboard—which is why a 20 × 30 in print lands at the size it would
 * actually be in the room instead of a third too big.
 */
const SAMPLE_ROOMS: SampleRoom[] = [
  {
    id: "lilac-lounge",
    label: "Lilac corner",
    src: "/media/rooms/lilac-lounge.jpg",
    wallCm: 310,
    wallHeightCm: 554,
    // A real corner, so the wall recedes: the right-hand edge is the corner
    // itself, traced along the cornice above and the skirting below.
    quad: [
      { x: 0, y: 0 },
      { x: 0.657, y: 0.169 },
      { x: 0.657, y: 0.817 },
      { x: 0, y: 0.851 },
    ],
    measuredAgainst: "the 200 cm sofa against it",
  },
  {
    id: "loft-sofa",
    label: "Loft lounge",
    src: "/media/rooms/loft-sofa.jpg",
    wallCm: 595,
    wallHeightCm: 319,
    quad: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 0.951 },
      { x: 0, y: 0.951 },
    ],
    measuredAgainst: "the 230 cm sofa in front of it",
  },
  {
    id: "warm-sideboard",
    label: "Warm sideboard",
    src: "/media/rooms/warm-sideboard.jpg",
    wallCm: 403,
    wallHeightCm: 216,
    quad: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 0.951 },
      { x: 0, y: 0.951 },
    ],
    measuredAgainst: "the 155 cm sideboard below it",
  },
];

let counter = 1;
const uid = () => `p${counter++}`;

export function WallVisualizer() {
  const router = useRouter();

  const [roomSrc, setRoomSrc] = React.useState(SAMPLE_ROOMS[0].src);
  const [wallCm, setWallCm] = React.useState(SAMPLE_ROOMS[0].wallCm);
  const [wallHeightCm, setWallHeightCm] = React.useState(SAMPLE_ROOMS[0].wallHeightCm);
  const [quad, setQuad] = React.useState<Quad>(SAMPLE_ROOMS[0].quad);
  const [quadMode, setQuadMode] = React.useState<"fitted" | "custom">("custom");
  const [scaleNote, setScaleNote] = React.useState<string | null>(
    `Measured against ${SAMPLE_ROOMS[0].measuredAgainst}.`,
  );
  const [imgSize, setImgSize] = React.useState({ w: 0, h: 0 });
  const [adjustingWall, setAdjustingWall] = React.useState(false);
  const [adjustingArt, setAdjustingArt] = React.useState(false);
  const [measuring, setMeasuring] = React.useState(false);
  const [measure, setMeasure] = React.useState<{ a: Point; b: Point } | null>(null);
  const [referenceKey, setReferenceKey] = React.useState("sofa-3");
  const [referenceCm, setReferenceCm] = React.useState(200);
  const [calibrated, setCalibrated] = React.useState(true);
  const [showRule, setShowRule] = React.useState(false);
  const [wallNote, setWallNote] = React.useState<string | null>(null);
  const [pieces, setPieces] = React.useState<Piece[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [style, setStyle] = React.useState<FrameStyle>("black-mat");
  const [sizeLabel, setSizeLabel] = React.useState("");
  const [installation, setInstallation] = React.useState(true);
  const [notice, setNotice] = React.useState<string | null>(null);

  const stageRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const dragRef = React.useRef<{ id: string; dxPct: number; dyPct: number } | null>(null);
  const cornerRef = React.useRef<number | null>(null);
  const measureRef = React.useRef<"a" | "b" | null>(null);
  const artRef = React.useRef<{ id: string; x: number; y: number; artX: number; artY: number } | null>(null);
  const pendingDetect = React.useRef(false);

  const product = getProduct(STYLE_PRODUCT[style]);
  const selected = pieces.find((p) => p.id === selectedId) ?? null;
  const cost = costOf(pieces, installation);

  // Offer a size that suits the wall rather than a fixed rung on the list. The
  // smallest frames are only ever right on a small wall, and starting there is
  // what makes a visualizer look broken: the piece is correct but invisible.
  React.useEffect(() => {
    if (!product) return;
    if (product.sizes.some((s) => s.label === sizeLabel)) return;

    // Roughly a fifth of the wall: the proportion a single piece usually wants,
    // and it lands on 20 × 30 in for an ordinary living-room wall.
    const target = wallCm * 0.18;
    const fits = product.sizes.filter((s) => s.widthIn * CM_PER_INCH <= target);
    const pick = fits.length > 0 ? fits[fits.length - 1] : product.sizes[0];
    setSizeLabel(pick.label);
  }, [product, sizeLabel, wallCm]);

  // Track the photo's rendered size so an untouched wall can be fitted to it.
  React.useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const measure = () => setImgSize({ w: img.clientWidth, h: img.clientHeight });
    const observer = new ResizeObserver(measure);
    observer.observe(img);
    measure();
    return () => observer.disconnect();
  }, [roomSrc]);

  // While nobody has placed the corners themselves, keep the wall rectangle
  // shaped like the wall, so a portrait piece stays portrait.
  React.useEffect(() => {
    if (quadMode !== "fitted" || imgSize.w === 0 || imgSize.h === 0) return;
    setQuad(fittedQuad(imgSize.w, imgSize.h, wallCm, wallHeightCm));
  }, [quadMode, imgSize, wallCm, wallHeightCm]);

  // Once the corners sit on a real rectangle, the photo already knows its
  // proportions—so the height follows from the width rather than a second guess.
  React.useEffect(() => {
    if (quadMode !== "custom" || imgSize.w === 0 || imgSize.h === 0) return;
    const aspect = aspectFromQuad(quad, imgSize.w, imgSize.h);
    if (!aspect) return;
    const derived = Math.round(clamp(wallCm / aspect, 150, 700));
    setWallHeightCm((prev) => (Math.abs(prev - derived) > 1 ? derived : prev));
  }, [quadMode, quad, imgSize, wallCm]);

  /** Reads the wall out of the photograph; falls back to a flat rectangle. */
  const detect = React.useCallback((announce: boolean) => {
    const img = imgRef.current;
    if (!img || !img.complete || img.naturalWidth === 0) {
      pendingDetect.current = true;
      return;
    }

    const found = detectWallQuad(img);
    if (found) {
      setQuad(found);
      setQuadMode("custom");
      setWallNote("We read the wall from your photo. Drag the gold corners if it is not quite right.");
    } else {
      setQuadMode("fitted");
      if (announce) {
        setWallNote("We could not read the angle of this wall. Drag the gold corners onto it and the frames will follow.");
      }
    }
  }, []);

  /**
   * Loads a sample room with the wall we already measured, or an uploaded photo
   * whose scale is still unknown. Nothing is auto-detected over a sample: we
   * traced its corners by hand and a guess would only make it worse.
   */
  function loadRoom(src: string, sample?: SampleRoom) {
    setRoomSrc(src);
    setPieces([]);
    setSelectedId(null);
    setWallNote(null);
    setMeasuring(false);
    setMeasure(null);

    if (sample) {
      setWallCm(sample.wallCm);
      setWallHeightCm(sample.wallHeightCm);
      setQuad(sample.quad);
      setQuadMode("custom");
      setCalibrated(true);
      setScaleNote(`Measured against ${sample.measuredAgainst}.`);
      pendingDetect.current = false;
      return;
    }

    // A new photo is a new room; the old measurement no longer applies.
    setQuadMode("fitted");
    setCalibrated(false);
    setScaleNote(null);
    pendingDetect.current = true;
  }

  function startMeasuring() {
    // Lay the line across the lower middle of the photo, where furniture
    // usually sits, so both ends start somewhere useful.
    setMeasure({ a: { x: 0.3, y: 0.72 }, b: { x: 0.7, y: 0.72 } });
    setMeasuring(true);
    setAdjustingWall(false);
    setAdjustingArt(false);
  }

  /** Turns the measured line into the wall's width, which sets every size. */
  function finishMeasuring() {
    if (measure) {
      const aspect = wallHeightCm > 0 ? wallCm / wallHeightCm : 1;
      const derived = wallWidthFromReference(quad, measure.a, measure.b, referenceCm, aspect);

      if (derived) {
        const rounded = Math.round(derived);
        // Keep the wall's shape: the corners fixed the proportions, so the
        // height has to move with the width rather than stay put.
        setWallHeightCm(Math.round(clamp(rounded / aspect, 150, 700)));
        setWallCm(clamp(rounded, 100, 900));
        setCalibrated(true);
        setScaleNote(
          `Measured against ${referenceCm} cm of ${
            SCALE_REFERENCES.find((r) => r.key === referenceKey)?.label.toLowerCase() ?? "your reference"
          }.`,
        );
        setNotice(null);
      } else {
        setNotice("That measurement did not land on the wall. Put both dots inside the room and try again.");
      }
    }

    setMeasuring(false);
    setMeasure(null);
  }

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

  /** The hanging line, in wall percent. New pieces land on it by default. */
  const eyeLevelPct = yPctForHang(EYE_LEVEL_CM, wallHeightCm);

  function addPiece() {
    const base = basePiece();
    if (!base) return;
    const piece: Piece = {
      ...base,
      id: uid(),
      // Straight onto the hanging line, offset sideways so a second piece does
      // not land exactly on the first. Starting at a believable height is half
      // of what makes the mockup read as real.
      xPct: clamp(42 + (pieces.length % 4) * 6, 5, 95),
      yPct: clamp(eyeLevelPct, 5, 95),
    };
    setPieces((prev) => [...prev, piece]);
    setSelectedId(piece.id);
  }

  function applyPreset(preset: "single" | "triptych" | "grid" | "stair") {
    const base = basePiece();
    const size = currentSize();
    if (!base || !size) return;

    // Percentages are of the wall itself now, so the arithmetic is just
    // centimetres over wall size—no screen pixels involved.
    const wPct = ((size.widthIn * CM_PER_INCH) / wallCm) * 100;
    const hPct = ((size.heightIn * CM_PER_INCH) / wallHeightCm) * 100;
    const gapXPct = (6 / wallCm) * 100;
    const gapYPct = (6 / wallHeightCm) * 100;

    // Every layout is centred on the hanging line, the way an installer would
    // set it out: the middle of the arrangement at 145 cm, not the top piece.
    const line = eyeLevelPct;
    const next: Piece[] = [];

    if (preset === "single") {
      next.push({ ...base, id: uid(), xPct: 50, yPct: line });
    }

    if (preset === "triptych") {
      const stepX = wPct + gapXPct;
      [-1, 0, 1].forEach((i) => next.push({ ...base, id: uid(), xPct: 50 + i * stepX, yPct: line }));
    }

    if (preset === "grid") {
      const stepX = wPct + gapXPct;
      const stepY = hPct + gapYPct;
      [-1, 0].forEach((row) =>
        [-1, 0, 1].forEach((col) =>
          next.push({ ...base, id: uid(), xPct: 50 + col * stepX, yPct: line + (row + 0.5) * stepY }),
        ),
      );
    }

    if (preset === "stair") {
      const stepX = wPct + gapXPct;
      const stepY = hPct * 0.45;
      const startX = 50 - stepX * 2;
      // A stair climbs past the hanging line rather than sitting on it, so
      // centre the run on it instead.
      const startY = line + stepY * 2;
      [0, 1, 2, 3, 4].forEach((i) =>
        next.push({ ...base, id: uid(), xPct: startX + i * stepX, yPct: startY - i * stepY }),
      );
    }

    setPieces(next.map((p) => ({ ...p, xPct: clamp(p.xPct, 3, 97), yPct: clamp(p.yPct, 3, 97) })));
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
      const src = await downscaleImage(file);
      loadRoom(src);
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

  /** Pointer position as a fraction of the room photo. */
  function pointerOnImage(event: React.PointerEvent): Point | null {
    const img = imgRef.current;
    if (!img) return null;
    const rect = img.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    return { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height };
  }

  /** …and the same point in wall coordinates, as percentages. */
  function pointerOnWall(event: React.PointerEvent) {
    const onImage = pointerOnImage(event);
    if (!onImage) return null;
    const onPlane = imageToPlane(quad, onImage);
    return onPlane ? { x: onPlane.x * 100, y: onPlane.y * 100 } : null;
  }

  const onPointerDownPiece = (id: string) => (event: React.PointerEvent) => {
    const piece = pieces.find((p) => p.id === id);
    const at = pointerOnWall(event);
    if (!piece || !at) return;

    setSelectedId(id);

    // While the photo is being framed, a drag inside the piece moves the photo
    // rather than the frame—the frame is where the customer wants it by then.
    if (adjustingArt && piece.id === selectedId && piece.artUrl) {
      artRef.current = { id, x: at.x, y: at.y, artX: piece.artX ?? 0, artY: piece.artY ?? 0 };
    } else {
      dragRef.current = { id, dxPct: at.x - piece.xPct, dyPct: at.y - piece.yPct };
    }

    (event.target as Element).setPointerCapture?.(event.pointerId);
    event.preventDefault();
  };

  /** Zooming the photo with the wheel, the way any photo cropper behaves. */
  const onWheel = (event: React.WheelEvent) => {
    if (!adjustingArt || !selected?.artUrl) return;
    const zoom = clamp((selected.artZoom ?? 1) - event.deltaY * 0.0015, 1, 4);
    const limit = artPanLimit({ ...selected, artZoom: zoom });
    updateSelected({
      artZoom: zoom,
      artX: clamp(selected.artX ?? 0, -limit, limit),
      artY: clamp(selected.artY ?? 0, -limit, limit),
    });
  };

  const onMeasurePointerDown = (end: "a" | "b") => (event: React.PointerEvent) => {
    measureRef.current = end;
    (event.target as Element).setPointerCapture?.(event.pointerId);
    event.preventDefault();
    event.stopPropagation();
  };

  const onCornerPointerDown = (index: number) => (event: React.PointerEvent) => {
    cornerRef.current = index;
    (event.target as Element).setPointerCapture?.(event.pointerId);
    event.preventDefault();
    event.stopPropagation();
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (measureRef.current) {
      const at = pointerOnImage(event);
      if (!at) return;
      const end = measureRef.current;
      setMeasure((prev) =>
        prev ? { ...prev, [end]: { x: clamp(at.x, 0, 1), y: clamp(at.y, 0, 1) } } : prev,
      );
      return;
    }

    if (cornerRef.current !== null) {
      const at = pointerOnImage(event);
      if (!at) return;
      const index = cornerRef.current;
      setQuadMode("custom");
      setQuad((prev) => {
        const next = [...prev] as Quad;
        next[index] = { x: clamp(at.x, 0, 1), y: clamp(at.y, 0, 1) };
        return next;
      });
      return;
    }

    const art = artRef.current;
    if (art) {
      const at = pointerOnWall(event);
      const piece = pieces.find((p) => p.id === art.id);
      if (!at || !piece) return;

      // Pointer movement arrives in wall percent; the photo pans in percent of
      // its own frame, so scale by how much wall this piece covers.
      const { wCm, hCm } = pieceCm(piece);
      const widthPct = (wCm / wallCm) * 100;
      const heightPct = (hCm / wallHeightCm) * 100;
      if (widthPct === 0 || heightPct === 0) return;

      const limit = artPanLimit(piece);
      setPieces((prev) =>
        prev.map((p) =>
          p.id === art.id
            ? {
                ...p,
                artX: clamp(art.artX + ((at.x - art.x) / widthPct) * 100, -limit, limit),
                artY: clamp(art.artY + ((at.y - art.y) / heightPct) * 100, -limit, limit),
              }
            : p,
        ),
      );
      return;
    }

    const drag = dragRef.current;
    if (!drag) return;

    const at = pointerOnWall(event);
    if (!at) return;

    let xPct = at.x - drag.dxPct;
    let yPct = at.y - drag.dyPct;

    // Snap to the 145 cm hanging line first, so letting go anywhere near it
    // gives a height a real installer would have used.
    if (Math.abs(yPct - eyeLevelPct) < 1.2) yPct = eyeLevelPct;

    // Then to the line the other pieces share. In wall coordinates this is a
    // real hanging line, not just something that looks aligned on screen.
    const others = pieces.filter((p) => p.id !== drag.id);
    if (others.length > 0) {
      const line = others.reduce((sum, p) => sum + p.yPct, 0) / others.length;
      if (Math.abs(yPct - line) < 1.5) yPct = line;
      const nearestX = others.reduce(
        (best, p) => (Math.abs(p.xPct - xPct) < Math.abs(best - xPct) ? p.xPct : best),
        Infinity,
      );
      if (Math.abs(nearestX - xPct) < 1) xPct = nearestX;
    }

    setPieces((prev) =>
      prev.map((p) => (p.id === drag.id ? { ...p, xPct: clamp(xPct, -5, 105), yPct: clamp(yPct, -5, 105) } : p)),
    );
  };

  const endDrag = () => {
    dragRef.current = null;
    cornerRef.current = null;
    artRef.current = null;
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
    updateSelected({ xPct: clamp(selected.xPct + move[0], -5, 105), yPct: clamp(selected.yPct + move[1], -5, 105) });
    event.preventDefault();
  };

  function openPreview() {
    const ok = saveComposition({
      roomSrc,
      wallCm,
      wallHeightCm,
      quad,
      installation,
      pieces,
      savedAt: new Date().toISOString(),
    });
    if (!ok) {
      setNotice("That room photo is too large to carry to the preview. Try a smaller image.");
      return;
    }
    router.push("/visualizer/preview");
  }

  return (
    // Block layout on a phone so the wall can stay stuck to the top while the
    // controls scroll underneath it; a grid item could only stick inside its own
    // row, which is the whole problem on a narrow screen.
    <div className="lg:grid lg:grid-cols-12 lg:gap-8">
      {/* Direct child of the layout container so it can stay put while the
          controls beneath it scroll. Nested one level deeper, it could only
          stick within its own short column. */}
      <div className="sticky top-14 z-20 -mx-4 bg-kasa-cream px-4 pb-3 pt-2 dark:bg-kasa-black sm:top-16 lg:static lg:col-span-8 lg:col-start-1 lg:row-start-1 lg:mx-0 lg:bg-transparent lg:p-0 dark:lg:bg-transparent">
        <WallStage
          roomSrc={roomSrc}
          wallCm={wallCm}
          wallHeightCm={wallHeightCm}
          quad={quad}
          pieces={pieces}
          selectedId={selectedId}
          onPointerDownPiece={onPointerDownPiece}
          onCornerPointerDown={onCornerPointerDown}
          showCorners={adjustingWall}
          showRule={showRule}
          eyeLevelPct={eyeLevelPct}
          measure={measure}
          onMeasurePointerDown={onMeasurePointerDown}
          stageRef={stageRef}
          imgRef={imgRef}
          interactive
          tabIndex={0}
          onKeyDown={onKeyDown}
          onWheel={onWheel}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClick={(e) => {
            if (e.target === e.currentTarget || e.target === imgRef.current) setSelectedId(null);
          }}
          className="relative w-full touch-none overflow-hidden rounded-[2rem] border border-kasa-black/10 bg-kasa-sand/20 outline-none focus-visible:ring-2 focus-visible:ring-kasa-gold dark:border-white/10"
        />

      </div>

      {/* Notes and the cost breakdown sit below the controls on a phone, and
          back under the wall on a wide screen. */}
      <div className="lg:col-span-8 lg:col-start-1 lg:row-start-2">
        {/* The photo may already be decoded before the handler is attached. */}
        <ImageReadyProbe imgRef={imgRef} onReady={() => detect(true)} pending={pendingDetect} />

        {wallNote ? (
          <p className="mt-4 rounded-2xl border border-kasa-gold/30 bg-kasa-gold/10 px-4 py-3 text-xs leading-relaxed">
            {wallNote}
          </p>
        ) : null}

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
            {wallCm} × {wallHeightCm} cm wall, drawn in your photo&rsquo;s perspective
          </span>
          {selected ? (
            (() => {
              const { wCm, hCm } = pieceCm(selected);
              return (
                <span>
                  Selected: {Math.round(wCm)} × {Math.round(hCm)} cm, centre{" "}
                  {Math.round(hangHeightCm(selected.yPct, wallHeightCm))} cm off the floor
                  {Math.round(selected.rotation) !== 0 ? ` · ${Math.round(selected.rotation)}°` : ""}
                </span>
              );
            })()
          ) : (
            <span>Tap a frame to select it</span>
          )}
        </div>

        {pieces.length > 0 ? (
          <div className="mt-6 overflow-x-auto rounded-[2rem] border border-kasa-black/10 dark:border-white/10">
            <table className="w-full min-w-[34rem] text-left text-sm">
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

      <div className="mt-8 lg:col-span-4 lg:col-start-9 lg:row-start-1 lg:row-span-2 lg:mt-0">
        <div className="rounded-[2rem] border border-kasa-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Your room</p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {SAMPLE_ROOMS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => loadRoom(sample.src, sample)}
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

          <div className="mt-6 h-px bg-kasa-black/10 dark:bg-white/10" />

          <div className="mt-6 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">The scale</p>
            {calibrated ? (
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                Measured
              </span>
            ) : (
              <span className="rounded-full bg-kasa-black/10 px-2.5 py-1 text-[10px] font-semibold text-kasa-muted dark:bg-white/10">
                Estimated
              </span>
            )}
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-kasa-muted dark:text-kasa-sand/70">
            {scaleNote
              ? `${scaleNote} Every frame is drawn to that scale, so what you see is the size it will be.`
              : "Every frame is drawn against the size of this wall. Measure one thing in the photo and the rest follows—it beats guessing the wall in metres."}
          </p>

          <div className="mt-4 grid gap-3">
            <Button
              variant={measuring ? "primary" : "outline"}
              size="sm"
              onClick={() => (measuring ? finishMeasuring() : startMeasuring())}
            >
              <Ruler className="h-3.5 w-3.5" />
              {measuring ? "Done measuring" : calibrated ? "Measure again" : "Measure something in the photo"}
            </Button>

            {measuring ? (
              <div className="grid gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                <p className="text-[11px] leading-relaxed text-kasa-muted dark:text-kasa-sand/70">
                  Drag the green <span className="font-semibold">A</span> and <span className="font-semibold">B</span>{" "}
                  dots onto each end of the thing you are measuring, then tell us how long it really is.
                </p>

                <div className="grid gap-2">
                  <Label className="text-xs">What are you measuring?</Label>
                  <Select
                    value={referenceKey}
                    onValueChange={(v) => {
                      setReferenceKey(v);
                      const preset = SCALE_REFERENCES.find((r) => r.key === v);
                      if (preset && v !== "custom") setReferenceCm(preset.cm);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SCALE_REFERENCES.map((r) => (
                        <SelectItem key={r.key} value={r.key}>
                          {r.label}
                          {r.key === "custom" ? "" : ` · ${r.cm} cm`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-kasa-muted dark:text-kasa-sand/70">
                    {SCALE_REFERENCES.find((r) => r.key === referenceKey)?.hint}
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs">How long is it, in centimetres?</Label>
                  <Input
                    type="number"
                    min={5}
                    max={2000}
                    value={referenceCm}
                    onChange={(e) => setReferenceCm(Number(e.target.value))}
                  />
                </div>

                <Button size="sm" onClick={finishMeasuring}>
                  Use this scale
                </Button>
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label className="text-xs">
                Wall width ({wallCm} cm){calibrated ? " — from your measurement" : ""}
              </Label>
              <input
                type="range"
                min={100}
                max={900}
                step={5}
                value={wallCm}
                onChange={(e) => {
                  setWallCm(Number(e.target.value));
                  setCalibrated(false);
                  setScaleNote(null);
                }}
                className="accent-kasa-gold"
              />
              <Label className="text-xs">
                Wall height ({wallHeightCm} cm){quadMode === "custom" ? " — from your corners" : ""}
              </Label>
              <input
                type="range"
                min={150}
                max={700}
                step={5}
                value={wallHeightCm}
                onChange={(e) => setWallHeightCm(Number(e.target.value))}
                className="accent-kasa-gold"
              />
            </div>

            <label className="flex items-center gap-3 text-xs">
              <input
                type="checkbox"
                checked={showRule}
                onChange={(e) => setShowRule(e.target.checked)}
                className="h-4 w-4 accent-kasa-gold"
              />
              Show a 1-metre rule and the 145 cm hanging line
            </label>
          </div>

          <div className="mt-5 grid gap-2">
            <Label>The wall in your photo</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={adjustingWall ? "primary" : "outline"}
                size="sm"
                onClick={() => setAdjustingWall((v) => !v)}
              >
                {adjustingWall ? "Done" : "Adjust corners"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => detect(true)}>
                <Scan className="h-3.5 w-3.5" />
                Read again
              </Button>
            </div>
            <button
              type="button"
              onClick={() => {
                setQuadMode("fitted");
                setWallNote(null);
              }}
              className="py-2 text-left text-[11px] text-kasa-muted underline-offset-4 hover:underline dark:text-kasa-sand/70 sm:py-0"
            >
              Reset to a flat wall
            </button>
            <p className="text-[11px] leading-relaxed text-kasa-muted dark:text-kasa-sand/70">
              We read the ceiling and skirting lines to work out how your wall recedes, then hang everything on that
              plane. Drag the gold corners onto the wall if the guess is off.
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
                      {s.label} in · {Math.round(s.widthIn * CM_PER_INCH)} × {Math.round(s.heightIn * CM_PER_INCH)} cm
                      · {formatGhs(s.frameGhs)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Inches mean little to most people; centimetres against the
                  wall are what tell you whether it will look right. */}
              {(() => {
                const size = currentSize();
                if (!size) return null;
                const wCm = size.widthIn * CM_PER_INCH;
                const hCm = size.heightIn * CM_PER_INCH;
                const share = Math.round((wCm / wallCm) * 100);
                return (
                  <p className="text-[11px] leading-relaxed text-kasa-muted dark:text-kasa-sand/70">
                    <span className="font-semibold">
                      {Math.round(wCm)} × {Math.round(hCm)} cm
                    </span>{" "}
                    on the wall — {share}% of its width — hung with the centre{" "}
                    {EYE_LEVEL_CM} cm off the floor.
                  </p>
                );
              })()}
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
              </div>
            ) : null}
          </div>
        </div>

        {selected ? (
          <div className="mt-4 rounded-[2rem] border border-kasa-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Selected piece</p>

            <div className="mt-4 grid gap-3">
              <Select value={selected.sizeLabel} onValueChange={(v) => updateSelected({ sizeLabel: v })}>
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

              {/* Height off the floor, which is what decides whether a mockup
                  looks right once there is furniture under it. */}
              <div className="grid gap-2">
                <Label className="flex items-center justify-between">
                  <span>Height off the floor</span>
                  <span className="font-mono text-xs text-kasa-muted">
                    {Math.round(hangHeightCm(selected.yPct, wallHeightCm))} cm to the centre
                  </span>
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateSelected({ yPct: clamp(eyeLevelPct, 3, 97) })}
                >
                  <Ruler className="h-3.5 w-3.5" />
                  Hang at eye level (145 cm)
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={() => updateSelected({ rotated: !selected.rotated })}>
                  Turn
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const copy = { ...selected, id: uid(), xPct: clamp(selected.xPct + 8, 3, 97) };
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

              {selected.artUrl ? (
                <div className="grid gap-3 rounded-2xl border border-kasa-black/10 p-4 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Frame the photo</Label>
                    <Button
                      variant={adjustingArt ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setAdjustingArt((v) => !v)}
                    >
                      <Crop className="h-3.5 w-3.5" />
                      {adjustingArt ? "Done" : "Adjust"}
                    </Button>
                  </div>

                  {adjustingArt ? (
                    <p className="text-[11px] leading-relaxed text-kasa-muted dark:text-kasa-sand/70">
                      Drag inside the frame to move the photo, or scroll to zoom. The frame stays put while you do.
                    </p>
                  ) : null}

                  <div className="grid gap-1.5">
                    <Label className="flex items-center justify-between text-xs">
                      <span>Zoom</span>
                      <span className="font-mono text-[11px] text-kasa-muted">
                        {(selected.artZoom ?? 1).toFixed(2)}×
                      </span>
                    </Label>
                    <input
                      type="range"
                      min={1}
                      max={4}
                      step={0.05}
                      value={selected.artZoom ?? 1}
                      onChange={(e) => {
                        const zoom = Number(e.target.value);
                        const limit = artPanLimit({ ...selected, artZoom: zoom });
                        updateSelected({
                          artZoom: zoom,
                          artX: clamp(selected.artX ?? 0, -limit, limit),
                          artY: clamp(selected.artY ?? 0, -limit, limit),
                        });
                      }}
                      className="accent-kasa-gold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-1.5">
                      <Label className="text-[11px]">Left / right</Label>
                      <input
                        type="range"
                        min={-artPanLimit(selected)}
                        max={artPanLimit(selected)}
                        step={0.5}
                        value={selected.artX ?? 0}
                        disabled={artPanLimit(selected) === 0}
                        onChange={(e) => updateSelected({ artX: Number(e.target.value) })}
                        className="accent-kasa-gold disabled:opacity-40"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-[11px]">Up / down</Label>
                      <input
                        type="range"
                        min={-artPanLimit(selected)}
                        max={artPanLimit(selected)}
                        step={0.5}
                        value={selected.artY ?? 0}
                        disabled={artPanLimit(selected) === 0}
                        onChange={(e) => updateSelected({ artY: Number(e.target.value) })}
                        className="accent-kasa-gold disabled:opacity-40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateSelected({
                          artFit: (selected.artFit ?? "cover") === "cover" ? "contain" : "cover",
                        })
                      }
                    >
                      {(selected.artFit ?? "cover") === "cover" ? "Show whole photo" : "Fill the frame"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSelected({ artZoom: 1, artX: 0, artY: 0, artFit: "cover" })}
                    >
                      Reset
                    </Button>
                  </div>

                  <p className="text-[11px] leading-relaxed text-kasa-muted dark:text-kasa-sand/70">
                    {(selected.artFit ?? "cover") === "cover"
                      ? "Filling the frame crops the edges. Zoom in to choose which part is kept."
                      : "The whole photo is visible, so there may be a margin inside the frame."}
                  </p>
                </div>
              ) : null}

              <p className="text-[11px] leading-relaxed text-kasa-muted dark:text-kasa-sand/70">
                {(() => {
                  const { wCm, hCm } = pieceCm(selected);
                  const top = Math.round(hangHeightCm(selected.yPct, wallHeightCm) + hCm / 2);
                  return `${Math.round(wCm)} × ${Math.round(hCm)} cm on the wall, top edge ${top} cm up.`;
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

/**
 * Runs the wall detection once the photo is actually decoded. A cached image can
 * be complete before React attaches anything, so polling briefly is more
 * reliable here than an onLoad handler alone.
 */
function ImageReadyProbe({
  imgRef,
  onReady,
  pending,
}: {
  imgRef: React.RefObject<HTMLImageElement | null>;
  onReady: () => void;
  pending: React.RefObject<boolean>;
}) {
  React.useEffect(() => {
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const img = imgRef.current;
      if (pending.current && img?.complete && img.naturalWidth > 0) {
        pending.current = false;
        onReady();
        return;
      }
      window.setTimeout(tick, 120);
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [imgRef, onReady, pending]);

  return null;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

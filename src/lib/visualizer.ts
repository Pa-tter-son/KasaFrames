import { getProduct, getSize, type ProductId } from "@/lib/data/catalog";

export type FrameStyle = "black-mat" | "gloss-ring" | "gloss-plain" | "canvas" | "float";

export interface StyleMeta {
  key: FrameStyle;
  label: string;
  /** Moulding width in cm, so the frame profile scales with the room. */
  borderCm: number;
  /** Mat border in cm. Zero on the frameless finishes. */
  matCm: number;
}

export const STYLES: StyleMeta[] = [
  { key: "black-mat", label: "Black frame + white mat", borderCm: 2.2, matCm: 4 },
  { key: "gloss-ring", label: "Wooden glossy + ring", borderCm: 1.2, matCm: 0 },
  { key: "gloss-plain", label: "Wooden glossy — plain", borderCm: 0, matCm: 0 },
  { key: "canvas", label: "Canvas mount", borderCm: 0, matCm: 0 },
  { key: "float", label: "Float frame", borderCm: 0.8, matCm: 0 },
];

export function styleMeta(key: FrameStyle) {
  return STYLES.find((s) => s.key === key) ?? STYLES[0];
}

/** The frame type a finish belongs to, so the price comes from the right table. */
export const STYLE_PRODUCT: Record<FrameStyle, ProductId> = {
  "black-mat": "black-frame-thick",
  "gloss-ring": "wooden-glossy-ring",
  "gloss-plain": "wooden-glossy-ring",
  canvas: "canvas-mount",
  float: "float-frame-thin",
};

export const CM_PER_INCH = 2.54;

export interface Piece {
  id: string;
  productId: ProductId;
  sizeLabel: string;
  /** Centre of the piece, as a percentage of the room image. */
  xPct: number;
  yPct: number;
  /** Degrees. Lets a piece follow a stair pitch or a sloped ceiling. */
  rotation: number;
  style: FrameStyle;
  rotated: boolean;
  /** The customer's own photo, as a data URL so it survives the page hop. */
  artUrl?: string;
}

export interface Composition {
  roomSrc: string;
  wallCm: number;
  installation: boolean;
  pieces: Piece[];
  savedAt: string;
}

/** Frame dimensions in cm, accounting for a piece hung on its side. */
export function pieceCm(piece: Piece) {
  const product = getProduct(piece.productId);
  const size = product ? getSize(product, piece.sizeLabel) : undefined;
  if (!size) return { wCm: 0, hCm: 0 };

  const wCm = size.widthIn * CM_PER_INCH;
  const hCm = size.heightIn * CM_PER_INCH;
  return piece.rotated ? { wCm: hCm, hCm: wCm } : { wCm, hCm };
}

export function framePrice(piece: Piece) {
  const product = getProduct(piece.productId);
  const size = product ? getSize(product, piece.sizeLabel) : undefined;
  return size?.frameGhs ?? 0;
}

export function installPrice(piece: Piece) {
  return getProduct(piece.productId)?.installationGhs ?? 0;
}

export interface CostLine {
  piece: Piece;
  name: string;
  frameGhs: number;
  installGhs: number;
  totalGhs: number;
}

/** One place that adds a composition up, so the editor and the preview agree. */
export function costOf(pieces: Piece[], installation: boolean) {
  const lines: CostLine[] = pieces.map((piece) => {
    const frameGhs = framePrice(piece);
    const installGhs = installation ? installPrice(piece) : 0;
    return {
      piece,
      name: getProduct(piece.productId)?.name ?? piece.productId,
      frameGhs,
      installGhs,
      totalGhs: frameGhs + installGhs,
    };
  });

  const framesGhs = lines.reduce((sum, l) => sum + l.frameGhs, 0);
  const installGhs = lines.reduce((sum, l) => sum + l.installGhs, 0);

  return { lines, framesGhs, installGhs, totalGhs: framesGhs + installGhs };
}

const STORAGE_KEY = "kasaframes_composition_v1";

/**
 * Hands the composition to the preview page.
 *
 * sessionStorage rather than a query string: an uploaded room photo is a data
 * URL and would never survive a URL. It is per-tab and cleared with the tab,
 * which is the right lifetime for a mockup.
 */
export function saveComposition(composition: Composition) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(composition));
    return true;
  } catch {
    // Quota, usually a very large room photo. The caller tells the customer.
    return false;
  }
}

export function loadComposition(): Composition | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Composition;
    return Array.isArray(parsed.pieces) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Shrinks an uploaded room photo before it is held in memory or stored.
 * Phone photos are 3-4 MB and would blow the sessionStorage quota whole.
 */
export function downscaleImage(file: File, maxEdge = 1600): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file"));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("That file is not an image we can read"));
      img.onload = () => {
        const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas unavailable"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

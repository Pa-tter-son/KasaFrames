/**
 * Putting a frame on a photographed wall.
 *
 * A frame drawn as a plain rectangle sits on top of a photo rather than on the
 * wall in it: the moment the wall recedes, the frame reads as a sticker. The fix
 * is to treat the wall as a plane in the picture and map everything onto it, so
 * a piece narrows as the wall turns away and its edges follow the ceiling line.
 *
 * The plane is described by its four corners in image space. Everything else
 * here is the arithmetic to get between that quad and flat wall coordinates.
 */

export interface Point {
  /** Fraction of image width, 0-1. */
  x: number;
  /** Fraction of image height, 0-1. */
  y: number;
}

/** Corners in reading order: top-left, top-right, bottom-right, bottom-left. */
export type Quad = [Point, Point, Point, Point];

export const FLAT_WALL: Quad = [
  { x: 0.06, y: 0.1 },
  { x: 0.94, y: 0.1 },
  { x: 0.94, y: 0.9 },
  { x: 0.06, y: 0.9 },
];

/** 3×3 projective transform, row major, with the bottom-right term fixed at 1. */
export type Homography = [number, number, number, number, number, number, number, number];

/**
 * Maps the unit square onto a quad (Heckbert's method).
 *
 * The general 4-point solve needs an 8×8 elimination; going from the unit square
 * specifically has a closed form, and the unit square is all we need because
 * wall coordinates are normalised before they get here.
 */
export function homographyFromUnitSquare(quad: Quad): Homography {
  const [p0, p1, p2, p3] = quad;

  const sx = p0.x - p1.x + p2.x - p3.x;
  const sy = p0.y - p1.y + p2.y - p3.y;

  // No drift between opposite edges means the quad is a parallelogram, and the
  // projective terms drop out.
  if (Math.abs(sx) < 1e-9 && Math.abs(sy) < 1e-9) {
    return [p1.x - p0.x, p3.x - p0.x, p0.x, p1.y - p0.y, p3.y - p0.y, p0.y, 0, 0];
  }

  const dx1 = p1.x - p2.x;
  const dx2 = p3.x - p2.x;
  const dy1 = p1.y - p2.y;
  const dy2 = p3.y - p2.y;
  const den = dx1 * dy2 - dx2 * dy1;

  if (Math.abs(den) < 1e-9) {
    // Degenerate quad; fall back to something that at least renders.
    return [1, 0, 0, 0, 1, 0, 0, 0];
  }

  const g = (sx * dy2 - dx2 * sy) / den;
  const h = (dx1 * sy - sx * dy1) / den;

  return [
    p1.x - p0.x + g * p1.x,
    p3.x - p0.x + h * p3.x,
    p0.x,
    p1.y - p0.y + g * p1.y,
    p3.y - p0.y + h * p3.y,
    p0.y,
    g,
    h,
  ];
}

/**
 * The CSS transform that lays a `planeW × planeH` element onto the quad within
 * an image of `imageW × imageH`. Pair it with `transform-origin: 0 0`.
 */
export function matrix3dFor(quad: Quad, planeW: number, planeH: number, imageW: number, imageH: number) {
  const [a, b, c, d, e, f, g, h] = homographyFromUnitSquare(quad);

  // The homography works in 0-1 image space; scale into pixels on the way out
  // and out of plane pixels on the way in.
  const a2 = (a * imageW) / planeW;
  const d2 = (d * imageH) / planeW;
  const g2 = g / planeW;
  const b2 = (b * imageW) / planeH;
  const e2 = (e * imageH) / planeH;
  const h2 = h / planeH;
  const c2 = c * imageW;
  const f2 = f * imageH;

  // Column-major, as matrix3d expects.
  return `matrix3d(${a2}, ${d2}, 0, ${g2}, ${b2}, ${e2}, 0, ${h2}, 0, 0, 1, 0, ${c2}, ${f2}, 0, 1)`;
}

/** Image point (0-1) → wall coordinates (0-1 across the plane), or null if behind. */
export function imageToPlane(quad: Quad, point: Point): Point | null {
  const [a, b, c, d, e, f, g, h] = homographyFromUnitSquare(quad);

  // Invert the 3×3 [[a,b,c],[d,e,f],[g,h,1]].
  const det = a * (e - f * h) - b * (d - f * g) + c * (d * h - e * g);
  if (Math.abs(det) < 1e-12) return null;

  const i11 = (e - f * h) / det;
  const i12 = (c * h - b) / det;
  const i13 = (b * f - c * e) / det;
  const i21 = (f * g - d) / det;
  const i22 = (a - c * g) / det;
  const i23 = (c * d - a * f) / det;
  const i31 = (d * h - e * g) / det;
  const i32 = (b * g - a * h) / det;
  const i33 = (a * e - b * d) / det;

  const w = i31 * point.x + i32 * point.y + i33;
  if (Math.abs(w) < 1e-12) return null;

  return {
    x: (i11 * point.x + i12 * point.y + i13) / w,
    y: (i21 * point.x + i22 * point.y + i23) / w,
  };
}

/** Wall coordinates (0-1) → image point (0-1). */
export function planeToImage(quad: Quad, point: Point): Point {
  const [a, b, c, d, e, f, g, h] = homographyFromUnitSquare(quad);
  const w = g * point.x + h * point.y + 1;
  return {
    x: (a * point.x + b * point.y + c) / w,
    y: (d * point.x + e * point.y + f) / w,
  };
}

/**
 * Guesses the wall plane from the photograph.
 *
 * Sobel for edges, then a Hough vote for straight lines, then the strongest
 * near-horizontal line in the top half (a ceiling or cornice) and in the bottom
 * half (a skirting or floor line). Those two lines carry the room's perspective:
 * if they converge, the wall is turning away, and the quad between them leans
 * the same way.
 *
 * Deliberately conservative. Photographs are messy—furniture, shadows, a second
 * wall in shot—so anything that does not look like a clean pair of lines returns
 * null and the caller falls back to a flat rectangle the customer can drag.
 */
export function detectWallQuad(image: HTMLImageElement): Quad | null {
  const W = 240;
  const H = Math.max(1, Math.round((image.naturalHeight / image.naturalWidth) * W));

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(image, 0, 0, W, H);

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, W, H).data;
  } catch {
    return null;
  }

  const grey = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    grey[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }

  // Sobel magnitude.
  const mag = new Float32Array(W * H);
  let maxMag = 0;
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      const gx =
        -grey[i - W - 1] - 2 * grey[i - 1] - grey[i + W - 1] + grey[i - W + 1] + 2 * grey[i + 1] + grey[i + W + 1];
      const gy =
        -grey[i - W - 1] - 2 * grey[i - W] - grey[i - W + 1] + grey[i + W - 1] + 2 * grey[i + W] + grey[i + W + 1];
      const m = Math.hypot(gx, gy);
      mag[i] = m;
      if (m > maxMag) maxMag = m;
    }
  }

  if (maxMag < 1) return null;
  const threshold = maxMag * 0.35;

  // Hough, restricted to near-horizontal lines: those are the ones that tell us
  // how the wall recedes. theta is the angle of the line itself, in degrees.
  const MIN_DEG = -40;
  const MAX_DEG = 40;
  const rhoMax = Math.hypot(W, H);
  const rhoBins = Math.ceil(rhoMax * 2);
  const thetaCount = MAX_DEG - MIN_DEG + 1;
  const acc = new Int32Array(thetaCount * rhoBins);

  const sin: number[] = [];
  const cos: number[] = [];
  for (let t = 0; t < thetaCount; t++) {
    const rad = ((MIN_DEG + t) * Math.PI) / 180;
    sin.push(Math.sin(rad));
    cos.push(Math.cos(rad));
  }

  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      if (mag[y * W + x] < threshold) continue;
      for (let t = 0; t < thetaCount; t++) {
        // Distance from origin to the line through (x,y) at this angle.
        const rho = Math.round(y * cos[t] - x * sin[t] + rhoMax);
        if (rho >= 0 && rho < rhoBins) acc[t * rhoBins + rho]++;
      }
    }
  }

  const minVotes = Math.max(24, Math.round(W * 0.22));

  function bestLineIn(yFrom: number, yTo: number) {
    let best = { votes: 0, deg: 0, rho: 0 };
    for (let t = 0; t < thetaCount; t++) {
      for (let r = 0; r < rhoBins; r++) {
        const votes = acc[t * rhoBins + r];
        if (votes < minVotes || votes <= best.votes) continue;

        // Where does this line sit at the middle of the image?
        const deg = MIN_DEG + t;
        const rad = (deg * Math.PI) / 180;
        const yMid = (r - rhoMax + (W / 2) * Math.sin(rad)) / Math.cos(rad);
        if (yMid < yFrom || yMid > yTo) continue;

        best = { votes, deg, rho: r };
      }
    }
    return best.votes > 0 ? best : null;
  }

  const top = bestLineIn(H * 0.02, H * 0.45);
  const bottom = bestLineIn(H * 0.55, H * 0.98);
  if (!top || !bottom) return null;

  const yAt = (line: { deg: number; rho: number }, x: number) => {
    const rad = (line.deg * Math.PI) / 180;
    return (line.rho - rhoMax + x * Math.sin(rad)) / Math.cos(rad);
  };

  const xL = W * 0.08;
  const xR = W * 0.92;
  const topL = yAt(top, xL);
  const topR = yAt(top, xR);
  const botL = yAt(bottom, xL);
  const botR = yAt(bottom, xR);

  // The band has to stay the right way up and keep some height everywhere.
  const minBand = H * 0.18;
  if (botL - topL < minBand || botR - topR < minBand) return null;

  // Leave a margin below the ceiling and above the floor: nobody hangs a frame
  // touching either.
  const insetL = (botL - topL) * 0.12;
  const insetR = (botR - topR) * 0.12;

  const quad: Quad = [
    { x: xL / W, y: (topL + insetL) / H },
    { x: xR / W, y: (topR + insetR) / H },
    { x: xR / W, y: (botR - insetR) / H },
    { x: xL / W, y: (botL - insetL) / H },
  ];

  // A quad this flat adds nothing over the default, and a wild one is a misread.
  const slope = Math.abs(quad[0].y - quad[1].y) + Math.abs(quad[3].y - quad[2].y);
  if (slope < 0.015 || slope > 0.75) return null;
  if (quad.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y))) return null;

  return quad;
}

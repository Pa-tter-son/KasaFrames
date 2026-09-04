/**
 * The four frame types Kasa Frames sells, with the price tables from the
 * business plan.
 *
 * Prices are per frame in GHS, quoted by size in inches, exactly as the studio
 * quotes them. Installation is a flat GHS 100 per frame on top. Nothing here is
 * derived or interpolated—if a size is not in the table, we do not quote it
 * without asking the studio.
 */

export type CollectionSlug =
  | "wooden-glossy-ring"
  | "canvas-mount"
  | "thick-edge-black"
  | "float-frames";

export type ProductId =
  | "wooden-glossy-ring"
  | "canvas-mount"
  | "black-frame-thick"
  | "float-frame-thin";

export type FrameMaterial = "gloss-board" | "canvas" | "wood";

export type FrameFinish =
  | "plain"
  | "ring-black"
  | "ring-gold"
  | "canvas-wrap"
  | "black-mat"
  | "float-shadow";

export const materialLabels: Record<FrameMaterial, string> = {
  "gloss-board": "Gloss-mounted board",
  canvas: "Stretched canvas",
  wood: "Timber moulding",
};

export const finishLabels: Record<FrameFinish, string> = {
  plain: "Plain — borderless",
  "ring-black": "Ring — black",
  "ring-gold": "Ring — gold",
  "canvas-wrap": "Wrapped edge",
  "black-mat": "Black with white mat",
  "float-shadow": "Float with shadow gap",
};

export interface FrameSize {
  /** As the studio quotes it, in inches. */
  label: string;
  widthIn: number;
  heightIn: number;
  /** Frame price in GHS, before installation. */
  frameGhs: number;
}

export interface Product {
  id: ProductId;
  slug: string;
  name: string;
  tagline: string;
  collection: CollectionSlug;
  description: string;
  longDescription: string;
  heroImage: string;
  gallery: string[];
  materials: FrameMaterial[];
  finishes: FrameFinish[];
  sizes: FrameSize[];
  highlights: string[];
  idealFor: string[];
  /** Flat per-frame installation charge. GHS 100 across every type. */
  installationGhs: number;
}

export interface Collection {
  slug: CollectionSlug;
  title: string;
  subtitle: string;
  positioning: string;
  mood: string;
  heroImage: string;
  accent: string;
  stylingTips: string[];
  layoutIdeas: string[];
  products: ProductId[];
}

export const INSTALLATION_GHS = 100;

/** Deposit taken before an order goes to the manufacturer. */
export const DEPOSIT_RATE = 0.5;

export const collections: Collection[] = [
  {
    slug: "wooden-glossy-ring",
    title: "Wooden Glossy + Ring",
    subtitle: "High-gloss prints, with or without a decorative ring border.",
    positioning: "The most popular and accessible type in the collection.",
    mood: "Vibrant, warm, quietly premium.",
    heroImage: "/media/acrylic-gloss/gloss-portrait-size-guide.jpg",
    accent: "ring",
    stylingTips: [
      "Gloss reads best on a wall that gets indirect light—direct sun turns it into a mirror.",
      "The ring border does the work of a frame without the bulk; keep the wall around it plain.",
      "Portraits gain most from gloss: skin tones stay warm and the blacks stay deep.",
    ],
    layoutIdeas: ["Portrait trio, stepped by size", "Faith or affirmation panel set", "Adinkra symbol series"],
    products: ["wooden-glossy-ring"],
  },
  {
    slug: "canvas-mount",
    title: "Canvas Mount",
    subtitle: "Printed on canvas and wrapped around a deep board. No glass, no border.",
    positioning: "For clients who want a wall that reads as a curated gallery.",
    mood: "Textural, gallery-like, generous.",
    heroImage: "/media/canvas-wrap/canvas-wrap-quartet.jpg",
    accent: "canvas",
    stylingTips: [
      "Canvas takes the glare out of a bright room—it is the safest choice opposite a window.",
      "Go one size larger than feels comfortable; canvas without a frame reads smaller than it measures.",
      "The wrap carries the image around the sides, so leave a little breathing room at the edges of the artwork.",
    ],
    layoutIdeas: ["Single oversized statement", "Quartet hung tight as one field", "Landscape pair over a sideboard"],
    products: ["canvas-mount"],
  },
  {
    slug: "thick-edge-black",
    title: "Black Frame — Thick Edge",
    subtitle: "A bold black moulding with glass and a white mat inside.",
    positioning: "The most requested type for staircase and grid walls in Accra.",
    mood: "Structured, timeless, architectural.",
    heroImage: "/media/gallery-wall/corridor-portrait-grid.jpg",
    accent: "thick",
    stylingTips: [
      "The white mat is what makes it look considered—never crop it out to save cost.",
      "On a staircase, set out from the stair nosing, not the floor, so the line climbs true.",
      "Matching frames in a grid forgive almost any mix of images inside them.",
    ],
    layoutIdeas: ["Staircase cascade", "3 × 3 grid", "Black and white portrait corridor"],
    products: ["black-frame-thick"],
  },
  {
    slug: "float-frames",
    title: "Float Frame — Thin Edge",
    subtitle: "A slim frame that lifts the artwork off the wall and casts a shadow behind it.",
    positioning: "The most premium type we offer.",
    mood: "Contemporary, elevated, magazine-ready.",
    heroImage: "/media/photo-block/mounted-photo-panels.jpg",
    accent: "float",
    stylingTips: [
      "The shadow gap is the whole effect—hang it where side light can find it.",
      "One float frame on a clean wall outperforms three of anything else.",
      "Keep surrounding decor minimal; the lift needs empty wall to read against.",
    ],
    layoutIdeas: ["Single hero piece", "Pair flanking a doorway", "Large-format print above seating"],
    products: ["float-frame-thin"],
  },
];

export const products: Product[] = [
  {
    id: "wooden-glossy-ring",
    slug: "wooden-glossy-ring",
    name: "Wooden Glossy + Ring",
    tagline: "High-gloss print, plain or with a black or gold ring border.",
    collection: "wooden-glossy-ring",
    description:
      "A high-gloss printed photo or artwork mounted on board. Highly reflective, with vibrant, sharp colour.",
    longDescription:
      "Comes two ways: plain, which is borderless with just the glossy print itself, or with ring—the same print carrying a thin decorative border in black or gold, which gives a framed finish without a traditional frame. It is the most popular and accessible type we offer, and the one families choose most often for portraits.",
    heroImage: "/media/acrylic-gloss/gloss-portrait-size-guide.jpg",
    gallery: ["/media/acrylic-gloss/gloss-quote-panels.jpg", "/media/acrylic-gloss/gloss-portrait-size-guide.jpg"],
    materials: ["gloss-board"],
    finishes: ["plain", "ring-black", "ring-gold"],
    sizes: [
      { label: '9 × 12', widthIn: 9, heightIn: 12, frameGhs: 150 },
      { label: '12 × 16', widthIn: 12, heightIn: 16, frameGhs: 200 },
      { label: '16 × 20', widthIn: 16, heightIn: 20, frameGhs: 250 },
      { label: '20 × 24', widthIn: 20, heightIn: 24, frameGhs: 350 },
      { label: '20 × 30', widthIn: 20, heightIn: 30, frameGhs: 400 },
      { label: '24 × 30', widthIn: 24, heightIn: 30, frameGhs: 550 },
      { label: '24 × 36', widthIn: 24, heightIn: 36, frameGhs: 600 },
    ],
    highlights: [
      "Vibrant, sharp colour from a true gloss finish",
      "Ring border in black or gold, or plain and borderless",
      "The most accessible entry point in the collection",
    ],
    idealFor: [
      "Personal and family portrait photography",
      "Faith-based and motivational quotes",
      "Cultural and Adinkra symbol artwork",
    ],
    installationGhs: INSTALLATION_GHS,
  },
  {
    id: "canvas-mount",
    slug: "canvas-mount",
    name: "Canvas Mount",
    tagline: "Printed on canvas, wrapped around a deep board. No glass, no border.",
    collection: "canvas-mount",
    description:
      "The image is printed onto canvas and stretched over a thick board, with the print wrapping around the sides.",
    longDescription:
      "There is no glass and no traditional frame border, which gives canvas a bold, three-dimensional presence on the wall. The texture adds warmth and depth, so the piece reads as artwork rather than a photograph. It is the preferred choice for clients who want their walls to feel like a curated gallery.",
    heroImage: "/media/canvas-wrap/canvas-wrap-quartet.jpg",
    gallery: [
      "/media/canvas-wrap/canvas-wrap-edge-detail.jpg",
      "/media/canvas-wrap/statement-canvas-bedroom.jpg",
    ],
    materials: ["canvas"],
    finishes: ["canvas-wrap"],
    sizes: [
      { label: '9 × 12', widthIn: 9, heightIn: 12, frameGhs: 200 },
      { label: '12 × 16', widthIn: 12, heightIn: 16, frameGhs: 250 },
      { label: '16 × 20', widthIn: 16, heightIn: 20, frameGhs: 350 },
      { label: '20 × 24', widthIn: 20, heightIn: 24, frameGhs: 400 },
      { label: '20 × 30', widthIn: 20, heightIn: 30, frameGhs: 550 },
      { label: '24 × 30', widthIn: 24, heightIn: 30, frameGhs: 700 },
      { label: '24 × 36', widthIn: 24, heightIn: 36, frameGhs: 700 },
    ],
    highlights: [
      "Image carried around the sides of a deep board",
      "No glass, so no glare in a bright room",
      "Canvas texture adds warmth and depth",
    ],
    idealFor: [
      "Landscape and nature artwork",
      "Abstract and contemporary prints",
      "Large statement pieces in living rooms and lobbies",
    ],
    installationGhs: INSTALLATION_GHS,
  },
  {
    id: "black-frame-thick",
    slug: "black-frame-thick-edge",
    name: "Black Frame — Thick Edge",
    tagline: "Bold black moulding, glass, and a white mat inside.",
    collection: "thick-edge-black",
    description:
      "A chunky black border frame with glass and white matting—an inner white border between the frame and the photo.",
    longDescription:
      "The thick edge gives it a strong, classic presence, and grouped together these frames create a powerful gallery wall. It is one of the most requested types for staircases in Accra, where a row of matching black frames ascending the wall makes a dramatic, intentional impression. The white mat adds breathing room around the image and lifts the whole finish.",
    heroImage: "/media/gallery-wall/corridor-portrait-grid.jpg",
    gallery: [
      "/media/gallery-wall/black-frame-grid-six.jpg",
      "/media/staircase/stair-cascade-quotes.jpg",
    ],
    materials: ["wood"],
    finishes: ["black-mat"],
    sizes: [
      { label: '6 × 8', widthIn: 6, heightIn: 8, frameGhs: 100 },
      { label: '8 × 10', widthIn: 8, heightIn: 10, frameGhs: 150 },
      { label: '8 × 12', widthIn: 8, heightIn: 12, frameGhs: 200 },
      { label: '12 × 16', widthIn: 12, heightIn: 16, frameGhs: 250 },
      { label: '16 × 20', widthIn: 16, heightIn: 20, frameGhs: 400 },
      { label: '20 × 24', widthIn: 20, heightIn: 24, frameGhs: 500 },
      { label: '20 × 30', widthIn: 20, heightIn: 30, frameGhs: 550 },
      { label: '24 × 30', widthIn: 24, heightIn: 30, frameGhs: 700 },
      { label: '24 × 36', widthIn: 24, heightIn: 36, frameGhs: 800 },
      { label: '30 × 40', widthIn: 30, heightIn: 40, frameGhs: 1300 },
    ],
    highlights: [
      "Glass and a white mat as standard",
      "Matching frames make a grid or staircase read as one piece",
      "The most requested type for stair walls",
    ],
    idealFor: [
      "Staircase gallery walls following the angle of the stairs",
      "Grid gallery walls in living rooms and hallways",
      "Black and white photography, and corporate reception areas",
    ],
    installationGhs: INSTALLATION_GHS,
  },
  {
    id: "float-frame-thin",
    slug: "float-frame-thin-edge",
    name: "Float Frame — Thin Edge",
    tagline: "A slim frame that lifts the artwork off the wall.",
    collection: "float-frames",
    description:
      "A minimal frame where the artwork sits inside with a small visible gap between the image and the thin border.",
    longDescription:
      "The frame is engineered to sit slightly off the wall, casting a soft shadow behind it and giving the artwork a lifted, three-dimensional appearance—the popping effect. It is the most premium type we offer, and the one that turns a wall into a statement rather than a display.",
    heroImage: "/media/photo-block/mounted-photo-panels.jpg",
    gallery: ["/media/photo-block/photo-block-cluster.jpg", "/media/framed-matte/framed-trio-mono.jpg"],
    materials: ["wood"],
    finishes: ["float-shadow"],
    sizes: [
      { label: '8 × 10', widthIn: 8, heightIn: 10, frameGhs: 150 },
      { label: '8 × 12', widthIn: 8, heightIn: 12, frameGhs: 200 },
      { label: '12 × 16', widthIn: 12, heightIn: 16, frameGhs: 300 },
      { label: '16 × 20', widthIn: 16, heightIn: 20, frameGhs: 400 },
      { label: '20 × 24', widthIn: 20, heightIn: 24, frameGhs: 550 },
      { label: '20 × 30', widthIn: 20, heightIn: 30, frameGhs: 600 },
      { label: '24 × 30', widthIn: 24, heightIn: 30, frameGhs: 800 },
      { label: '24 × 36', widthIn: 24, heightIn: 36, frameGhs: 850 },
      { label: '30 × 40', widthIn: 30, heightIn: 40, frameGhs: 1400 },
    ],
    highlights: [
      "The popping effect: artwork lifted off the wall, shadow behind",
      "Thin edge that never competes with the image",
      "Our most premium finish",
    ],
    idealFor: [
      "Statement pieces and hero walls",
      "High-end contemporary gallery projects",
      "Abstract art, portraits, and large-format prints",
    ],
    installationGhs: INSTALLATION_GHS,
  },
];

export function getCollection(slug: string) {
  return collections.find((c) => c.slug === slug);
}

export function getProduct(id: string) {
  return products.find((p) => p.id === id || p.slug === id);
}

export function getProductsByCollection(slug: CollectionSlug) {
  return products.filter((p) => p.collection === slug);
}

export function getSize(product: Product, label: string) {
  return product.sizes.find((s) => s.label === label);
}

/** Frame price plus installation, for one frame of this size. */
export function totalPerFrame(product: Product, label: string, installation: boolean) {
  const size = getSize(product, label);
  if (!size) return 0;
  return size.frameGhs + (installation ? product.installationGhs : 0);
}

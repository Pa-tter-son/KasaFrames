/**
 * Gallery manifest.
 *
 * Images live in `public/gallery/` and are served from this domain—no external
 * image host, no layout shift, no hotlinking. See `public/gallery/README.md` for
 * how to add a studio photo (drop the file in, add one entry here).
 *
 * The current photography is licensed stock chosen to show each finish
 * honestly—frame profile, mat border, canvas edge depth. Replace an entry's
 * `image` with a studio photo of the same finish as those land.
 */

export type FinishFamily =
  | "acrylic-gloss"
  | "framed-matte"
  | "canvas-wrap"
  | "photo-block"
  | "gallery-wall"
  | "staircase";

export interface FinishFamilyMeta {
  key: FinishFamily;
  label: string;
  tagline: string;
  /** What the customer is actually buying, in one line. */
  description: string;
}

/** Display order for the filter chips. Families with no photos are hidden. */
export const finishFamilies: FinishFamilyMeta[] = [
  {
    key: "acrylic-gloss",
    label: "Acrylic Gloss",
    tagline: "Mirror-finish panels",
    description:
      "High-gloss acrylic face-mount. Deep blacks, wet-look sheen, no visible frame—our signature panel.",
  },
  {
    key: "framed-matte",
    label: "Matte Framed",
    tagline: "Frame + mat border",
    description:
      "Matte print floated inside a wide mat and a slim moulding. The classic, quiet way to hang a photograph.",
  },
  {
    key: "canvas-wrap",
    label: "Canvas Wrap",
    tagline: "Gallery-wrapped edges",
    description:
      "Print stretched over a deep timber bar, image continuing around the sides. Frameless, warm, textural.",
  },
  {
    key: "photo-block",
    label: "Photo Block",
    tagline: "Frameless mounted panels",
    description:
      "Print mounted to a rigid block that stands off the wall. Clean edges, no glass, no glare.",
  },
  {
    key: "gallery-wall",
    label: "Gallery Walls",
    tagline: "Composed multi-piece sets",
    description:
      "Several pieces composed as one wall—grids, salon clusters, corridors. Spacing and sightlines planned first.",
  },
  {
    key: "staircase",
    label: "Staircase",
    tagline: "Rising cascades",
    description:
      "Frames stepped along a stair pitch so the centre line climbs with the treads rather than the eye.",
  },
];

export interface GalleryItem {
  id: string;
  title: string;
  family: FinishFamily;
  /** Where this composition lives, e.g. "Living room". */
  room: string;
  /** Sizes shown, for scale reading. */
  sizes: string;
  blurb: string;
  image: string;
  /** Intrinsic ratio (w/h) so the masonry reserves the right space. */
  ratio: number;
}

export const galleryItems: GalleryItem[] = [
  {
    id: "g-canvas-quartet",
    title: "Canvas Quartet — Warm Neutrals",
    family: "canvas-wrap",
    room: "Living room",
    sizes: "40 × 50 and 50 × 70 cm",
    blurb:
      "Four gallery-wrapped canvases hung tight, so the set reads as one field of colour rather than four pictures.",
    image: "/gallery/canvas-wrap-quartet.jpg",
    ratio: 0.67,
  },
  {
    id: "g-canvas-edge",
    title: "Wrapped Edge — Profile Study",
    family: "canvas-wrap",
    room: "Detail",
    sizes: "38 mm bar depth",
    blurb:
      "The side view: image carried around a deep bar, corners folded by hand, no staples in sight from the front.",
    image: "/gallery/canvas-wrap-edge-detail.jpg",
    ratio: 0.67,
  },
  {
    id: "g-canvas-statement",
    title: "Statement Canvas — Bedroom",
    family: "canvas-wrap",
    room: "Bedroom",
    sizes: "90 × 120 cm",
    blurb:
      "One oversized canvas centred over the bed. At this scale a single piece does more than a cluster ever could.",
    image: "/gallery/statement-canvas-bedroom.jpg",
    ratio: 1,
  },
  {
    id: "g-matte-trio",
    title: "Monochrome Trio — Wide Mats",
    family: "framed-matte",
    room: "Hallway",
    sizes: "40 × 50 cm",
    blurb:
      "Generous mat borders give each print room to breathe. Mixed mouldings still hold together because the mats match.",
    image: "/gallery/framed-trio-mono.jpg",
    ratio: 0.75,
  },
  {
    id: "g-matte-museum",
    title: "Museum Line — Four Across",
    family: "framed-matte",
    room: "Office",
    sizes: "50 × 70 cm",
    blurb:
      "Hung on a single centre line at 145 cm, evenly spaced. The most forgiving arrangement in any long room.",
    image: "/gallery/matte-frames-mat-border.jpg",
    ratio: 1.5,
  },
  {
    id: "g-matte-dining",
    title: "Salon Arrangement — Dining",
    family: "framed-matte",
    room: "Dining room",
    sizes: "Mixed, 20 × 25 to 50 × 70 cm",
    blurb:
      "A larger centre piece anchors six smaller frames. Symmetry at the edges keeps a mixed set from looking accidental.",
    image: "/gallery/dining-salon-arrangement.jpg",
    ratio: 0.78,
  },
  {
    id: "g-block-cluster",
    title: "Photo Block Cluster",
    family: "photo-block",
    room: "Bedroom",
    sizes: "Mixed, 13 × 18 to 40 × 50 cm",
    blurb:
      "Frameless blocks in a loose grid. Because there is no moulding, you can hang far more of them before a wall feels heavy.",
    image: "/gallery/photo-block-cluster.jpg",
    ratio: 1,
  },
  {
    id: "g-block-panels",
    title: "Mounted Panels — Travel Set",
    family: "photo-block",
    room: "Living room",
    sizes: "20 × 25 and 30 × 40 cm",
    blurb:
      "Mounted panels standing off the wall by a few millimetres. The shadow line is what makes them feel expensive.",
    image: "/gallery/mounted-photo-panels.jpg",
    ratio: 1.5,
  },
  {
    id: "g-wall-grid-six",
    title: "Six-Frame Grid — Above Seating",
    family: "gallery-wall",
    room: "Living room",
    sizes: "40 × 50 cm each",
    blurb:
      "Two rows of three, 5 cm apart, sized to sit within the sofa width. Grids are unforgiving—spacing is measured, never eyeballed.",
    image: "/gallery/black-frame-grid-six.jpg",
    ratio: 0.67,
  },
  {
    id: "g-wall-corridor",
    title: "Corridor Salon",
    family: "gallery-wall",
    room: "Corridor",
    sizes: "Mixed, 13 × 18 to 60 × 80 cm",
    blurb:
      "A dense salon hang down a passage. Mixed frame tones are held together by consistent gaps and one shared baseline.",
    image: "/gallery/corridor-salon-wall.jpg",
    ratio: 1.53,
  },
  {
    id: "g-wall-editorial",
    title: "Editorial Wall — Mixed Media",
    family: "gallery-wall",
    room: "Retail / hospitality",
    sizes: "Mixed",
    blurb:
      "Frames, panels and objects composed into recessed bays. Built for a commercial space that needs to look considered from every angle.",
    image: "/gallery/editorial-gallery-wall.jpg",
    ratio: 0.56,
  },
  {
    id: "g-wall-heritage",
    title: "Heritage Wall — Family Archive",
    family: "gallery-wall",
    room: "Sitting room",
    sizes: "Mixed, 10 × 15 to 40 × 50 cm",
    blurb:
      "Decades of family photographs, rescued and reprinted, hung corner to corner. The most requested project we take on.",
    image: "/gallery/heritage-family-wall.jpg",
    ratio: 0.66,
  },
];

/** Only families that actually have photography are offered as filters. */
export function activeFamilies(): FinishFamilyMeta[] {
  const present = new Set(galleryItems.map((i) => i.family));
  return finishFamilies.filter((f) => present.has(f.key));
}

export function familyLabel(key: FinishFamily) {
  return finishFamilies.find((f) => f.key === key)?.label ?? key;
}

export function familyMeta(key: FinishFamily) {
  return finishFamilies.find((f) => f.key === key);
}

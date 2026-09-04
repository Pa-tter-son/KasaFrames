/**
 * Finish families and the gallery item shape.
 *
 * The items themselves are not listed here—they are discovered from
 * `public/media/<family>/` at build time by `loadGalleryItems()` in `media.ts`.
 * Dropping a photo into one of those folders puts it on the site.
 *
 * This module stays free of Node APIs so client components can import the types.
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

export function familyLabel(key: FinishFamily) {
  return finishFamilies.find((f) => f.key === key)?.label ?? key;
}

export function familyMeta(key: FinishFamily) {
  return finishFamilies.find((f) => f.key === key);
}

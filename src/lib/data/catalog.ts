export type CollectionSlug =
  | "wooden-glossy-ring"
  | "canvas-mount"
  | "thick-edge-black"
  | "float-frames";

export type ProductId =
  | "wg-black-60"
  | "wg-gold-60"
  | "cm-gallery-80"
  | "tb-stair-90"
  | "ff-statement-70";

export type FrameMaterial = "wood" | "composite" | "metal-edge";
export type FrameFinish = "matte-black" | "warm-oak" | "gloss-charcoal" | "gold-accent";

export interface Product {
  id: ProductId;
  slug: string;
  name: string;
  tagline: string;
  collection: CollectionSlug;
  description: string;
  longDescription: string;
  basePriceGhs: number;
  heroImage: string;
  gallery: string[];
  materials: FrameMaterial[];
  finishes: FrameFinish[];
  sizesCm: { label: string; w: number; h: number; priceDelta: number }[];
  highlights: string[];
  idealFor: string[];
  installationAddOnGhs: number;
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

export const collections: Collection[] = [
  {
    slug: "wooden-glossy-ring",
    title: "Wooden Glossy + Ring",
    subtitle: "Warm everyday luxury with a sculptural ring detail.",
    positioning: "Designed for modern Ghanaian homes seeking affordable luxury.",
    mood: "Welcoming, luminous, quietly bold.",
    heroImage:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80",
    accent: "ring",
    stylingTips: [
      "Pair with warm neutrals and soft indirect lighting.",
      "Use pairs in hallways for rhythm and balance.",
      "Layer with textured linen curtains for depth.",
    ],
    layoutIdeas: ["Symmetrical pairs", "Triptych rhythm", "Single hero statement"],
    products: ["wg-black-60", "wg-gold-60"],
  },
  {
    slug: "canvas-mount",
    title: "Canvas Mount",
    subtitle: "Museum-grade presence for artworks and limited prints.",
    positioning: "Texture-forward presentation with a clean gallery edge.",
    mood: "Artistic, contemplative, refined.",
    heroImage:
      "https://images.unsplash.com/photo-1615876234889-fd9cd39b94a8?auto=format&fit=crop&w=2000&q=80",
    accent: "canvas",
    stylingTips: [
      "Float above low consoles to create vertical breathing room.",
      "Combine with matte walls for maximum contrast control.",
      "Use directional spots at 30° for even wash.",
    ],
    layoutIdeas: ["Salon wall grid", "Single oversized canvas", "Asymmetric stack"],
    products: ["cm-gallery-80"],
  },
  {
    slug: "thick-edge-black",
    title: "Thick Edge Black",
    subtitle: "Architectural weight for staircases and family galleries.",
    positioning: "Bold edges that anchor classic and contemporary spaces alike.",
    mood: "Confident, structured, timeless.",
    heroImage:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=80",
    accent: "thick",
    stylingTips: [
      "Stagger heights along stair flights for cinematic ascent.",
      "Mix portrait and landscape for editorial rhythm.",
      "Keep mat borders generous for a couture feel.",
    ],
    layoutIdeas: ["Staircase cascade", "Chronological family story", "Office credenza grid"],
    products: ["tb-stair-90"],
  },
  {
    slug: "float-frames",
    title: "Float Frames",
    subtitle: "Ultra-thin edge engineering for statement pieces.",
    positioning: "Our elite line for galleries, penthouses, and signature walls.",
    mood: "Weightless, precise, gallery-private.",
    heroImage:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2000&q=80",
    accent: "float",
    stylingTips: [
      "Let negative wall space become part of the composition.",
      "Use with large-format photography or monochrome art.",
      "Keep adjacent furniture low to preserve sightlines.",
    ],
    layoutIdeas: ["Single museum float", "Linear horizon trio", "Corner pivot"],
    products: ["ff-statement-70"],
  },
];

export const products: Product[] = [
  {
    id: "wg-black-60",
    slug: "wooden-glossy-ring-black-60",
    name: "Glossy Ring — Onyx",
    tagline: "Black ring detail. Warm wood tone body.",
    collection: "wooden-glossy-ring",
    description: "A sculptural ring floats your artwork forward with soft, directional depth.",
    longDescription:
      "Hand-finished wood body with a deep onyx ring accent. Calibrated for living rooms, bedrooms, and boutique hospitality. Each piece is inspected for edge uniformity and ring alignment before dispatch.",
    basePriceGhs: 890,
    heroImage:
      "https://images.unsplash.com/photo-1615876234889-fd9cd39b94a8?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80",
    ],
    materials: ["wood", "composite"],
    finishes: ["matte-black", "gloss-charcoal"],
    sizesCm: [
      { label: '50 × 70', w: 50, h: 70, priceDelta: 0 },
      { label: '60 × 80', w: 60, h: 80, priceDelta: 220 },
      { label: '70 × 100', w: 70, h: 100, priceDelta: 480 },
    ],
    highlights: ["Ring-forward depth", "Anti-glare glazing option", "Reinforced hanging system"],
    idealFor: ["Family homes", "Airbnb living walls", "Bedroom suites"],
    installationAddOnGhs: 150,
  },
  {
    id: "wg-gold-60",
    slug: "wooden-glossy-ring-gold-60",
    name: "Glossy Ring — Aurum",
    tagline: "Gold ring highlight for luminous interiors.",
    collection: "wooden-glossy-ring",
    description: "Warm metallic ring detail that catches Accra’s golden hour beautifully.",
    longDescription:
      "Micro-textured ring with controlled reflectance—never loud, always intentional. Ideal with sand, cream, and charcoal palettes.",
    basePriceGhs: 960,
    heroImage:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    ],
    materials: ["wood"],
    finishes: ["warm-oak", "gold-accent"],
    sizesCm: [
      { label: '50 × 70', w: 50, h: 70, priceDelta: 0 },
      { label: '60 × 80', w: 60, h: 80, priceDelta: 240 },
      { label: '70 × 100', w: 70, h: 100, priceDelta: 520 },
    ],
    highlights: ["Controlled metallic reflectance", "Archival mounting", "Soft-touch edges"],
    idealFor: ["Dining rooms", "Salons", "Boutique retail"],
    installationAddOnGhs: 150,
  },
  {
    id: "cm-gallery-80",
    slug: "canvas-mount-gallery-80",
    name: "Canvas Mount — Atelier",
    tagline: "Gallery tension. Museum silence.",
    collection: "canvas-mount",
    description: "Canvas-forward mount that elevates originals and fine art prints.",
    longDescription:
      "Structural backing with humidity-aware spacing for Ghana’s climate cycles. Finished with a whisper-thin face that keeps the art hero.",
    basePriceGhs: 1280,
    heroImage:
      "https://images.unsplash.com/photo-1615876234889-fd9cd39b94a8?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1618219971214-38a49e0c1d5d?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1615876234889-fd9cd39b94a8?auto=format&fit=crop&w=1600&q=80",
    ],
    materials: ["composite", "wood"],
    finishes: ["matte-black", "gloss-charcoal"],
    sizesCm: [
      { label: '60 × 80', w: 60, h: 80, priceDelta: 0 },
      { label: '80 × 100', w: 80, h: 100, priceDelta: 360 },
      { label: '90 × 120', w: 90, h: 120, priceDelta: 720 },
    ],
    highlights: ["Climate-aware spacing", "Museum presentation", "Optional UV glazing"],
    idealFor: ["Studios", "Offices", "Collector homes"],
    installationAddOnGhs: 200,
  },
  {
    id: "tb-stair-90",
    slug: "thick-edge-black-stair-90",
    name: "Thick Edge — Noir Cascade",
    tagline: "Bold massing for stair galleries and family chronologies.",
    collection: "thick-edge-black",
    description: "Deep black edge profile engineered for rhythm along vertical circulation.",
    longDescription:
      "Reinforced corners and concealed fixing for high-traffic walls. Designed for cascading layouts with consistent sightlines.",
    basePriceGhs: 1100,
    heroImage:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80",
    ],
    materials: ["wood", "metal-edge"],
    finishes: ["matte-black"],
    sizesCm: [
      { label: '40 × 50', w: 40, h: 50, priceDelta: -120 },
      { label: '50 × 70', w: 50, h: 70, priceDelta: 0 },
      { label: '60 × 90', w: 60, h: 90, priceDelta: 280 },
    ],
    highlights: ["Stair-optimized fixing", "Edge massing control", "Chronology-friendly grid"],
    idealFor: ["Stairwells", "Family walls", "Classic interiors"],
    installationAddOnGhs: 220,
  },
  {
    id: "ff-statement-70",
    slug: "float-frame-statement-70",
    name: "Float — Horizon Line",
    tagline: "Paper-thin edge. Maximum levitation.",
    collection: "float-frames",
    description: "Our architectural float system—barely there, entirely unforgettable.",
    longDescription:
      "Precision-milled edge with sub-millimeter tolerance. For statement photography, monochrome works, and gallery walls where silence is luxury.",
    basePriceGhs: 1680,
    heroImage:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1618219971214-38a49e0c1d5d?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1615876234889-fd9cd39b94a8?auto=format&fit=crop&w=1600&q=80",
    ],
    materials: ["metal-edge", "wood"],
    finishes: ["matte-black", "gloss-charcoal", "gold-accent"],
    sizesCm: [
      { label: '60 × 80', w: 60, h: 80, priceDelta: 0 },
      { label: '70 × 100', w: 70, h: 100, priceDelta: 420 },
      { label: '80 × 120', w: 80, h: 120, priceDelta: 880 },
    ],
    highlights: ["Sub-mm edge tolerance", "Invisible hanging", "Curator-grade alignment"],
    idealFor: ["Penthouses", "Galleries", "Executive suites"],
    installationAddOnGhs: 280,
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

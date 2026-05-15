import type { MetadataRoute } from "next";
import { collections, products } from "@/lib/data/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const staticRoutes = [
    "/",
    "/collections",
    "/visualizer",
    "/book",
    "/about",
    "/installation",
    "/gallery",
    "/contact",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));

  const collectionRoutes = collections.map((c) => ({
    url: `${base}/collections/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const productRoutes = products.map((p) => ({
    url: `${base}/product/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.65,
  }));

  return [...staticRoutes, ...collectionRoutes, ...productRoutes];
}

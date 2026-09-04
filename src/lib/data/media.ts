import fs from "node:fs";
import path from "node:path";
import { finishFamilies, type FinishFamily, type GalleryItem } from "@/lib/data/gallery";

/**
 * Reads `public/media/<family>/` and turns whatever is in there into gallery
 * items. Dropping a photo into one of those folders puts it on the site—no code
 * change, no manifest to keep in sync.
 *
 * Captions are optional. A folder may carry a `captions.json` keyed by filename
 * to set the title, room, sizes and blurb; anything missing falls back to the
 * filename. This runs at build time on the server, never in the browser.
 */

const MEDIA_ROOT = path.join(process.cwd(), "public", "media");
const IMAGE_PATTERN = /\.(jpe?g|png|webp|avif|svg)$/i;

/** `rooms` holds the visualizer's sample walls, which are not gallery work. */
const NON_GALLERY_FOLDERS = new Set(["rooms"]);

interface Caption {
  title?: string;
  room?: string;
  sizes?: string;
  blurb?: string;
  /** Lower sorts first. Studio photography is given a low number. */
  order?: number;
}

function readCaptions(dir: string): Record<string, Caption> {
  const file = path.join(dir, "captions.json");
  if (!fs.existsSync(file)) return {};

  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, Caption>;
  } catch (error) {
    console.warn(`[media] ${file} is not valid JSON, ignoring it`, error);
    return {};
  }
}

/** Width ÷ height, read from the file header so the grid never jumps. */
function imageRatio(file: string): number {
  try {
    if (file.toLowerCase().endsWith(".svg")) {
      const head = fs.readFileSync(file, "utf8").slice(0, 2000);
      const viewBox = head.match(/viewBox="([\d.\-\s]+)"/i)?.[1]?.trim().split(/\s+/);
      if (viewBox?.length === 4) {
        const w = Number(viewBox[2]);
        const h = Number(viewBox[3]);
        if (w > 0 && h > 0) return w / h;
      }
      return 1;
    }

    const buf = fs.readFileSync(file);

    if (buf.length > 24 && buf.toString("ascii", 12, 16) === "IHDR") {
      return buf.readUInt32BE(16) / buf.readUInt32BE(20);
    }

    // JPEG: walk the segments to the start-of-frame marker.
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) {
        i++;
        continue;
      }
      const marker = buf[i + 1];
      const isFrame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isFrame) return buf.readUInt16BE(i + 7) / buf.readUInt16BE(i + 5);
      i += 2 + buf.readUInt16BE(i + 2);
    }
  } catch {
    // fall through
  }

  return 1;
}

function titleFromFilename(file: string) {
  return path
    .basename(file, path.extname(file))
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function loadGalleryItems(): GalleryItem[] {
  if (!fs.existsSync(MEDIA_ROOT)) return [];

  const known = new Set(finishFamilies.map((f) => f.key));
  const items: (GalleryItem & { order: number })[] = [];

  for (const entry of fs.readdirSync(MEDIA_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory() || NON_GALLERY_FOLDERS.has(entry.name)) continue;

    if (!known.has(entry.name as FinishFamily)) {
      console.warn(`[media] public/media/${entry.name} is not a known finish family, skipping it`);
      continue;
    }

    const family = entry.name as FinishFamily;
    const dir = path.join(MEDIA_ROOT, entry.name);
    const captions = readCaptions(dir);

    for (const file of fs.readdirSync(dir).filter((f) => IMAGE_PATTERN.test(f))) {
      const caption = captions[file] ?? {};

      items.push({
        id: `${family}-${path.basename(file, path.extname(file))}`,
        title: caption.title ?? titleFromFilename(file),
        family,
        room: caption.room ?? "Studio",
        sizes: caption.sizes ?? "Sizes on request",
        blurb: caption.blurb ?? "",
        image: `/media/${family}/${file}`,
        ratio: imageRatio(path.join(dir, file)),
        order: caption.order ?? 100,
      });
    }
  }

  return items
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
    .map(
      (item): GalleryItem => ({
        id: item.id,
        title: item.title,
        family: item.family,
        room: item.room,
        sizes: item.sizes,
        blurb: item.blurb,
        image: item.image,
        ratio: item.ratio,
      }),
    );
}

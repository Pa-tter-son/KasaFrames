# Media folder

Everything the site shows lives here. Files are served straight from this
domain as `/media/<folder>/<file>` — no external image host.

```
public/media/
  acrylic-gloss/   ← gloss panel work
  framed-matte/    ← frame + mat border
  canvas-wrap/     ← gallery-wrapped canvas
  photo-block/     ← frameless mounted blocks
  gallery-wall/    ← composed multi-piece walls
  staircase/       ← rising cascades
  rooms/           ← empty rooms for the visualizer (NOT shown in the gallery)
```

## Adding a photo to the gallery

**Drop the file into the right folder. That is the whole job** — the gallery
reads these folders at build time, so the photo appears on the site with no code
change. Commit, push, and Vercel rebuilds with it.

The folder name decides the category. The filename becomes the title:
`stair-cascade-quotes.jpg` → "Stair Cascade Quotes".

## Writing a proper caption (optional but worth it)

Each folder can hold a `captions.json` keyed by filename:

```json
{
  "adinkra-symbol-panel.jpg": {
    "title": "Adinkra Panel — Nine Symbols",
    "room": "Sitting room",
    "sizes": "60 × 90 cm",
    "blurb": "Nine Adinkra symbols on a cream ground, each in its own colour block.",
    "order": 1
  }
}
```

Every field is optional. `order` sorts within the folder — low numbers first, so
studio photography is given 1, 2, 3 and the licensed stock sits at 50+.

## Photo guidelines

- **1600 px on the long edge**, JPEG quality 70–80. That lands around 200–400 KB.
- Shoot square to the wall. Phone ultra-wide lenses bend the edges and make the
  frames look like the wrong size.
- The aspect ratio is read from the file itself, so the grid never jumps while
  loading. Nothing to declare.

## Still missing

The **Adinkra symbol panel** (cream ground, nine coloured squares) was not among
the files saved to this machine. Drop it into `gallery-wall/` — or into a new
`cultural/` folder if you want it as its own category, in which case add the
family to `finishFamilies` in `src/lib/data/gallery.ts` first.

## A note on the licensed stock

Files with `order: 50`+ in the captions are licensed stock, chosen to show a
finish honestly rather than to pass as KasaFrames work — which is why their
captions describe the finish and room and never name a client. Replace them with
studio photography as it comes in; delete the file and its caption entry and the
gallery adjusts itself.

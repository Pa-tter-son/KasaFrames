# Gallery photography

Images here are served straight from this domain (`/gallery/<file>.jpg`).

## What is here now

Licensed stock photography, chosen so each finish is shown honestly—frame
profile, mat border, canvas edge depth, block stand-off. It is **not** KasaFrames
work, so the captions describe the finish and the room, never a named client.

**Replace these with studio photos as they become available.** Your own work will
always sell the studio better than stock.

## Adding a studio photo

1. Drop the file in this folder. Use a lowercase, hyphenated name that says what
   it is: `acrylic-gloss-portrait-trio.jpg`, `stair-cascade-quotes.jpg`.
2. Export at roughly **1600 px on the long edge**, JPEG quality 70–80. That keeps
   each file near 200–400 KB, which is what the current set costs.
3. Add one entry to `src/lib/data/gallery.ts`:

```ts
{
  id: "g-acrylic-portraits",
  title: "Acrylic Gloss — Portrait Set",
  family: "acrylic-gloss",
  room: "Studio",
  sizes: "12 × 16, 16 × 20 and 20 × 24 inches",
  blurb: "Three gloss panels stepped by size, so the scale difference reads at a glance.",
  image: "/gallery/acrylic-gloss-portrait-trio.jpg",
  ratio: 1.0, // width ÷ height of the file
},
```

`ratio` is width ÷ height. Getting it right stops the grid from jumping while
images load.

## Families waiting on your photography

Two families are defined in the data file but have no photos yet, so their filter
chips stay hidden until you add one. These are the ones your own shots cover
better than any stock image could:

| Family          | What to shoot                                                        |
| --------------- | -------------------------------------------------------------------- |
| `acrylic-gloss` | The black gloss panels—quote panels and portrait prints, sizes staggered so scale reads |
| `staircase`     | The stair cascade, shot down the flight so the rising centre line is visible |

Also worth adding to the existing families: the Adinkra symbol panel
(`gallery-wall` or a new cultural family), the corridor portrait grid, and the
size-comparison shot with the inch labels—that one answers the question customers
ask most.

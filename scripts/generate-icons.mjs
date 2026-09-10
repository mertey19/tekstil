// Rasterises the Siliver Silen app-icon artwork into the icon set served from /public.
//
// Source of truth: assets/brand/icon-source.jpg (1024 x 1024 render).
// The artwork is a mint rounded square that already touches all four canvas
// edges; the only stray white sits in the four corners outside the rounding
// radius (measured at ~19.5% of the side). We shave a 3px edge inset to drop
// the white anti-aliasing halo, then clip to a 20% rounded rect so the corners
// come out transparent instead of white.
//
//   full artwork -> icon.png (192), apple-touch-icon.png (180), icon-48.png (48),
//                   favicon.ico entries 32 + 48, icon.svg (clipped wrapper)
//   zoomed crop  -> favicon.ico entry 16 only (the full frame turns to mush at
//                   16px, so the small entry crops in on the S)
//
// Run:  node scripts/generate-icons.mjs
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");
const SRC = path.join(root, "assets", "brand", "icon-source.jpg");

const SIDE = 1024;
const EDGE_INSET = 3; // drops the white blend on the outermost pixels
const RADIUS_PCT = 20; // artwork measures ~19.53%; clipping slightly wider guarantees no white
const EMBLEM_CENTRE = { x: 532, y: 526 }; // centroid of the gold bbox (110,130)-(955,922)
const ZOOM_SIDE = 820; // keeps the rounded silhouette while the S stays readable at 16px

const source = await readFile(SRC);

const fullCrop = {
  left: EDGE_INSET,
  top: EDGE_INSET,
  width: SIDE - EDGE_INSET * 2,
  height: SIDE - EDGE_INSET * 2,
};
const zoomCrop = {
  left: Math.round(EMBLEM_CENTRE.x - ZOOM_SIDE / 2),
  top: Math.round(EMBLEM_CENTRE.y - ZOOM_SIDE / 2),
  width: ZOOM_SIDE,
  height: ZOOM_SIDE,
};

const roundedMask = (side) => {
  const r = (side * RADIUS_PCT) / 100;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${side}" height="${side}">` +
      `<rect width="${side}" height="${side}" rx="${r}" ry="${r}" fill="#fff"/></svg>`,
  );
};

/** Square master with the corners clipped away (transparent). */
const master = (crop) =>
  sharp(source)
    .extract(crop)
    .composite([{ input: roundedMask(crop.width), blend: "dest-in" }])
    .png()
    .toBuffer();

const fullMaster = await master(fullCrop);
const zoomMaster = await master(zoomCrop);

/**
 * Downscale with a light unsharp pass once the detail gets tiny. Lanczos keeps
 * 32px and up crisp, but at 16px its ringing speckles the gold gradient, so the
 * smallest entry uses the smoother mitchell kernel instead.
 */
async function render(input, size) {
  const pipeline = sharp(input).resize(size, size, {
    kernel: size <= 16 ? "mitchell" : "lanczos3",
    fit: "fill",
  });
  if (size <= 48) pipeline.sharpen({ sigma: 0.6, m1: 0.5, m2: 1.5 });
  return pipeline.png({ compressionLevel: 9 }).toBuffer();
}

/**
 * iOS ignores alpha and composites Apple touch icons onto black, so the corners
 * are filled with mint lifted from further inside the artwork (a zoomed copy of
 * the same frame) rather than a flat swatch that would seam against the gradient.
 */
async function renderOpaque(size) {
  const bleed = Math.round(fullCrop.width * 1.35);
  const cornerFill = await sharp(source)
    .extract(fullCrop)
    .resize(bleed, bleed, { kernel: "lanczos3" })
    .extract({
      left: Math.round((bleed - fullCrop.width) / 2),
      top: Math.round((bleed - fullCrop.width) / 2),
      width: fullCrop.width,
      height: fullCrop.width,
    })
    .png()
    .toBuffer();

  // composite at full size first: sharp resizes before compositing within one pipeline
  const flattened = await sharp(cornerFill).composite([{ input: fullMaster }]).flatten().png().toBuffer();

  return sharp(flattened)
    .resize(size, size, { kernel: "lanczos3", fit: "fill" })
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** ICO container with PNG-compressed entries (supported since Windows Vista). */
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

/**
 * /icon.svg is kept as a stable, scalable brand file: the render embedded at
 * full resolution and clipped to the same rounded square. It is deliberately
 * not a hand-drawn trace - the client picked this exact artwork.
 */
function buildSvgWrapper() {
  const r = (SIDE * RADIUS_PCT) / 100;
  const href = `data:image/jpeg;base64,${source.toString("base64")}`;
  // scale the inset crop back up so source(3,3)..(1021,1021) fills the viewBox
  const scale = SIDE / fullCrop.width;
  const drawn = (SIDE * scale).toFixed(3);
  const shift = (-EDGE_INSET * scale).toFixed(3);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIDE}" height="${SIDE}" viewBox="0 0 ${SIDE} ${SIDE}">` +
    `<title>Siliver Silen</title>` +
    `<clipPath id="r"><rect width="${SIDE}" height="${SIDE}" rx="${r}" ry="${r}"/></clipPath>` +
    `<g clip-path="url(#r)">` +
    `<image x="${shift}" y="${shift}" width="${drawn}" height="${drawn}" href="${href}"/>` +
    `</g></svg>\n`
  );
}

await writeFile(path.join(pub, "icon.png"), await render(fullMaster, 192));
await writeFile(path.join(pub, "icon-48.png"), await render(fullMaster, 48));
await writeFile(path.join(pub, "apple-touch-icon.png"), await renderOpaque(180));
await writeFile(
  path.join(pub, "favicon.ico"),
  buildIco([
    { size: 16, data: await render(zoomMaster, 16) },
    { size: 32, data: await render(fullMaster, 32) },
    { size: 48, data: await render(fullMaster, 48) },
  ]),
);
await writeFile(path.join(pub, "icon.svg"), buildSvgWrapper(), "utf8");

console.log("icons written");

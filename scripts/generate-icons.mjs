// Rasterises the Siliver Silen logo into the icon set served from /public.
//
//   full lockup  -> icon.png (192), apple-touch-icon.png (180)
//   emblem only  -> icon-48.png (48), favicon.ico (16/32/48)
//
// Run after scripts/generate-logo.py:  node scripts/generate-icons.mjs
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");

const lockup = await readFile(path.join(pub, "icon.svg"));
const mark = await readFile(path.join(pub, "icon-mark.svg"));

const render = (svg, size) =>
  sharp(svg, { density: 1200 }).resize(size, size, { fit: "fill" }).png({ compressionLevel: 9 }).toBuffer();

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

await writeFile(path.join(pub, "icon.png"), await render(lockup, 192));
await writeFile(path.join(pub, "apple-touch-icon.png"), await render(lockup, 180));
await writeFile(path.join(pub, "icon-48.png"), await render(mark, 48));

const icoSizes = [16, 32, 48];
const icoImages = [];
for (const size of icoSizes) {
  icoImages.push({ size, data: await render(mark, size) });
}
await writeFile(path.join(pub, "favicon.ico"), buildIco(icoImages));

console.log("icons written");

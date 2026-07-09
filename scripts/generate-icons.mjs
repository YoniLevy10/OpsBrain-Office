import sharp from "sharp";
import { mkdirSync, readFileSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const BRAND_SVG = join(ROOT, "public", "brand", "brain-icon.svg");
const OUT_PUBLIC = join(ROOT, "public", "icons");
const OUT_APP = join(ROOT, "app");

mkdirSync(OUT_PUBLIC, { recursive: true });

const svg = readFileSync(BRAND_SVG);

async function writePng(path, size, extend = 0) {
  let img = sharp(svg).resize(size, size, { fit: "contain", background: "#000000" });
  if (extend > 0) {
    img = img.extend({
      top: extend,
      bottom: extend,
      left: extend,
      right: extend,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    });
  }
  await img.png().toFile(path);
  console.log("wrote", path);
}

await writePng(join(OUT_PUBLIC, "icon-192.png"), 192);
await writePng(join(OUT_PUBLIC, "icon-512.png"), 512);
await writePng(join(OUT_PUBLIC, "icon-maskable-512.png"), 384, 64);
await writePng(join(OUT_APP, "icon.png"), 32);
await writePng(join(OUT_APP, "apple-icon.png"), 180);

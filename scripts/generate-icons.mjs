import sharp from "sharp";
import { mkdirSync } from "fs";
import { join } from "path";

const OUT = join(process.cwd(), "public", "icons");
mkdirSync(OUT, { recursive: true });

function svg(size) {
  const pad = Math.round(size * 0.15);
  const inner = size - pad * 2;
  const r = Math.round(inner * 0.2);
  const icon = Math.round(inner * 0.55);
  const ox = pad + (inner - icon) / 2;
  const oy = pad + (inner - icon) / 2;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect x="${pad}" y="${pad}" width="${inner}" height="${inner}" rx="${r}" fill="#FFFFFF" stroke="#E2E7EF" stroke-width="${Math.max(1, size / 64)}"/>
  <rect x="${ox}" y="${oy}" width="${icon}" height="${icon}" rx="${Math.round(r * 0.5)}" fill="rgba(13,155,115,0.12)"/>
  <path d="M${ox + icon * 0.15} ${oy + icon * 0.5} H${ox + icon * 0.45} L${ox + icon * 0.35} ${oy + icon * 0.85} L${ox + icon * 0.55} ${oy + icon * 0.25} L${ox + icon * 0.65} ${oy + icon * 0.55} H${ox + icon * 0.85}" fill="none" stroke="#0D9B73" stroke-width="${Math.max(2, size / 16)}" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`);
}

async function writePng(name, size, extend = 0) {
  let img = sharp(svg(size));
  if (extend > 0) {
    img = img.extend({
      top: extend,
      bottom: extend,
      left: extend,
      right: extend,
      background: { r: 245, g: 247, b: 250, alpha: 1 },
    });
  }
  await img.png().toFile(join(OUT, name));
  console.log("wrote", name);
}

await writePng("icon-192.png", 192);
await writePng("icon-512.png", 512);
await writePng("icon-maskable-512.png", 384, 64);

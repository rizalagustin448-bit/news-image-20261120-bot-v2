// news-image-20261120-bot-v2: copies the front-page image to /output/entry.png
// Validates the PNG (magic bytes + dimensions + size cap) before and after
// the copy, so a corrupt source or a truncated write fails loudly instead
// of silently producing a bad entry.
import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MAX_BYTES = 1024 * 1024;

function checkPng(path: string): { bytes: number; width: number; height: number } {
  const buf = readFileSync(path);
  if (!buf.subarray(0, 8).equals(PNG_MAGIC)) throw new Error(`${path} is not a PNG`);
  if (buf.length > MAX_BYTES) throw new Error(`${path} is ${buf.length} bytes, over the 1 MiB cap`);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  if (width > 1024 || height > 1024) throw new Error(`${path} is ${width}x${height}, over the 1024x1024 cap`);
  return { bytes: buf.length, width, height };
}

const src = new URL("./entry.png", import.meta.url);
const { bytes: srcBytes, width, height } = checkPng(src);
const out = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
mkdirSync(out, { recursive: true });
const dest = `${out}/entry.png`;
copyFileSync(src, dest);
const destBytes = checkPng(dest).bytes;
if (destBytes !== srcBytes) throw new Error(`copy mismatch: ${destBytes} vs ${srcBytes} bytes`);
if (statSync(dest).size !== srcBytes) throw new Error(`copy size mismatch on ${dest}`);
console.log(`wrote ${dest} (${srcBytes} bytes, PNG ${width}x${height})`);

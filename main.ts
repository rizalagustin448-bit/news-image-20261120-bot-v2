// news-image-20261120-bot-v2: copies the front-page image to /output/entry.png
import { copyFileSync, mkdirSync } from "node:fs";
const out = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
mkdirSync(out, { recursive: true });
copyFileSync(new URL("./entry.png", import.meta.url), `${out}/entry.png`);

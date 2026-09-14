#!/usr/bin/env node
/**
 * Generates one static cover per paper (public/papers/covers/<id>.svg) from
 * public/data/site-content.json, embedding the model figure (`paper.figure`)
 * as a data URL so the cover is a self-contained image the WebGL carousel and
 * the paper index can load lazily. Writes the cover path back into each
 * paper's `image` field. Run after editing papers or figures:
 *
 *   npm run build:covers
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const contentPath = path.join(root, "public/data/site-content.json");
const outDir = path.join(root, "public/papers/covers");
const { buildCoverSvg } = await import(pathToFileURL(path.join(root, "public/paper-cover.js")).href);

const mime = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".gif": "image/gif" };
const content = JSON.parse(fs.readFileSync(contentPath, "utf8"));
fs.mkdirSync(outDir, { recursive: true });

const keep = new Set();
content.papers.forEach((paper, index) => {
  let figure = null;
  if (paper.figure) {
    const file = path.join(root, "public", decodeURI(paper.figure));
    if (fs.existsSync(file)) {
      const type = mime[path.extname(file).toLowerCase()] || "application/octet-stream";
      figure = `data:${type};base64,${fs.readFileSync(file).toString("base64")}`;
    } else {
      console.warn(`figure missing for ${paper.id}: ${paper.figure}`);
    }
  }
  const name = `${paper.id}.svg`;
  fs.writeFileSync(path.join(outDir, name), buildCoverSvg(index, paper, figure));
  paper.image = `/papers/covers/${name}`;
  keep.add(name);
});
fs.readdirSync(outDir).forEach((name) => { if (!keep.has(name)) fs.unlinkSync(path.join(outDir, name)); });
fs.writeFileSync(contentPath, JSON.stringify(content, null, 2) + "\n");
console.log(`wrote ${content.papers.length} covers to public/papers/covers`);

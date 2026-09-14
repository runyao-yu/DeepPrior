#!/usr/bin/env node
// Builds a fully static copy of the site into ./out for GitHub Pages (or any static host).
//
// The site is a compiled Astro page living in public/ (public/mirror/index.html + assets);
// the Next.js shell only rewrites "/" to that file. Static hosts cannot run rewrites,
// so this script copies public/ to out/ and places index.html at the root.
//
// Base path: when the site is served from a sub-path (project Pages site such as
// https://<user>.github.io/DeepPrior/), set SITE_BASE_PATH="/DeepPrior". Every
// root-absolute reference ("/_astro/…", "/top/…", "/#engine", …) in HTML, CSS and JS
// is then prefixed. With an empty base path (custom domain or <user>.github.io repo)
// files are copied unchanged.
//
// usage: SITE_BASE_PATH=/DeepPrior node scripts/build-static-site.mjs
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const src = path.join(root, "public");
const out = path.join(root, "out");
let base = (process.env.SITE_BASE_PATH || "").trim().replace(/\/+$/, "");
if (base && !base.startsWith("/")) base = `/${base}`;

const skip = new Set(["mirror", ".DS_Store"]);
const textExt = new Set([".html", ".css", ".js", ".mjs", ".json", ".svg"]);
const topLevel = fs.readdirSync(src).filter((n) => !skip.has(n));
// matches "/top/…", '/_astro/…', url(/_astro/…), href="/#engine", content="/ogp.jpg" …
const names = topLevel.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
// "/#section" links only inside quotes (a regex literal such as /#pragma…/ must stay untouched)
const ref = new RegExp(`(["'\`(=])/(?=(?:${names.join("|")})(?:[/"'?#)]|$))|(["'\`])/(?=#)`, "g");

function rewrite(text) {
  if (!base) return text;
  return text
    .replace(ref, (m, a, b) => `${a ?? b}${base}/`)
    // Vite's modulepreload helper builds "/" + "_astro/…"
    .replace(/return"\/"\+n\}/g, `return"${base}/"+n}`);
}

// The compiled bundle routes by pathname ("/" = top page, anything else = sub page / 404).
// Under a base path every read of window.location.pathname in that bundle must see the path without
// it (Swup and the other chunks keep the real pathname so history.replaceState stays correct).
const PATH_SHIM = `const __sitePath=()=>{const p=window.location.pathname,b=${JSON.stringify(base)};return p===b||p===b+"/"?"/":p.startsWith(b+"/")?p.slice(b.length):p};`;
function rewriteScript(text) {
  if (!base || !text.includes("window.location.pathname")) return text;
  return PATH_SHIM + text.replaceAll("window.location.pathname", "__sitePath()");
}

function copy(from, to, rel) {
  const stat = fs.statSync(from);
  if (stat.isDirectory()) {
    fs.mkdirSync(to, { recursive: true });
    for (const name of fs.readdirSync(from)) {
      if (name === ".DS_Store") continue;
      copy(path.join(from, name), path.join(to, name), `${rel}/${name}`);
    }
    return;
  }
  const ext = path.extname(from);
  if (base && textExt.has(ext)) {
    let text = rewrite(fs.readFileSync(from, "utf8"));
    if (path.basename(from).startsWith("index.astro_astro_type_script")) text = rewriteScript(text);
    fs.writeFileSync(to, text);
  } else {
    fs.copyFileSync(from, to);
  }
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const name of topLevel) copy(path.join(src, name), path.join(out, name), `/${name}`);

// entry page at the root
const html = rewrite(fs.readFileSync(path.join(src, "mirror", "index.html"), "utf8"));
fs.writeFileSync(path.join(out, "index.html"), html);
// GitHub Pages: no Jekyll processing (keeps the _astro directory)
fs.writeFileSync(path.join(out, ".nojekyll"), "");
if (process.env.SITE_CNAME) fs.writeFileSync(path.join(out, "CNAME"), `${process.env.SITE_CNAME.trim()}\n`);

const count = (dir) => fs.readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? count(path.join(dir, e.name)) : 1), 0);
console.log(`static site written to out/ (${count(out)} files, base path "${base || "/"}")`);

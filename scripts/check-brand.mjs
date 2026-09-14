import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const excludedDirectories = new Set([".git", ".next", "node_modules"]);
const forbiddenBrand = ["al", "che"].join("");
const matches = [];

async function inspectDirectory(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;

    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.relative(projectRoot, absolutePath);

    if (entry.name.toLowerCase().includes(forbiddenBrand)) {
      matches.push(`${relativePath} (path)`);
    }

    if (entry.isDirectory()) {
      await inspectDirectory(absolutePath);
      continue;
    }

    if (!entry.isFile()) continue;
    const contents = await readFile(absolutePath);
    if (contents.toString("latin1").toLowerCase().includes(forbiddenBrand)) {
      matches.push(`${relativePath} (content)`);
    }
  }
}

await inspectDirectory(projectRoot);

if (matches.length > 0) {
  console.error("Legacy-brand references found:");
  for (const match of matches) console.error(`- ${match}`);
  process.exitCode = 1;
} else {
  console.log("Brand check passed.");
}

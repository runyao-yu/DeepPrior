// Shared, DOM-free paper-cover layout. Used by the browser (site-content-bootstrap.js, fallback runtime
// generation) and by scripts/build-paper-covers.mjs (static covers in public/papers/covers/).
export const COVER_W = 800;
export const COVER_H = 1131;

/* ---------------------------------------------------------------- paper covers
   Every paper cover is generated at runtime from its model-structure figure
   (`paper.figure`, any size / PNG / SVG) so all covers share one layout:
   header + rule, small index number, the figure fitted into a fixed box, a rule,
   and the paper title. The result is a portrait (1:sqrt 2) SVG data URL that the
   WebGL carousel loads as a texture and the paper index shows as a thumbnail. */
export function escapeXml(text) {
  return String(text).replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" }[c]));
}

// "**Name**" marks community members (rendered bold). Returns [{text, bold}] runs.
export function parseRuns(text) {
  const runs = [];
  String(text || "").split(/(\*\*[^*]+\*\*)/).forEach((part) => {
    if (!part) return;
    if (part.startsWith("**") && part.endsWith("**")) runs.push({ text: part.slice(2, -2), bold: true });
    else runs.push({ text: part, bold: false });
  });
  return runs;
}

// word-wrap runs into lines of [{text, bold}] keeping bold flags per word
export function wrapRuns(runs, maxChars, maxLines) {
  const words = [];
  runs.forEach((run) => {
    run.text.split(/(\s+)/).forEach((piece) => {
      if (piece.trim()) words.push({ text: piece, bold: run.bold });
    });
  });
  const lines = [];
  let line = [];
  let length = 0;
  words.forEach((word) => {
    const next = length + (line.length ? 1 : 0) + word.text.length;
    if (next > maxChars && line.length) {
      lines.push(line);
      line = [word];
      length = word.text.length;
    } else {
      line.push(word);
      length = next;
    }
  });
  if (line.length) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    const last = kept[maxLines - 1];
    last[last.length - 1] = { ...last[last.length - 1], text: last[last.length - 1].text.replace(/[,.;:]+$/, "") + "\u2026" };
    return kept;
  }
  return lines;
}

export function runsToTspans(lines, x, lineHeight) {
  return lines
    .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : lineHeight}">` + line.map((word, j) => `<tspan font-weight="${word.bold ? 700 : 400}">${j ? " " : ""}${escapeXml(word.text)}</tspan>`).join("") + "</tspan>")
    .join("");
}

export function venueLine(paper) {
  const venue = String(paper.venue || "").trim();
  const year = String(paper.year || "").trim();
  if (venue && /\b(19|20)\d\d\b/.test(venue)) return venue; // venue already carries its year(s)
  return [venue, year].filter(Boolean).join(" · ");
}



export function wrapTitle(title, maxChars, maxLines) {
  const words = String(title).split(/\s+/);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].replace(/[\s,.;:]+$/, "").slice(0, maxChars - 1) + "\u2026";
    return kept;
  }
  return lines;
}

export function buildCoverSvg(index, paper, figureDataUrl) {
  // frameless white sheet with the violet accent bar (the original cover style); text keeps an inner margin
  const F = 44; // frame width
  const X = F + 54; // text left edge inside the sheet
  const R = COVER_W - F - 40; // text right edge
  const number = String(index + 1).padStart(2, "0");
  const titleLines = wrapTitle(paper.title, 42, 3);
  const titleText = titleLines
    .map((line, i) => `<tspan x="${X}" dy="${i === 0 ? 0 : 33}">${escapeXml(line)}</tspan>`)
    .join("");
  const authorLines = wrapRuns(parseRuns(paper.authors), 66, 3);
  const authorsText = runsToTspans(authorLines, X, 21);
  const venue = venueLine(paper);
  const figure = figureDataUrl
    ? `<image href="${figureDataUrl}" x="${X + 8}" y="232" width="${R - X - 8}" height="520" preserveAspectRatio="xMidYMid meet"/>`
    : `<text x="${COVER_W / 2}" y="500" fill="#a9abb5" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" letter-spacing="3" text-anchor="middle">MODEL FIGURE TO FOLLOW</text>`;
  // stack from the rule at y=790: title, authors, venue
  const titleY = 828;
  const authorsY = titleY + (titleLines.length - 1) * 33 + 40;
  const venueY = authorsY + (authorLines.length - 1) * 21 + 38;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${COVER_W}" height="${COVER_H}" viewBox="0 0 ${COVER_W} ${COVER_H}" role="img">
  <title>${escapeXml(paper.title)}</title>
  <rect width="${COVER_W}" height="${COVER_H}" fill="#ffffff"/>
  <rect width="22" height="${COVER_H}" fill="#745cff"/>
  <text x="${X}" y="118" fill="#09090c" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" letter-spacing="4">DEEPPRIOR / RESEARCH</text>
  <line x1="${X}" y1="150" x2="${R}" y2="150" stroke="#a9abb5" stroke-width="2"/>
  <text x="${X}" y="214" fill="#09090c" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="700" letter-spacing="-3">${number}</text>
  <text x="${R}" y="206" fill="#6c6f7a" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" letter-spacing="3" text-anchor="end">${escapeXml(paper.year || "")}</text>
  ${figure}
  <line x1="${X}" y1="790" x2="${R}" y2="790" stroke="#a9abb5" stroke-width="2"/>
  <text x="${X}" y="${titleY}" fill="#09090c" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" letter-spacing="-0.4">${titleText}</text>
  <text x="${X}" y="${authorsY}" fill="#2b2d33" font-family="Arial, Helvetica, sans-serif" font-size="15.5">${authorsText}</text>
  <text x="${X}" y="${venueY}" fill="#6c6f7a" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" letter-spacing="3">${escapeXml(venue.toUpperCase())}</text>
</svg>`;
}

export function svgToDataUrl(svg) {
  const bytes = typeof Buffer !== "undefined" ? Buffer.from(svg, "utf8").toString("base64") : btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${bytes}`;
}



# Research, About and Footer revision (2026-09-14b)

## Loading
- The Lottie circle/lines animation is hidden (`.Loading__lottieContainer`); the overlay keeps the tagline only.

## Navigation
- Header: Platform (`/#engine`) · Research (`/#works`) · People (`/#about`) · About (`/#company`); the stellla item is kept as an HTML comment. Contact button reads `Contact`.
- Side menu and footer mirror the same four sections; footer links are LinkedIn (company page) and a non-clickable `X` placeholder. TECH BLOG / note / YouTube / Recruit / Privacy Policy / License are removed.
- Scroll indicator: `WORKS` → `RESEARCH`, `VISION` → `ABOUT`, `SERVICE` entry hidden.

## Paper carousel (`#works`)
- The 16:9 "TV" screen is a portrait page: bundle `MESH_ASPECT` = 0.7071 and the `ThumbnailScreen` mesh is scaled to 1:√2 × 1.18.
- Ten papers (`public/data/site-content.json` → `papers`, any count ≥ 2). Each record has `category` (one of `paperCategories[].key`), `figure` (root-relative PNG/SVG of the model structure, any size) and `title`.
- Covers are generated at runtime by `site-content-bootstrap.js` (`buildCoverSvg`): 800×1131 SVG with `DEEPPRIOR / RESEARCH` header + rule, small index number top-left, the figure fitted into a 624×640 box (`preserveAspectRatio: meet`), a rule, the wrapped title (≤ 3 lines) and the details line. The SVG is embedded as a data URL, used both as WebGL texture (`?w=1024` suffix skipped for data URLs) and as the index thumbnail.
- `All Papers` links to `/#papers`.

## Paper index (`#papers`, new section after the carousel)
- In-flow transparent layer, same card language as the platform section, three vertical columns from `paperCategories` (electricity price / renewable generation / load forecasting), decorative tick rails with vertical labels on both margins. Registered as scroll section `papers` (the carousel layer fades when it enters).

## About (`#company`, former Vision)
- Pure black page (`#company` background, header forced white). Title path = outlined `ABOUT` (Liberation Sans Bold, generated with fontTools). Left text: “We are a quantitative research organization developing advanced AI models for power markets.” Right marker lines (EN / DE / ZH / JA), white marker with black text, typed in by the existing controller.
- The triangle / light glow is covered by the black page.

## Hidden sections
- `vision_out`, `service_in`, `service` and `stellla` markup moved verbatim to `public/mirror/hidden-sections.html` (not loaded). The bundle null-guards their trigger registrations; the outro wrapper registers `outro_in`, which enters the `footer` state (header/indicator hide) and doubles as the About fade-out trigger.

## Footer
- Contact button toggles a details panel: Place — Frankfurt am Main, Germany; Email — deepprior@outlook.com. Header / menu `Contact` links open the panel after scrolling.

## Bundle
- All compiled-bundle edits live in `scripts/patch-site-bundle.py` (`npm run patch:bundle`, idempotent).

## Revision 2026-09-14c
- Loading overlay is a plain black cover (Lottie and scrambled text hidden); the WebGL scene fade-in is 0.8 s instead of 3 s.
- Platform: the third actions row is `RISK` (mean P90 − P10, graded high / moderate / low). First reveal auto-tours Day-ahead → Intraday → Balancing → Day-ahead (4.2 s each) and then stays; any pill click stops the tour. Selecting a market flashes a light sweep on the pill and the chart card edges (1.5 s).
- Paper covers carry a 44 px `#050508` frame around the off-white sheet (as the original placeholders did).
- About: rendered on the shared hero renderer like People (bundle maps `vision` → `kv`; light mission/vision blends forced to 0); `ABOUT` is solid white; marker lines are `Frontier` / `Selective` / `Arcane`.
- Footer copyright year 2026.

## Revision 2026-09-14d
- Loading overlay fully hidden; the scene appears on the first frame (no fade-in).
- Paper covers are flat pages: `PlaneGeometry(8, 4.5)` replaces the curved `ThumbnailScreen`, the fragment lens distortion is reduced to a faint chromatic fringe, and the radial vignette became a page-edge shade, so the sheet and its dark frame stay aligned.
- Footer contact block aligned to the bottom, next to the copyright.
- About: right-hand words (Frontier / Selective / Arcane) are plain white, centred in the right half; the left statement has two more lines.

## Revision 2026-09-14e
- Loading: plain black cover while shaders compile (nothing animates on it); the original 3 s triangle entrance of the hero is kept.
- Paper page bends outward (edges toward the viewer) so the dark frame reads as a raised border.
- Paper index: no category headings; one three-column grid ordered by paper number, 16 shown by default, a "Show 16 more papers" button reveals the next 16 (category shown as the first tag on each card).
- About: left statement is a single paragraph.

## Revision 2026-09-14f
- Loading: the hero's 3 s entrance now starts while the black cover fades, so the blueprint/wireframe first frame never shows on its own.
- Paper page bends toward the viewer (convex).
- Real papers (16): `papers[]` records carry `title`, `authors` (community members wrapped in `**…**` → bold), `affiliations`, `venue`, `year`, `category` (`price` / `renewable` / `load` / `foundation`), `figure` (`/papers/Model_figures/…png`). Covers show title, authors (bold members) and VENUE · YEAR; index cards add affiliations. Empty `venue` (preprints) shows the year only.

## Revision 2026-09-14g
- Static covers: `npm run build:covers` (`scripts/build-paper-covers.mjs`, layout shared with the browser in `public/paper-cover.js`) writes `public/papers/covers/<id>.svg` and sets `papers[].image`; the page no longer fetches figures before starting the WebGL bundle (this was the long black cover). Runtime generation remains as a fallback when `image` is empty.
- Carousel shows the first 10 papers; the index shows all. Cover sheet is pure white; the page texture is sampled flat (no lens/chromatic offsets) so the frame and sheet share one curvature.
- Index cards: equal size (grid rows 1fr, clamped title/authors/affiliations), no category tag, paper links point to the publisher / OpenReview / arXiv pages.
- Data: 15 papers, Title Case titles, venues/years per the 2026-09-14 review (paper 3: PSCC 2026 · EPSR 2027; 13: EEM 2026; 14: 2021; 8: 2023).

## Revision 2026-09-14h (release)
- Loading: the cover lifts as soon as assets and shaders are ready (the bundle's Lottie progress/logo choreography and its ~1 s minimum are skipped; cover fade 0.3 s).
- Paper covers: glass frame (dark translucent, hairline rule, rounded corners) — the page texture's alpha now drives the mesh alpha, so the WebGL scene shows through the frame. No pills under the carousel captions.
- Scroll indicator shows ticks only (labels hidden). Footer: "©2026 DeepPrior".
- Repo cleanup: hidden Service/stellla markup, service videos/icons, stellla logo, old placeholder covers/figures, design-reference screenshots and helper scripts removed.

## Revision 2026-09-14i
- Paper covers: frameless white sheet with the violet accent bar (original style), page bending toward the viewer.

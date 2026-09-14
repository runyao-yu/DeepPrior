# DeepPrior website

Interactive DeepPrior studio website built with Next.js 16. The homepage is a
self-contained browser experience served from `public/mirror/index.html`, with
its WebGL, media, font, and sound assets stored locally under `public/`.

## Requirements

- Node.js 20.9 or newer
- npm

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Editing site content

All regularly edited homepage content lives in one file:

- `public/data/site-content.json`

Its top-level sections are `hero` (the academic collaborator sentence), `news`,
`paperCategories`, `papers` and `people` (group labels, names, links,
affiliations, and biographies). Edit that file and reload the local page; no
HTML or JavaScript changes are needed.

Each paper needs a `title`, `authors` (wrap community members in `**…**` to
bold them), `affiliations`, `venue` (leave empty for preprints), `year`, a
`category` (one of the `paperCategories` keys) and a `figure`: a root-relative
model-structure image of any size, e.g. `/papers/Model_figures/my-model.png`.
Run `npm run build:covers` afterwards: it renders one cover per paper (header,
number, fitted figure, title, authors, venue · year) into `public/papers/covers/`
so every cover shares the same layout. The carousel shows the first ten papers;
"All papers" lists them all. Any number of papers ≥ 2 works. All compiled-bundle
edits live in `scripts/patch-site-bundle.py` (`npm run patch:bundle`).

## Intelligent Electricity Market Engine

The second homepage section (`#engine`, between the first page and Works) is a
data-visualization platform rendered by `public/market-engine.js` and styled by
`public/market-engine.css`. It reads `public/data/market-engine.json`; the
shipped file is deterministic placeholder data produced by
`npm run build:market-data`. Replace that JSON with real data of the same shape
(schema documented at the top of `scripts/build-market-engine-data.mjs`).
The compiled WebGL bundle carries four small guarded edits for the section
(`npm run patch:bundle`, idempotent); see
`docs/research/components/MarketEngineSection.spec.md`.

## Production preview

```bash
npm run build
npm run start
```

## Validation

Run all repository and production checks before pushing changes:

```bash
npm run validate
```

The validation suite checks that legacy branding has not been reintroduced,
validates the centralized content structure, runs ESLint and TypeScript, and
builds the static site into `out/`. To check only an edited content file, run
`npm run check:content`.

## Deployment (GitHub Pages)

The site is a pre-compiled static page (`public/` plus `public/mirror/index.html`),
so hosting does not need the Next.js server. `.github/workflows/pages.yml` runs
`npm run build:static` on every push to `main` and publishes `out/` with GitHub
Pages (Settings → Pages → Source must be **GitHub Actions**).

`scripts/build-static-site.mjs` copies `public/` to `out/`, places `index.html` at
the root and, when the site lives under a sub-path (project site such as
`https://<user>.github.io/DeepPrior/`), prefixes every root-absolute asset URL and
`/#section` link with that base path (`SITE_BASE_PATH`, injected by the workflow).
With a custom domain or a `<user>.github.io` repository the files are published
unchanged. Set `SITE_CNAME=example.com` to emit a `CNAME` file for a custom domain.

## Project structure

- `public/mirror/index.html` — homepage document and local navigation
- `public/data/site-content.json` — single editable source for homepage content
- `public/site-content-bootstrap.js` — renders shared content before WebGL starts
- `public/_astro/` — compiled interactive runtime and styles
- `public/common/scene.glb` — current DeepPrior hero geometry
- `public/brand/deepprior.svg` — DeepPrior wordmark
- `public/top/`, `public/sounds/`, `public/envmap/` — local page assets
- `scripts/build-triangle-scene.mjs` — deterministic hero-geometry builder
- `src/app/` — minimal Next.js application shell

Colors, animations, and non-content imagery remain unchanged until their
corresponding DeepPrior replacements are supplied.

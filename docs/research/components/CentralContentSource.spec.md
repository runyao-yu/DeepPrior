# Central Content Source Specification

## Overview

- **Editable source:** `public/data/site-content.json`.
- **Runtime loader:** `public/site-content-bootstrap.js`.
- **Consumers:** hero collaborator text, first-page News, six-paper Works carousel, and People profiles.
- **Interaction model:** content is loaded once before the existing WebGL/runtime modules initialize; all existing scroll, animation, responsive, and pointer behavior remains unchanged.

## Authoring contract

- A future editor changes text and paper image paths only in `public/data/site-content.json`.
- Do not duplicate editable News, paper, collaborator, or People profile content in `public/mirror/index.html`, `public/people-section.js`, or another data file.
- Keep the JSON human-readable with two-space indentation and grouped top-level keys in this order: `hero`, `news`, `papers`, `people`.
- Use root-relative public asset paths such as `/papers/my-paper.png` for paper images.
- Keep exactly six paper records until the WebGL snap geometry is deliberately redesigned; changing the array length is outside this refactor.

## Data schema

### `hero`

- `academicCollaborators`: the complete `Built with…` sentence displayed only on the first page.

### `news[]`

- `displayDate`: visible date string.
- `datetime`: machine-readable `YYYY-MM-DD` value for the `<time>` element.
- `text`: complete announcement text.

### `papers[]`

- `id`: stable identifier used by `data-works_id`.
- `displayDate`: two-line visible date, encoded with `\n`.
- `datetime`: machine-readable value for `<time>`.
- `title`: paper title.
- `details`: author, journal, and publication-detail line.
- `categories`: visible pill-label array.
- `image`: root-relative PNG/JPEG/WebP/SVG texture path.
- `href`: paper destination; retain `/#works` for placeholders.

### `people`

- `heading`: section heading (`People`).
- `countLabel`: suffix used after the computed member count (`researchers`).
- `groups[]`: `key`, visible `label`, included `roles`, and numeric `direction` (`1` down, `-1` up).
- `members[]`: `name`, `role`, `initials`, `universities`, `links`, and editable `bio` description.
- Preserve the current 19-member dataset and Tara Esterl removal.

## Bootstrap and execution order

- `public/mirror/index.html` keeps structural containers but no editable News or paper records.
- Load one module bootstrap at the end of the document instead of loading People, News, and the main WebGL bundle independently.
- The bootstrap fetches `/data/site-content.json` with same-origin credentials, validates the required arrays and exact six-paper count, stores it as `window.DeepPriorContent`, and renders hero/News/Papers using DOM APIs and `textContent`.
- After rendering, import `people-section.js`, then `news-panel.js`, then the existing main WebGL bundle. The main bundle must see six finished `.Works__item` nodes and six `.Works__scroll_item[data-top_works_item]` nodes at initialization.
- On invalid or unavailable content, show a concise console error and do not initialize a partially populated WebGL page.
- Do not use synchronous XHR, `document.write`, `innerHTML` with content values, or runtime requests to GitHub/deepprior.com.

## Generated DOM contract

- News retains the exact `.News__newsItem > time.News__newsDate + p.News__newsText` structure and `data-lenis-prevent` list.
- Each paper caption retains `.Works__item[data-works_item]`, `.Works__item_info`, `.Works__item_date`, `.Works__item_title[data-works_title]`, title anchor, `.Works__item_title_ja`, and `.Works__item_categoryList` classes.
- Each paper texture retains `.Works__scroll_item[data-top_works_item][data-works_id] > .Works__scroll_item_thumb`.
- Preserve `All Papers`, all surrounding Works markup, local navigation, and exactly six items.
- `people-section.js` consumes `window.DeepPriorContent.people` synchronously and performs no fetch.

## Visual and behavioral invariants

- No typography, spacing, color, background, frame, visibility, responsive breakpoint, carousel timing, column motion, or scrollbar behavior changes.
- News remains hero-only, frameless, internally scrollable, and shows three of four items by default.
- Paper textures remain 800×450-compatible and drive the existing Three.js carousel.
- People remains `People` with `Leaders` and `Members` columns, 19 profiles, live shared hero background, and no collaborator text.

## Documentation and verification

- Update `README.md` with a short “Editing content” section and the six-paper constraint.
- Retire `public/data/committee.json`; it must not remain as a second source.
- Validate JSON parsing/schema/counts, JavaScript syntax, legacy-content absence from HTML/consumer scripts, `npm run check:brand`, lint, typecheck, production build, and desktop/tablet/mobile browser QA.

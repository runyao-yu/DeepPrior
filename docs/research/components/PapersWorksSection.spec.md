# PapersWorksSection Specification

## Overview

- **Target:** the existing `#works` structure, shared `public/data/site-content.json`, and six assets under `public/papers/placeholders/`.
- **Reference:** `docs/design-references/current-site/works-current-desktop.png`.
- **Interaction model:** native scroll-driven WebGL carousel; do not add a second carousel.

## DOM and engine contract

- Generate exactly six `.Works__item` caption nodes and six `.Works__scroll_item[data-top_works_item]` nodes from the shared content source before the WebGL bundle initializes.
- Preserve the existing `#works`, `.Works__container`, `.Works__content`, `.Works__scroll`, `data-works_item`, `data-works_title` and `data-works_id` structure.
- Change the six texture paths to `/papers/placeholders/paper-01.svg` through `paper-06.svg`.
- Keep all links local at `/#works` until real paper URLs are supplied.
- Change `More Works` to `All Papers`.

## Placeholder content

- Dates: `20XX 01` through `20XX 06`.
- Titles: `Paper 01 — Title to follow` through `Paper 06 — Title to follow`.
- Secondary line: `Authors / journal / publication details to follow`.
- Category pills: `research`, `paper`, `placeholder`.

## Placeholder assets

- SVG viewport: exactly 800×450 to match the existing textures.
- Background: `#050508`, visually merging with the Works scene.
- Center a portrait paper sheet within the wide frame; do not stretch it.
- Paper sheet: approximately 270×380, off-white `#f1f1ed`, black typography, 1px cool-gray rule.
- Header: `DEEPPRIOR / RESEARCH`; large slot number; footer: `PAPER COVER / PLACEHOLDER`.
- Each of the six slots should use a subtly different single accent from the current violet/blue palette.

## Existing computed styles to preserve

- `.Works__item`: absolute, flex, width 997.5px at desktop, lower-left offset 114px.
- `.Works__item_title`: acumin-pro, 40px/40px, weight 500, 10px bottom margin.
- `.Works__item_date`: Google Sans Code, 12px, weight 300, 2.4px tracking.
- `.Works__item_title_ja`: kozuka-gothic-pr6n, 14px, 2.1px tracking.
- Pills: Google Sans Code 12px/16.8px, 1px solid `#777`, 3.6px radius.

## States and behaviors

- The existing bundle loads each texture with Three.js `TextureLoader` and keeps the original distortion/perspective shader.
- Do not edit the minified WebGL bundle.
- Do not alter snap count, item count, section height or scroll triggers.
- Active caption transitions remain controlled by the existing page bundle.

## Responsive behavior

- Desktop 1440×900: current 40px caption title and three visible 3D planes.
- Tablet 768×900: current hamburger breakpoint and 21px caption title.
- Mobile 390×844: current 21px caption title and 5064px Works trigger height.
- Keep the 800×450 placeholder texture ratio at every viewport.

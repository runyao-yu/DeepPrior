# Header and News Revision Specification

## Overview

- **Targets:** `public/mirror/index.html`, `public/news-panel.css`, `public/news-panel.js`, and shared `public/data/site-content.json`.
- **Reference:** current local page at 1440×900 before this revision.
- **Interaction model:** the hero is time-driven; News is always visible on the first/`kv` scene and internally scrollable. News entries themselves are not interactive.

## First-page controls

- Remove the sound toggle from the desktop header entirely.
- Remove the MainLogo Quaternion and MainLogo Screen tuning containers entirely.
- Preserve the academic collaborator card in `#tweakpane-mainlogo-material`.
- Hide the entire academic collaborator container by default and reveal it only while `body[data-current_section="kv"]` is active. The `Built with…` text must not appear over People or any later section.
- The collaborator card is static information, not a link or canvas control. At 1440×900 its computed type is `11px / 17.05px`, weight `500`, in `"Roboto Mono", "Source Code Pro", Menlo, Courier, monospace`.
- The collaborator card must own its hit area and suppress click propagation so clicks do not fall through to the WebGL canvas. Use the default cursor and expose no anchor, button, role, or tabindex.
- Do not change the triangle/WebGL hero.

## News placement and visibility

- Preserve the existing `.News__newsArea` geometry and margins: fixed at the lower right, 400px wide, 20px from the bottom, with the existing 16px horizontal inner padding.
- Match the original presentation exactly: no surrounding border, no panel background, no backdrop blur, and no newly introduced frame.
- Show the News area automatically whenever `body[data-current_section="kv"]` is active; hide it outside the hero so it does not overlay Works or People.
- Remove the desktop `News` item from the top header navigation. News must not require a click to appear.
- Remove News navigation entries from the desktop header, mobile menu, and footer. News is passive hero content, not a destination.

## Text content

1. `05 August 2026` — `Our paper titled "OrderFusion: Encoding orderbook for end-to-end probabilistic intraday electricity price forecasting" is accepted by the journal Advanced Engineering Informatics`
2. `26 July 2026` — `Our paper titled "Counterfactual load forecasting with LLM-structured events and representation learning" is accepted by the journal Applied Energy`
3. `13 July 2026` — `Our paper titled "A market-rule-informed neural network for efficient imbalance electricity price forecasting" is accepted by the journal Advanced Engineering Informatics`
4. `26 June 2026` — `Our paper titled "Orderbook feature learning and asymmetric generalization in intraday electricity markets" is accepted by the journal Electric Power Systems Research`

## News DOM and behavior

- Each announcement is a `.News__newsItem` containing a semantic `<time>` and a plain `.News__newsText` paragraph; there are no links inside the list.
- Preserve the current item gap, bottom padding, and 1px separator.
- Match all News typography to the academic collaborator card: `"Roboto Mono", "Source Code Pro", Menlo, Courier, monospace`, 11px, weight 500, 1.55 line-height, normal tracking. The title may retain its existing case and spacing but must use the same face, size, weight and leading.
- `.News__newsList` is vertically scrollable and carries `data-lenis-prevent`.
- Hide the native scrollbar track and thumb in every browser while preserving mouse-wheel, trackpad, touch, and keyboard scrolling.
- Measure the first three rendered items and set the viewport height to exactly their combined height plus existing gaps; the fourth item is available by scrolling.
- Use a ResizeObserver so the three-item viewport remains correct at responsive widths.
- Do not add a click/open/close state to News.

## Responsive behavior

- Desktop 1440px: retain the current 400px panel width and lower-right alignment.
- Tablet/mobile: cap width to `calc(100vw - 36px)`, retain an 18px screen margin, and cap panel height so it stays within the viewport.
- Page-level horizontal overflow must remain zero.

## Hero-to-People spacer

- Remove the standalone `[data-top_section="mission_in"]` marker from the DOM entirely. A zero-height marker is insufficient because it shares the Mission offset and the legacy manager can still select `mission_in`, exposing the grey renderer at `/#about`.
- Current measured height is 900px at 1440×900 and 590.8px at 390×844; after the revision there must be no matching element.
- Do not change the Works outro height, the `#about`/Mission trigger height, or the People background implementation.

## Verification

- Sound, quaternion, and screen controls are absent from the DOM.
- News is visible on the first page without interaction, contains four items and zero anchors, shows three complete items, and scrolls internally to the fourth.
- The desktop header, mobile menu, and footer contain no News item.
- Clicking the collaborator text does not trigger a link, canvas action, or global click behavior.
- TypeScript, lint, production build, and desktop/mobile browser checks pass.

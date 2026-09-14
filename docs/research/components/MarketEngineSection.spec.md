# MarketEngineSection Specification

## Overview

- **Targets:** `public/market-engine.css`, `public/market-engine.js`, `public/data/market-engine.json`, `scripts/build-market-engine-data.mjs`, one new block in `public/mirror/index.html`, one loader line in `public/site-content-bootstrap.js`, and four guarded edits in the compiled bundle (`scripts/patch-site-bundle.py`).
- **Placement:** new `#engine` section (`data-top_section="engine"`) between the first page (`kv`) and `works_intro`. Works therefore becomes the third section; nothing after `works_intro` moves relative to it.
- **Interaction model:** in-flow scrolling section (no fixed layer) rendered as a transparent typographic layer over the shared hero WebGL renderer, exactly like People.

## Scroll and renderer integration

- The bundle registers `engine` right after `kv` with `start: "top bottom"`, `end: "bottom bottom"`, so `body[data-current_section]` becomes `engine` as soon as the section enters and returns to `kv` on the way back. `works_intro` then fires from the engine's last viewport, so the existing first-page → Works choreography (camera zoom-out, logo spin, WORKS title, grey Works scene, `works_in` sound) now plays from the engine into Works, unchanged.
- `TopPageMainScene.changeSection` maps `engine` to the `kv` state for the main logo, camera and background quad tree (same mapping People uses for `mission`); the centred 2D wordmark stays hidden because `DeepPriorLogo2D` only shows on the literal `kv` state. The tiled wordmark texture, triangle, fluid pointer warp and the two-pattern tile-flip cycle stay live behind the charts.
- `sectionNames` includes `engine` so a reload in the middle of the section resolves the correct state.
- The left scroll indicator gets an `ENGINE` item: `TOP` now tracks the `engine` trigger, `ENGINE` tracks `engine` + `works_intro`.
- Header, navigation, footer, News panel, Works, People and every later section are untouched.

## Data contract (`public/data/market-engine.json`)

- Generated deterministically by `npm run build:market-data`; `meta.placeholder = true` marks fake data. Replace the file with real data of the same shape (documented at the top of the build script). Timestamps are ISO strings with the market timezone offset and mark the start of each 15-minute interval; the page reads wall-clock labels straight from the strings.
- `dayAhead.history` (96 cleared quarter hours, delivery day D) + `dayAhead.forecast` (96 × `q10/q50/q90`, day D+1).
- `intraday.trades` (raw trades of the last 3 h: `t`, `price`, `volume`, `side`) + `intraday.forecast.buy/sell` (12 VWAP quantile points each).
- `balancing.history` (12 × `price`, `imbalance` MW; negative = system short) + `balancing.forecast` (12 quantile points).
- `generation.solar/wind/load` (96 quantile points, MW).

## Visual system

- Fonts: IBM Plex Mono for labels, axes, notes and metadata; acumin-pro / Helvetica Neue for the title, card titles and big numbers (identical to People). SVG text inherits the mono stack.
- Ink is white on the live scene; a single blue (`#7fb0ff`, buy / long) and red (`#ff7d92`, sell / short) pair is the only colour. P10–P90 bands are 13 % white fills; lines are hairlines (0.6–1.4 px); floors are barcode tick rows; notes are uppercase tracked captions (lieflat-charts Lupi/Basics grammar).
- Header block (eyebrow, title, lead, three stat tiles) stays fully transparent. Chart and action cards use `rgba(6,8,10,.42)` with a 7 px backdrop blur and a 1 px white rule so the WebGL scene stays visible while the charts remain legible during bright pattern phases.
- Entry motion: section fades/rises 650 ms on `data-current_section="engine"` (or in-view on any width); marks use draw / pop / fade / grow with short staggers; `prefers-reduced-motion` disables them. Clicking a chart replays its entry.

## Content

- Title: `Intelligent Electricity Market Engine`; eyebrow `02 — Platform`; stat tiles `3 markets`, `15 min`, `P10–P90`.
- Market switch pills: Day-ahead / Intraday / Balancing; one main chart card + one Suggested-actions card that both re-render on switch.
  - Day-ahead: today's cleared prices (one dot per hour) concatenated with tomorrow's quarter-hourly forecast (median + band) on one time axis; dotted divider between the days.
  - Intraday: last 3 h of raw trades as circles (area = volume, colour = side) then 12 side-specific VWAP forecasts with P10–P90 whiskers; divider at "now".
  - Balancing: settled balancing price (line) with system imbalance bars on a right-hand MW axis for the last 3 h, then the forecast median + band.
- Suggested actions per market: minimum of the predicted median (BUY) and maximum (SELL) in €/MWh with the 15-minute delivery window and the P10/P90 of that interval, plus the predicted spread.
- Generation row: solar (daylight bell), wind (front ramp), load (morning ramp / evening peak), each with peak value + time and a hairline-area rendering of the next 24 h.

## Responsive behavior

- ≥1101 px: two-column header, chart + actions grid, three generation cards.
- ≤1100 px: single column everywhere.
- ≤768 px: 18 px gutters; the main chart switches to a 520×380 drawing with sparser time labels so type stays readable; the scroll indicator is hidden by the site as before.

## Revision 2026-09-14b

- Title colouring: `Intelligent` and `Engine` in ink, `Electricity Market` muted; lead shortened to one sentence.
- Suggested-actions card gains a third, grey `UNCERTAINTY` row: mean P90 − P10 width in €/MWh and a sentence grading the interval (large / moderate / small → high / moderate / low market uncertainty, threshold 35 % / 18 % of the median level).

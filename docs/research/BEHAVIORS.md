# Papers and People Behaviors

## Existing Works interaction model

- Scroll-driven with GSAP/ScrollTrigger and six snap points.
- `#works` is 5400px at a 1440×900 viewport and contains six `data-top_works_item` nodes.
- The WebGL `WorksThumbnails` scene reads each node's texture path and animates position, Z depth, Y rotation, scale and alpha.
- Each active DOM caption is fixed near the lower-left and fades between items.
- Paper integration changes content and texture assets only; it does not reproduce or replace the engine.
- Current desktop title typography: acumin-pro, 40px/40px, weight 500.
- Current metadata: Google Sans Code, 12px, 2.4px tracking.
- Current category pills: 12px, 1px `#777` rule, 3.6px radius, 2.4px × 9.6px padding.

## Existing About interaction model

- The About/Mission presentation container is fixed at `inset: 0`, 900px high on desktop.
- Its parent trigger is 1440px on desktop and 844px at a 390×844 mobile viewport.
- The WebGL scene changes from the dark grid to the light `#d7dbdc` grid before About enters.
- Body state exposes the active section through `data-current_section="mission"`.

## Revised News behavior

- News is visible automatically on the initial hero in the original frameless lower-right presentation.
- The desktop header has no News navigation item.
- Announcements are plain text and cannot be clicked.
- Four announcements exist; the list viewport is sized to the first three and permits native vertical scrolling to the fourth.
- The News scrollbar is visually hidden without disabling wheel, trackpad, touch, or keyboard scrolling.
- News uses the same 11px/1.55 Roboto Mono stack and weight as the left academic collaborator text.
- The collaborator block owns its hit area and suppresses click propagation; it is static text and does not pass clicks through to the canvas.

## People behavior

- `body[data-current_section="mission"]` fades the People layer in and enables its links.
- The old Mission title and Japanese/English copy remain hidden.
- Desktop shows two continuously moving columns: Leaders, and Members.
- Runyao Yu and Ruiling Ding share the first column with the five remaining Chairs; Tara Esterl is removed.
- Cards use the retained repository names, roles, affiliations, bios and approved links.
- Mobile presents two role lanes sized for touch and allows horizontal swiping between them.
- The items are frameless typographic blocks over the parent page's exact hero WebGL renderer; the separate Mission renderer and mission-only filter are not used as the visible People background.
- The large centered DeepPrior wordmark is disabled only while People is active; it remains enabled on the first page.
- Wheel, touch, hover, or focus pauses a column; native manual scrolling remains available.
- Column and biography scrollbars are visually hidden, and the shared hero renderer continues receiving native pointer movement.
- On desktop, each column is capped at `min(33vw, 470px)`. The resulting empty center corridor is outside the nested-scroll windows and therefore scrolls the global page.
- The visible section heading is `People`; the first role-column heading is `Leaders`.

## Hero-to-People transition

- `mission_in` previously contributed a 900px desktop / 590.8px mobile light-grid interstitial before the people scene.
- Remove that dedicated spacer and its DOM marker so the legacy section manager cannot select the grey `mission_in` state at the People offset.
- The Works outro and People/mission trigger remain in their original order; no other section height is changed.

## Restricted hero pattern cycle

- Both the normal first page and People use only `pattern_rgb_clouds` and `pattern_violet_orange`.
- Both retained algorithms use the London Business School blue/red palette but remain visibly different because their noise thresholds and palette-mixing logic differ.
- Hero pattern changes use only the 3-second `pattern_transition_tile_flip`; non-hero parent scenes keep their existing instant update.

## Responsive sweep

- Desktop 1440×900: navigation visible; Works title 40px; two narrow People columns with a central global-scroll corridor.
- Tablet 768×900: hamburger navigation; Works title 21px; two narrow People columns.
- Mobile 390×844: hamburger navigation; Works height 5064px; Works title 21px; single role lane per viewport.

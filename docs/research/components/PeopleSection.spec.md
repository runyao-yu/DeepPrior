# PeopleSection Specification

## Overview

- **Targets:** `public/people-section.css`, `public/people-section.js`, and the shared `public/data/site-content.json`.
- **Current reference:** `docs/design-references/current-site/about-current-desktop.png`.
- **Source references:** `docs/design-references/deepprior-source/committee-repo-desktop.png` and `committee-repo-mobile.png`.
- **Source data:** `/tmp/deepprior-source.lYNWF9/lib/source-content.ts`, Committee object only.
- **Interaction model:** section-state fade plus continuously moving, manually interruptible role columns.

## Data contract

- Transfer the repository records, then remove Tara Esterl at the user's request: 19 people remain.
- Retain name, role, initials, universities, bio, and non-empty website/LinkedIn/GitHub/email links.
- Do not invent portraits: the repository references portrait paths that are not committed.
- Store data in the shared site content file; make no runtime request to GitHub or deepprior.com.

## Placement and DOM

- Inject one `.PeopleSection` into the existing `.MissionVision__container`.
- Hide `.MissionVision__inner` so the former About/Mission words are not displayed.
- Keep the parent `#about` anchor, `data-top_section="mission"`, height and order unchanged.
- Header contains only title `People` and `19 researchers`. Remove the repository description entirely. It has no `Committee` eyebrow and no header underline.
- Body contains two `.PeopleSection__group` columns: Leaders (Runyao Yu, Ruiling Ding, and the five remaining Chairs) and Members (12). `Leaders` replaces only the former `Leadership & Chairs` group label; it does not replace the section title.
- Each column has a duplicated inert track for seamless motion and remains manually scrollable.
- All column and biography scrollbars are visually hidden while wheel, trackpad, touch, keyboard, and programmatic scrolling remain enabled.
- Do not place `data-lenis-prevent` on the full-width groups wrapper. Keep nested-scroll prevention on each column window only, so the empty center corridor scrolls the global page.

## Visual adaptation

- Remove the static CSS grid/black wash, mission-only filter, and nested background iframe. The People background must reuse the parent page's exact first-page WebGL renderer, retaining its procedural patterns, tile transitions, fluid response, tiled logo texture, grid, and triangle rather than displaying the separate Mission scene.
- The parent renderer uses the same restricted hero pattern set for the first page and People: `pattern_rgb_clouds`, `pattern_violet_orange`, and `pattern_transition_tile_flip`.
- Suppress only the large centered `DeepPriorLogo2D` wordmark while the real `mission` / People section is active. The normal first page must continue to show its centered DeepPrior wordmark unchanged.
- The People layer itself stays transparent apart from typography. Do not replace the hero engine with a CSS-drawn imitation or a static capture.
- The title, metadata, and all profile text remain above the fixed parent WebGL canvas at z-index 2.
- Outer desktop padding: 50px; top padding clears the fixed site header.
- Font system: IBM Plex Mono for labels/metadata; acumin-pro for headings and names; current sans fallback.
- Title: clamp(42px, 5.2vw, 74px), weight 500, tight leading.
- Metadata: 10–11px uppercase, 0.1–0.14em tracking.
- Profile items have no border, outline, rectangular surface, box shadow, or backdrop panel. They are open typographic blocks over the live WebGL scene.
- Card height: 250–280px desktop; 20px padding; 16px internal gap.
- Name: 21px/1.08 desktop; bio 11–12px/1.55 in an internally scrollable region.
- Link chips: transparent, 1px white rule, 10px IBM Plex Mono; invert to white on hover/focus.
- While People is active, the fixed header, logo, navigation, contact control, hamburger and scroll indicator use the hero's white-on-black treatment.

## Motion and states

- Default outside Mission: opacity 0, visibility hidden, pointer-events none.
- `body[data-current_section="mission"]`: opacity 1, visibility visible, pointer-events auto.
- Entry: 650ms opacity/translate transition; group delays of 80ms.
- Columns auto-scroll continuously in opposite directions using `scrollTop`/animation frames, not a static CSS transform. Duplicated tracks make the loop seamless.
- Native wheel/touch scrolling pauses motion immediately; hover/focus also pauses. Resume gently after user interaction.
- The shared parent hero instance continues receiving its native pointer coordinates, so the camera, fluid field, and triangle remain interactive beneath People without synthetic event forwarding.
- `prefers-reduced-motion` disables automatic movement and retains native manual scrolling.

## Responsive behavior

- Desktop ≥769px: two equal but deliberately narrow columns with independent animated/manual vertical scroll windows. Each column is `min(33vw, 470px)`; the groups wrapper uses `justify-content: space-between`, leaving a large empty center corridor for global page scrolling.
- Mobile ≤768px: 18px padding, compact title, role groups in a horizontal snap row; each group is approximately calc(100vw - 44px) and has independent vertical scrolling.
- Mobile cards are 240–270px tall and all text remains readable without page-level horizontal overflow.

## Accessibility

- Section uses `aria-labelledby` and a real heading hierarchy.
- External links use `target="_blank" rel="noopener noreferrer"`; email links use `mailto:`.
- Link focus styles are visible against the live dark WebGL scene.

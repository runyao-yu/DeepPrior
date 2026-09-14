# Hero Pattern and Transition Specification

## Overview

- **Target:** `public/_astro/index.astro_astro_type_script_index_0_lang.Cu0uHvXK.js`.
- **References:** current local first page and People background at 1440×900 and 390×844.
- **Interaction model:** time-driven procedural shader cycle with a pointer-reactive WebGL scene.

## Active pattern set

- Keep `pattern_rgb_clouds` (`pattern1Frag`).
- Disable `pattern_mono_pixels` (`pattern2Frag`) from the cycle.
- Keep `pattern_violet_orange` (`pattern3Frag`). Keep this stable editing name even though its palette is recolored.
- Alternate between the two retained patterns so a cycle cannot randomly select the current pattern again.

## Palette

- Use the two colors from the current official London Business School logo assets:
  - blue `#001F62` / RGB `0, 31, 98`
  - red `#C8102E` / RGB `200, 16, 46`
- Recolor both retained shaders without replacing their distinct algorithms: RGB clouds remains smooth multi-channel thresholded noise; violet/orange remains a layered palette-mix field.
- Preserve readable brightness against the black grid while keeping the official hue relationship.

## Transition

- Keep only `pattern_transition_tile_flip` (`uPatternSelectType = 2`) while the current section is `kv`.
- Disable random selection of `pattern_transition_cut` and `pattern_transition_tile_wipe` on `kv`.
- Preserve the existing instant transition outside `kv` so Works and later parent-page choreography are not changed.
- Retain the existing 3-second tile-flip duration and automatic cadence.

## Shared background behavior

- The first page and People both reuse the same parent-page hero renderer, so this single shader change must affect both without a nested iframe.
- Preserve fluid pointer warp, camera parallax, triangle material/refraction, tiled wordmark texture, layout shuffle, UV glitch, blackout behavior, grid and bloom.
- Preserve the centered DeepPrior wordmark on the normal first page and suppress it only while People / `mission` is active.

## Removed grey mission interstitial

- The standalone `mission_in` DOM element is removed. Guard its legacy `TopScrollManager.registerSection` call so a null element cannot create a viewport-default trigger that leaves the main scene on the light renderer.
- In the WebGL controller, source `visibleMission` from the real `mission` trigger instead of the removed `mission_in` trigger. This keeps a valid progress source without reintroducing a spacer.
- While the real Mission / People section is active, force the legacy Mission blend weight to zero so its light renderer cannot cover the hero. Existing Vision and Service blending remains unchanged outside People.
- Map `mission` to the `kv` state for the main logo, camera and background-quad controller, while sending the real `mission` state to `DeepPriorLogo2D` so the centered wordmark alone is hidden.
- Forward every mapped section state to `BGQuadTree.changeSection`; this makes the 3-second tile-flip branch live on both the first page and People instead of leaving `_currentSection` unset.
- Neutralize Works-outro camera progress only while People is active so its camera framing matches the first page exactly; preserve normal Works-outro behavior elsewhere.
- The real Mission section becomes active as it enters the viewport, allowing the People overlay and shared hero renderer to replace the former grey interstitial immediately.
- The hidden legacy Mission text controller may retain its no-op `mission_in` lookup; do not restore a visible marker or spacer for it.

## Responsive behavior

- Desktop 1440×900, tablet 768px, and mobile 390×844 use the same two-pattern shader cycle and tile-flip selection.
- Do not introduce horizontal overflow, DOM overlays, static background captures, or CSS approximations.

## Verification

- Static bundle assertions find both retained shaders, no active push of `pattern2Frag`, alternating retained-pattern selection, and `uPatternSelectType = 2` for `kv`.
- Static assertions also confirm guarded/null-safe `mission_in` registration and that the renderer uses `getTrigger("mission")` for `visibleMission`.
- A live scroll from the first page into People must retain the dark two-pattern hero and triangle, hide the centered wordmark, and never reveal the light legacy Mission scene.
- Live screenshots visibly distinguish the two retained patterns despite their shared blue/red palette.
- The production build, lint, typecheck, syntax check, and desktop/mobile live QA pass.

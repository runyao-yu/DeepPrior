# Hero Animation Visual Guide

The screenshots below use stable labels for the existing homepage WebGL effects. They are documentation only; no effect has been removed or slowed down.

## Automatic background effects

![Automatic effect guide](../design-references/hero-animations/automatic-effects-guide.png)

1. `pattern_mono_pixels` — the black-and-white diagonal/block field.
2. `pattern_violet_orange` — the violet/ice-blue field; orange appears in some noise states.
3. `pattern_rgb_clouds` — the green/cyan/RGB cloud-like field.
4. `pattern_transition_tile_flip` — the longer tile-by-tile rotating transition. A still image shows one intermediate arrangement.
5. `tile_uv_glitch` + `tile_blackout_flicker` — displaced texture samples and tiles that briefly go dark.
6. `wordmark_mode_cycle` — the faint small/repeated DeepPrior fragments drawn inside background tiles. This is separate from the large centered DeepPrior wordmark.

Related effects that need motion rather than one still:

- `pattern_cycle` selects screenshots 1–3 automatically.
- `pattern_transition_cut` changes instantly between patterns.
- `pattern_transition_tile_wipe` changes tiles over about 0.3 seconds.
- `tile_layout_shuffle` changes the large/small tile subdivision approximately every four seconds.
- `noise_field_drift` continuously evolves the colors and masks inside screenshots 1–3.

## Pointer-driven effects

![Pointer effect guide](../design-references/hero-animations/pointer-effects-guide.png)

- A → B → C shows the pointer moving from center to upper-left to lower-right.
- `fluid_pointer_warp` is the bright liquid ripple that follows the pointer.
- `camera_pointer_parallax` is the subtle movement of the whole curved wall.
- `triangle_pointer_tilt` is the triangle's small inertial rotation.
- `triangle_live_refraction` is the changing color/reflection visible through the triangle.

## Finishing effects

- `hero_bloom` is the soft glow around the brightest grid and triangle highlights in every screenshot.
- `hero_entry_zoom` is the one-second camera/FOV change when entering or leaving the homepage. It cannot be represented reliably by a single still.

For later edits, refer to either the screenshot number/letter or the stable effect name.

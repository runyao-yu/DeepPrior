# Hero Animation Inventory

These names are the stable editing labels for the first-page WebGL scene. The code handles in parentheses are the identifiers used by the bundled renderer.

| Editing name | Code handle | Trigger / cadence | Visible result |
| --- | --- | --- | --- |
| `pattern_rgb_clouds` | `pattern1Frag` | Alternates with `pattern_violet_orange` | Smooth multi-channel noise-cloud field, recolored to LBS blue `#001F62` and red `#C8102E`. |
| `pattern_violet_orange` | `pattern3Frag` | Alternates with `pattern_rgb_clouds` | Layered palette-mix field, recolored to the same LBS blue/red pair while retaining its distinct topology. |
| `pattern_cycle` | `bgQuad_pattern` / `changePattern()` | Changes after the previous transition plus roughly 1–2 seconds | Alternates between the two retained procedural pattern families without repeats. |
| `pattern_transition_tile_flip` | `uPatternSelectType = 2` | Only hero transition mode; 3 seconds | A left-to-right tile wave with full rotations. |
| `tile_layout_shuffle` | `createQuadTreeGeometry()` geometry pool | Every 4 seconds while the hero (`kv`) is active | Replaces the subdivision arrangement of large and small wall tiles. |
| `tile_uv_glitch` | `bgQuad_uvShift`, `bgQuad_uvShift_power`, `bgQuad_uvShift_hash` | Pattern-dependent random interval, from about 0.1 to 5.1 seconds | Random tiles jump to displaced texture coordinates. |
| `tile_blackout_flicker` | `bgQuad_blackOut`, `bgQuad_blackOut_hash` | Every 1 second in `pattern_violet_orange`; disabled in `pattern_rgb_clouds` | Random tiles darken or switch off. |
| `wordmark_mode_cycle` | `uLogoDisplayType` | Re-randomized by the blackout loop | Changes the faint DeepPrior wordmark texture between row-wave, counter-scrolling-row, and per-tile falling modes. |
| `noise_field_drift` | `noiseFrag$1`, `uTime` | Continuous, slow (`uTime × 0.1`) | Evolves the procedural noise used by all three patterns and the scene surface effects. |
| `fluid_pointer_warp` | `StableFluids`, `uFluidsTex` | Pointer velocity on desktop; dissipates continuously | Warps the tiled scene and creates moving light/side-face energy around the pointer. |
| `camera_pointer_parallax` | `CameraController` | Mouse position, smoothed each frame | Shifts the camera by up to roughly 0.5 scene units, making the curved wall move in depth. |
| `triangle_pointer_tilt` | `MainLogo.hover()` | Pointer movement near the center of the hero | Applies a small inertial tilt to the triangle. |
| `triangle_live_refraction` | `mainLogoFrag` / transparent scene buffer | Continuous render | Refracts and reflects the changing background through the triangle material; roughness is fixed at `0.4` and material noise scale at `0`. |
| `hero_bloom` | `RenderPipeline` bloom passes | Continuous render | Adds soft glow to bright grid, pattern, logo, and triangle highlights. |
| `hero_entry_zoom` | `CameraController.kvZoom` | One-second section entry/exit transition | Slight camera-position and field-of-view zoom when entering or leaving the first page. |

## Fast-changing controls

The visually rapid changes are primarily `pattern_cycle`, `pattern_transition_tile_flip`, `tile_uv_glitch`, `tile_blackout_flicker`, `wordmark_mode_cycle`, and `tile_layout_shuffle`. The fluid, camera, and triangle motions are pointer-driven rather than autonomous cycling. `pattern_mono_pixels`, `pattern_transition_cut`, and `pattern_transition_tile_wipe` are retained only as historical code/assets and are no longer selected on the hero.

# DeepPrior Scroll Integration Topology

## Existing page flow

1. Hero / News — fixed header and WebGL key visual; the frameless News list is visible automatically and is not present in the desktop header navigation.
2. Works intro — transition into the six-item WebGL carousel.
3. Works — six scroll-snap items, six texture-driven 3D figures, 5400px at a 900px desktop viewport.
4. Works outro — existing carousel exit choreography.
5. About / Mission — one fixed 900px presentation layer over a 1440px desktop trigger. The separate `mission_in` spacer/marker is removed so no grey/light-grid interstitial can be selected before the people content.
6. Vision, Service, stellla, outro and footer — unchanged.

## Requested integration

### Works becomes the paper showcase

- Keep the current `#works` location, dimensions, scroll snapping and 3D carousel.
- Replace its six texture sources with six locally stored paper-cover placeholders.
- Replace the six entertainment-project labels with neutral `Paper 01`–`Paper 06` metadata.
- Preserve the existing WebGL geometry, distortion, perspective, side previews and scroll timing.
- Future portrait PNG covers will be normalized to the carousel's 800×450 texture frame without changing page code.

### About becomes People

- Keep the existing `#about` anchor and Mission trigger so downstream choreography does not move.
- Hide the original Mission typography and present a transparent People layer over the same fixed hero WebGL renderer used by the first page; suppress the legacy light Mission blend while People is active.
- Retain 19 people after removing Tara Esterl: 2 founders, 5 chairs and 12 members.
- Merge founders and chairs into one auto-moving/manual-scroll column; use Members as the second column moving in the opposite direction. Mobile keeps two horizontally swipeable role lanes with vertical movement/scrolling inside each lane.
- Preserve the 1440px desktop and one-viewport mobile trigger heights.
- Display `People` as the section heading, label the first role column `Leaders`, and retain `/#about` as the stable local target.

## Navigation

- Keep `Works` in navigation for now.
- Rename visible `About` labels to `People`, retaining `/#about` as the stable local target.
- Remove the rejected Research modal, its navigation links and `/#research` behavior.

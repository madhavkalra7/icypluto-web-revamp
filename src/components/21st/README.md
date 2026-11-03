# Components adapted from 21st.dev

The website uses native HTML, Sass, and GSAP. These MIT-licensed React/Tailwind components were adapted to that stack; React is not required for the page.

## Interactive Hover Button — Magic UI

- 21st.dev: https://21st.dev/@dillionverma/components/interactive-hover-button
- Upstream: https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/interactive-hover-button.tsx
- Adaptation: the expanding dot, outgoing label, incoming label, and arrow transition are in `src/clean.scss`, under `.interactive-hover-button`.
- License: `licenses/MagicUI-MIT.txt`.

## Accordion — Origin UI

- 21st.dev: https://21st.dev/@originui/components/accordion
- Upstream: https://github.com/origin-space/originui/blob/main/apps/origin/public/r/accordion.json
- Adaptation: minimal divided rows, rotating chevrons, clipped content, and disclosure states are implemented with native `details`/`summary`. Keyboard navigation and single-open behavior are in `adaptations.js`; styling is in `src/clean.scss`.
- License: `licenses/OriginUI-MIT.txt`.

The published upstream source is retained under `upstream/` for review. Page copy, layout, and integration are specific to IcyPluto.

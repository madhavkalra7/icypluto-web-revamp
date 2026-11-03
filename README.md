# IcyPluto landing page

Standalone website in E:/IcyPluto new page revamp. The tool codebase is used only as a product-content reference.

## Run

```powershell
npm.cmd install
npm.cmd run dev
```

```powershell
npm.cmd run build
npm.cmd run preview
```

## Current design

Charcoal backgrounds, silver typography, quiet white stars, and limited purple accents in the original logo, selected controls, and button hover states. One self-hosted Manrope font family.

The Pluto hero and horizontal desktop product showcase are the main motion sequences. Short screens, mobile, and reduced motion use normal product flow. Other animation is limited to short reveals and subtle astronaut movement.

Page flow: hero; product explanation and interactive AI-answer example; product showcase; compact toolkit selector; three CST cards; onboarding steps; community resources; FAQs; demo CTA.

Removed: scrolling slogan, funnel-to-orbit chapter, repeated Pluto story, floating toolkit diagram, ornamental badges and satellites, community ticket artwork, custom cursor, and pinned onboarding. These remain recoverable under archive/pre-cleanup.

## 21st.dev components

MIT-licensed components were adapted to native HTML and Sass:

- Magic UI Interactive Hover Button: https://21st.dev/@dillionverma/components/interactive-hover-button
- Origin UI Accordion: https://21st.dev/@originui/components/accordion

Sources, adaptation notes, and complete licenses are in src/components/21st. The accordion uses native details/summary, single-open behavior, rotating chevrons, and keyboard navigation. No React runtime is required.

## Files

- index.html: content, semantic controls, and native dialogs.
- src/clean.scss: base site styles; src/pluto-hero.scss: isolated hero styles.
- src/main.js: GSAP, navigation, and dialogs.
- src/pluto-hero.js and src/pluto-hero-state.js: WebGL scene, staged transitions, and capability interactions.
- src/product-story.js: answer tabs, toolkit selector, and onboarding steps.
- src/starfield.js: subdued white starfield.
- src/components/21st: component adaptations, upstream source, and MIT licenses.
- public/assets: original logo, fonts, NASA photo, and optimized astronaut.
- archive: recoverable previous designs and generated asset originals.
- dist: production static output.

## Content and contact

Product metrics and AI answers are illustrative and labeled. Podcast, summit, and academy details use announcement placeholders. Contact prepares an email to info@icypluto.com, as published at https://new.icypluto.com/contactus. It does not submit to a backend or send automatically.

The real logo is copied unchanged from toss_new_ui/public/Icypluto_logo.png. The generated astronaut is displayed in grayscale. NASA Pluto image: https://science.nasa.gov/resource/pluto-in-true-color/. Font license: public/assets/Manrope-OFL.txt.

## Verification

Production build and JavaScript checks pass. DOM checks used the real GSAP/ScrollTrigger libraries and exercised product controls, single-open accordion and keyboard navigation, dynamic demo email preparation, community dialogs, mobile navigation, motion toggle, anchors, and neutral background/panel colors from production CSS.

Headless Chromium verification exercises the real WebGL hero at 1440x900 and 390x844, capability previews and selection, the landing transition, demo-form prefill, normal page scrolling after landing, and reduced motion. Review screenshots are in archive/hero-verification. The browser reports no JavaScript or shader errors.


## Three-stage Pluto hero

1. ICY appears centered, then PLUTO reveals from left to right to form ICYPLUTO. The full-color globe grows afterward and completes unrestricted 360-degree rotations, including during manual dragging.
2. AEO, GEO, and SEO markers rotate the globe and update the capability preview.
3. Selecting a capability dives through a frost transition into layered ice terrain, with a focused demo form.

Use the side rail, next/back controls, keyboard, or wheel while the hero fills the viewport. Scrolling continues normally after the last stage; a skip link is always available. Reduced motion switches stages immediately and disables idle drift. Devices without WebGL use a full-color NASA photo; context loss also activates this fallback.

Globe texture: NASA/JPL New Horizons Pluto Color Map, https://www.jpl.nasa.gov/images/pia11707-pluto-color-map/. The unphotographed southern region is artistically completed with reflected nearby terrain, and the longitude edges are blended together; this is not a scientific globe. The landing landscape and transparent ice foreground are generated artist impressions, labeled in the hero. Original generated assets are preserved in archive/generated-assets/pluto-hero.

The three globe markers are AI Visibility (AEO), AI Discovery (GEO), and Search Health (SEO). They follow surface coordinates, hide on the back hemisphere, and open their capability preview. Guided capability turns release back to idle rotation; dragging cancels the guided turn. Reduced motion retains all controls and disables idle rotation and the opening sequence. The original logo purple (#5d17eb) appears sparingly in marker halos, ambient light, hover borders, and a low-strength terrain color transform.

Scrolling down while the hero is active automatically opens Explore AI visibility, including wheel input over the header, small trackpad deltas, mobile swipes, and Page Down/Arrow Down/Space. Each wheel gesture advances one stage. Scroll continues into the page after landing. Explicit anchor links bypass this behavior. Browser checks are recorded in archive/verify-hero-scroll.mjs.

## Liquid pill navigation

The header uses Platform, Services, Resources, Pricing, and Contact. Platform, Services, and Resources open accessible dropdowns; Pricing and Contact open the contact dialog with the corresponding intent. The same five labels stay visible in a compact pill on mobile. Arrow keys move between top-level controls; Arrow Down enters a dropdown; Escape and outside clicks close it. Dialogs return focus to a visible navigation trigger.

The water shader is adapted from the user-supplied Nimbus UI ?Waterline? reference by guglielmogiannattasio.it; the complete supplied source is preserved in src/components/liquid-navbar/user-reference.tsx. src/navbar.js and src/navbar.scss provide the native implementation, animated liquid selection, CSS fallback, reduced-motion behavior, and offscreen pause. No React dependency was added.

Removed the small hero introduction, supporting sentence, bottom skip prompt, drag hint, and eyebrow tagline. Product explanations remain in the overview section.

## Capability preview cards

The original dark photo-card style is retained. The image height, padding, and gaps are reduced, with natural-height descriptions to keep the cards short. The vertical AEO/GEO/SEO selector and original explore actions are restored on desktop and mobile.

## Logo-purple hero and regenerated terrain

The centered ICYPLUTO composition and original globe size/position are restored. The hero base uses the logo purple (#5d17eb), darker edge shading, and local stars. The amethyst mountain background and transparent foreground are restored, preserving their 1672x941 composition and existing ridge occlusion, text-behind-mountains layering, and parallax transforms. Original generated files are in archive/generated-assets/purple-terrain. The reference-inspired PLUT/orbit layout has been reverted.

## Hero-only particles

The moving particle canvas is attached to .pluto-hero, absolutely positioned behind the globe and typography, and clipped to the section. Soft white glows, occasional star flares, slow drift, and twinkling replace the former page-wide starfield, static hero dots, and floating dust. Other page sections have no particle overlay. Rendering pauses when the hero is offscreen or the document is hidden; reduced motion displays a static field. Browser checks: archive/verify-hero-particles.mjs.

The hero now uses a near-black space background (#030407) with a very faint neutral atmospheric glow. White moving particles, the purple terrain assets, and all existing hero effects are retained.

The latest background follows the dark galaxy reference: near-black space, dense tiny warm-white/lavender stars, and a low-contrast purple nebula across the lower half. Nebula noise and fine star clusters are rendered into a cached canvas once per resize; only subtle drift, parallax, and a small number of glowing stars animate. The effect remains confined to the hero, respects reduced motion, and pauses offscreen.

All three landing capabilities share a charcoal-and-muted-violet terrain grade: saturation 24%, brightness 72%, and mild contrast. The same filter is applied to the landscape, ridgeline overlay, and transparent foreground so the depth layers stay visually aligned while preserving snow and rock detail.

Capability selector titles now scale up to 80px on desktop with 14px secondary labels, with larger responsive mobile sizes. The original hover cards are shorter: their planet image is a small thumbnail rather than a full-width banner, and padding is tightened. Card placement follows the expanded selector width.

## Pluto clarity and rendering performance

Changes are being made on the madhav branch. The original NASA/JPL PIA11707 map is 5926x2963 (https://www.jpl.nasa.gov/images/pia11707-pluto-color-map/). The globe now prepares a 4096x2048 texture in a module worker on desktop, a 3072-wide texture on mobile where supported, and a 2048-wide main-thread compatibility fallback, constrained by the device texture-size limit. Texture preparation preserves the existing artistic southern completion and seam blending, uses one pixel buffer, and transfers an ImageBitmap without blocking the UI. The source JPG is kept unchanged at public/assets/pluto-color-map-hd.jpg. Lower-detail photographed regions still reflect the limits of the source mosaic; the map cannot supply missing high-resolution observations.

The hero's 30 FPS limiter is removed. Rendering follows requestAnimationFrame, with adaptive pixel ratio under sustained frame pressure. Layout measurements and element references are cached, the current navigation label is updated only when it changes, and product-scroll state updates only when its active scene changes. The looping text shimmer animates composited opacity instead of repainting a full-width gradient. Hidden globe draws and background particle rendering stop when the landing terrain covers them; continuous full-screen terrain rescaling is removed while pointer parallax remains.

Verification: archive/verify-globe-clarity.mjs checks 4K worker upload, 2K compatibility fallback, controls, landing, no hidden draws or repeated button DOM rebuilding, and reverse transitions. Screenshots are under archive/hero-verification. The local Chromium environment uses SwiftShader software graphics: its frame-rate samples do not establish hardware FPS. Actual display smoothness depends on the user's GPU, refresh rate, and browser.

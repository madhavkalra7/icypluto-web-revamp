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


## Earlier capability study (replaced by the continuous world below)

The accepted globe and mountain heroes are retained. The generic overview/AI dashboard carousel below them is replaced with a capability-specific scroll narrative in `src/discovery.js` and `src/discovery.scss`. Hero selection and the SEO/AEO/GEO pills synchronize in both directions. Each journey includes its own introduction, three explanatory chapters, an evolving sticky HTML/SVG instrument, and useful takeaways:

- SEO: SEOMax website scan, content/structure/technical findings, recommended fixes.
- AEO: question selection, brand/competitor context inside an example answer, content priorities.
- GEO: a cited-source network, competing brand comparison, GEO Bot content opportunities.

The toolkit highlight, CST explanations, onboarding steps, and closing message follow the selected capability. A continuous-orbit interlude explains the research / understand / improve / measure cycle. The new CST composition combines a generated geological cutout with independently animated letters and orbital paths. The Getty Persepolis reference (https://persepolis.getty.edu/) informed the scene pacing and layered presentation; its imagery and copy are not reused.

Scroll animation uses the existing GSAP/ScrollTrigger dependency. Transforms are driven by scroll rather than extra perpetual render loops. Native sticky positioning keeps the layout in document flow. Mobile uses an instrument above the chapters; reduced motion preserves the complete readable narrative and disables parallax. All instrument examples are explicitly illustrative, with fictional brands and no live API requests.

Verification: `archive/verify-discovery.mjs` covers 1440px desktop and 390px mobile, both selectors, all three journeys, forward/reverse chapter state, relevant tool and onboarding content, demo dialogs, cutout loading, overflow, console errors, and motion preferences. Review screenshots are `archive/discovery-*.png`. `npm run build` and `git diff --check` pass.

### New generated assets and prompts

Generated using the built-in image generation tool with transparent backgrounds. Final project assets preserve alpha and are encoded as WebP: `public/assets/discovery-probe.webp` (about 299 KB) and `public/assets/discovery-shard.webp` (about 233 KB). The existing logo is unchanged.

Probe prompt:

> Use case: stylized-concept. Asset type: transparent cutout for a premium IcyPluto space marketing website, to animate in parallax with real HTML interfaces. Primary request: a photorealistic sculptural deep-space probe / radio telescope, with one large elegant concave parabolic dish angled three-quarter toward camera at upper right, slender black titanium instrument body and extended narrow solar-panel wings. Isolated entire object floating in space, fully within frame, no crop, actual transparent background. The dish has brushed silver ribs and a dark center, subtle muted violet edge light, white rim highlights, restrained scientific industrial aesthetic, high detailed materials, photographic cinematic lighting. Composition: square canvas, object centered with ample transparent margin, diagonal from lower left to upper right. No planet, no stars, no scenery, no labels, no letters, no watermark, no floor or shadow beneath. This must feel like an expensive editorial space mission photograph, not a toy or a UI icon.

Ice-shard prompt:

> Use case: stylized-concept. Asset type: transparent editorial cutout for a premium dark space website. A single dramatic floating fragment of charcoal Pluto ice rock, an angular irregular naturally eroded vertical monolith, black graphite rock with crisp silvery icy crystalline edges and just a whisper of violet light inside thin fissures. 3D photoreal detailed macro material, cinematic soft rim lighting, elegant high contrast, no bright neon, no scene, no floor. Whole object fully visible with transparent margin on every side, portrait object centered on square canvas, actual transparent background. No text, no symbols, no logo, no watermark, no planet, no stars. Not a gemstone, not a tower, a geological shard of frozen planetary crust. It will be composited with HTML orbital technical diagrams.


## Current design: one continuous Pluto world

The repeated probe/shard layouts have been removed from the rendered page. `src/continuous-world.js` creates one persistent Three.js renderer, camera, lighting rig, particle field, and scene that spans all content beneath the accepted globe/terrain hero. Every lower section has a transparent background over `public/assets/pluto-continuous-world.webp`; there are no separate section background plates. The landed hero fades into the same near-black atmosphere. Manrope and the existing logo are retained.

SEO is a stack of ice page structures with a working content/structure/technical scan control. AEO uses a segmented ice signal ring and answer context. GEO uses an actual 3D source constellation. The toolkit, CST layers, onboarding gates, community network, and final logo sculpture occupy the same environment with shared frosted-ice shaders and restrained violet reflections. The hero selection sets the first capability in the journey and synchronizes the overview selector, tool highlight, and onboarding context. All three capabilities remain available in the same continuous story.

The fixed landscape remains stable as objects change with scroll. Desktop scene objects hold their composition beside the text. Mobile objects track reserved positions inside each chapter to avoid obscuring content. A ResizeObserver updates scene anchors after font or content layout changes. Rendering pauses under the initial hero, stops idle draws in reduced motion, pauses in hidden tabs, caps device pixel ratio, and lowers resolution after sustained frame pressure. WebGL-disabled browsers retain the landscape and complete readable content. This does not establish hardware FPS; the local QA browser uses software graphics.

Reference study: https://www.igloo.inc/ was inspected in local Chromium at a smaller render size to allow its full WebGL scenes to load. Reference screenshots are under `archive/igloo-small-*.png`. The shared material, environment, and object-based scroll progression informed the new architecture; the reference's assets and code are not reused.

Current verification: `archive/verify-continuous-world.mjs` passes at 1440px and 390px, checking one shared canvas, no repeated foreground cutouts, hero/overview synchronization and chapter order, all scene transitions forward and backward, transparent shared section backgrounds, audit controls, contact dialogs, reduced motion, hidden rendering, no horizontal overflow, no browser errors, and the WebGL-disabled fallback. Desktop/mobile visual checks are `archive/continuous-*.png` and `archive/world-verified-*.png`. The older discovery verification scripts/screenshots describe the superseded study.

### Continuous landscape asset

Built-in image generation tool; final image: `public/assets/pluto-continuous-world.webp` (about 100 KB). The foreground sculptures are code-native 3D geometry with a custom procedural ice shader, not repeated raster cutouts.

Final generation prompt:

> Use case: stylized-concept. Asset type: ultrawide 16:9 cinematic continuous environment plate for IcyPluto, a premium space / ice WebGL website. A photorealistic panorama looking across a remote dark frozen Pluto basin at night. Composition is essential: the TOP 65 PERCENT of the image is almost black clean empty space with only very sparse tiny distant white stars, no planets, no nebula cloud. Along the BOTTOM 35 PERCENT is a breathtaking low charcoal ice plain with very detailed jagged black-glass ice formations and grey frost, a low distant mountain horizon at 70 percent down. The center of the bottom landscape is an open dark flat basin suitable for placing 3D objects; the left and right edges have low sculptural ice ridges. Restrained silver icy highlights and a barely perceptible hint of dusty violet light deep in rock crevices. Black and neutral graphite dominate; not a purple landscape, no blue glow. Delicate wisps of low ground fog catch soft sidelight, realistic rough ice texture. Extremely premium cinematic atmosphere, like a film still from an interplanetary expedition, crisp tangible terrain. No people, no astronaut, no spacecraft, no buildings, no logo, no text, no UI. Dark enough for white HTML text above it, generous negative space, sophisticated controlled contrast, no bright white snow field.


## Capability background images

SEO, AEO, and GEO now use separate generated backgrounds: `public/assets/pluto-world-seo.webp` (180 KB), `public/assets/pluto-world-aeo.webp` (79 KB), and `public/assets/pluto-world-geo.webp` (111 KB). The original continuous plate remains for overview and shared sections. Four persistent layers blend according to the same scroll progress as the 3D scenes, including backward scrolling and reordered capability chapters. Reduced motion switches backgrounds without animated blending.

All three images were generated using the built-in image generation tool. Final prompt set uses this shared brief followed by the relevant scene brief:

> Use case: stylized-concept. Asset type: ultrawide 16:9 photorealistic background plate for IcyPluto's premium dark space website. Almost black graphite palette, subtle silver frost and only a very restrained dusty violet touch. Top 65 percent mostly empty very dark starry sky, sparse tiny stars, no text, no people, no spacecraft, no UI or logos. The environment must remain dark enough for white HTML text and separate 3D objects rendered over it. Highly detailed realistic surfaces, cinematic photographic lighting.

SEO:

> A striking angular canyon on Pluto: deep charcoal basalt cliffs and sharply fractured ice shelves along the far left and right edges, a stepped rocky plain receding into a narrow distant ravine at the bottom center. Terrain concentrated in bottom third, side cliffs no higher than middle of frame. Raking silver side light reveals sharp geological layers. No circular crater. Tangible roughness, black frozen geology.

AEO:

> A radically open frozen impact basin on Pluto, with a vast polished graphite ice lake and a shallow huge circular crater rim across the bottom quarter, a faint thin silver halo along the distant rim. Very low smooth horizon, tranquil spacious composition, delicate ground mist and fine radial cracks in the foreground. No cliffs at the sides and no jagged canyon. Most of the frame is empty deep black space. Quiet monumental emptiness.

GEO:

> View from a low frozen ridge in near orbit, looking across the enormous curved horizon of Pluto. A sweeping crescent of charcoal planetary crust arcs across the lower third, with fine silvery glacial striations and distant mountains hugging the curvature; foreground a dark rocky ledge only at bottom left. A very faint muted violet atmospheric rim and deep black stars beyond, visually unmistakably a curved planetary horizon rather than a flat basin or canyon. Keep upper two thirds empty dark space, no large planet overhead.

Verification: `archive/verify-capability-backgrounds.mjs` passes at 1440px and 390px: image decoding, distinct active images, forward/reverse scrolling, intermediate crossfade, restoration of the shared background, and no overflow or page errors. Screenshots: `archive/background-*.png`. Production build and diff checks pass.


## Clear typography and refined motion

Section eyebrow labels are removed, including SEO/AEO/GEO above the content titles and the small line above the mountain hero heading. The page keeps short, direct points, larger supporting type, fewer FAQs, and no sample-answer/source-caption clutter. The narrow 320px layout is fixed without reducing headline sizes on other screens.

Headings now reveal by line with reversible scroll masks. Supporting points follow with a short stagger. The 3D scroll position eases toward the actual page position. SEO pages fan out while a scan line sweeps; selecting an audit category moves the scanner to its corresponding level. AEO ring segments assemble on arrival. GEO sources orbit as a connected network, and the CST layers separate through their chapter. Reduced motion restores fully visible headings and removes idle/scroll-driven rotations.

Verification: `archive/verify-clear-type.mjs` passes at 320, 390, 820, and 1440px, including layout, tool tabs, onboarding, FAQs, contact and resource dialogs. `archive/verify-refined-motion.mjs` passes for removed eyebrows, forward/reverse line reveals, reduced-motion reset, and no browser/shader errors. Production build and `git diff --check` pass. Render timing in the local software graphics browser is not a hardware FPS measurement.

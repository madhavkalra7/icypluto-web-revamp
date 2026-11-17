# Dedicated daylight artwork

Created with the built-in image generation tool. Each night asset was supplied as a composition reference or edit target. The original files remain unchanged. Generated PNGs were converted to WebP for the website; foreground alpha is preserved.

| Website asset | Purpose |
| --- | --- |
| `public/assets/pluto-day-landing.webp` | Daylight landing scene and matching occluding ridge |
| `public/assets/pluto-day-foreground.webp` | Transparent foreground mountain cutout |
| `public/assets/pluto-day-aeo.webp` | AEO frozen basin |
| `public/assets/pluto-day-seo.webp` | SEO stratified ice canyon |
| `public/assets/pluto-day-geo.webp` | GEO curved planetary horizon |
| `public/assets/pluto-day-shared.webp` | Shared glacial plain for the remaining chapters |

## Prompt set

Landing: Edit the attached Pluto landscape into its premium daylight sibling. Preserve exact framing, 1672:941 composition, mountain silhouettes, skyline around y=440, geometry, and foreground layout. Relight as natural arctic daylight: ivory nitrogen ice, pale mineral-blue crevices, subtle lavender shadows, warm distant sunlight on ridges, pale icy-blue sky fading toward white. Physically lit positive exposure. No inversion, charcoal scratches, night stars, saturated purple, text, UI, or extra objects. Keep the ridge registered for depth compositing.

Foreground: Edit the attached transparent foreground mountains. Preserve silhouettes, placement, landscape dimensions, transparent center and sky. Relight as ivory sunlit nitrogen ice, pale-blue fissures, restrained lavender occlusion shadows, fine tactile detail, gentle upper-left sunlight. No inversion, saturated purple, black line art, text, or UI. Preserve the alpha silhouette.

Shared direction for the four scrolling backgrounds: Use the attached night image as composition reference for a dedicated 16:9 daylight companion. A premium arctic Pluto world, natural ivory nitrogen ice, pale mineral blue, subtle lavender shadows, warm distant sunlight, soft atmospheric perspective, photoreal matte painting. Positive natural light, no negative-image treatment. Generous near-white negative space behind dark typography. No stars, text, logos, UI, people, structures, or planets in the sky.

SEO composition: Stratified canyon walls at lower left and right, converging toward a distant centered valley. Empty pale-blue sky across the upper 65 percent; terrain in the lower third.

AEO composition: Vast smooth frozen nitrogen basin, polygonal ice seams and pearlescent glints. Flat low horizon at y=.73, airy near-white ice-blue sky above.

GEO composition: A curved icy dwarf-planet limb sweeping diagonally across the lower frame, luminous atmospheric horizon, naturally sunlit ivory rock and pale-blue glacial troughs. Upper 65 percent clean ice-blue negative space.

Shared composition: Low crystalline mountains at y=.73, serene glacial plain, silver-blue formations in the bottom corners, upper 70 percent clean pale-blue sky.

## Implementation

Light presentation: `src/theme-light.scss`.
Native day/night shader materials and lighting: `src/continuous-world.js`.
Real Pluto surface lighting: `src/pluto-hero.js`.
Asset preloading and theme coordination: `src/theme.js`.
The light images are never inverted or recolored by CSS. Both themes share navigation and animation state, while selecting their own artwork, material palette, and component surfaces.

export const CAPABILITIES = [
  { name: 'AEO', title: 'Answer Engine Optimization', description: 'Understand how your brand appears in direct AI answers.', destination: 'THE ANSWER.', u: .54, v: .43 },
  { name: 'GEO', title: 'Generative Engine Optimization', description: 'Explore the sources and brand signals shaping AI discovery.', destination: 'THE CONVERSATION.', u: .67, v: .48 },
  { name: 'SEO', title: 'Search Engine Optimization', description: 'Strengthen the content and technical foundations of discovery.', destination: 'THE SEARCH.', u: .41, v: .39 },
];
export const clamp = value => Math.max(0, Math.min(1, value));
export const segment = (value, start, end) => clamp((value - start) / (end - start));
export const mix = (a, b, t) => a + (b - a) * t;
export const cubicInOut = value => value < .5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;
export const cubicOut = value => 1 - (1 - value) ** 3;
export function mapPoint(u, v) { const p = Math.PI * 2 * u, t = Math.PI * v; return { x: -Math.cos(p) * Math.sin(t), y: Math.cos(t), z: Math.sin(p) * Math.sin(t) }; }
export function facing(point) { return { yaw: Math.atan2(-point.x, point.z), pitch: Math.asin(point.y) }; }
export function rotatePoint(point, yaw, pitch) {
  const x = point.x * Math.cos(yaw) + point.z * Math.sin(yaw), z = -point.x * Math.sin(yaw) + point.z * Math.cos(yaw);
  return { x, y: point.y * Math.cos(pitch) - z * Math.sin(pitch), z: point.y * Math.sin(pitch) + z * Math.cos(pitch) };
}
export function heroFrame({ state, width: w, height: h, age, motion = true }) {
  const a = clamp(state), b = clamp(state - 1), portrait = h > w * 1.05;
  const grow = motion ? cubicOut(segment(age, 1.6, 3.1)) : 1;
  const intro = motion ? cubicOut(segment(age, .05, .65)) : 1;
  const baseRadius = portrait ? w * .385 : Math.min(h * .34, w * .215);
  const zoom = cubicInOut(segment(b, 0, .62));
  const x = portrait ? w * .5 : mix(w * .5, w * .34, a);
  const y = portrait ? mix(h * .43, h * .34, a) : mix(h * .55, h * .52, a);
  return { a, b, portrait, grow, intro, baseRadius, zoom,
    radius: baseRadius * mix(.03, 1, grow) * (1 + a * .04) * Math.exp(zoom * 2.5),
    cx: mix(x, w * .5, zoom), cy: mix(y, h * .5, zoom),
    wordOpacity: 1 - segment(a, .1, .5),
    panelOpacity: segment(a, .55, 1) * (1 - segment(b, 0, .14)),
    wordOneOpacity: segment(a, .45, 1) * (1 - segment(b, .02, .16)),
    fogOpacity: segment(b, .36, .54) * (1 - segment(b, .62, .96)),
    landProgress: cubicOut(segment(b, .5, 1)), foregroundProgress: cubicOut(segment(b, .58, 1)),
    destinationProgress: cubicOut(segment(b, .66, .98)), bookingProgress: segment(b, .86, 1),
  };
}

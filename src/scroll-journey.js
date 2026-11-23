import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Scroll-scrubbed image sequence: a sticky canvas whose playhead is bound to scroll progress,
// with glass step cards over it. Frames are rendered from NASA's public-domain astronaut model
// by tools/astronaut-render (see that folder to re-render).
const FRAME_COUNT = 190;
const frameUrl = i => `/assets/astronaut-frames/frame_${String(i + 1).padStart(4, '0')}.webp`;
const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };

export function initScrollJourney(getMotion) {
  const section = document.querySelector('#scroll-journey');
  if (!section) return () => {};
  const canvas = section.querySelector('canvas'), ctx = canvas.getContext('2d', { alpha: false });
  const steps = [...section.querySelectorAll('.sj-step')], intro = section.querySelector('.sj-intro'), bar = section.querySelector('.sj-bar i');
  const images = new Array(FRAME_COUNT);
  let loading = false, visible = false, target = 0, head = 0, drawn = -1, disposed = false, size = [0, 0];

  // Load the first frame immediately, then the rest in order of distance from the current playhead.
  function load() {
    if (loading) return; loading = true;
    const order = [...Array(FRAME_COUNT).keys()].sort((a, b) => Math.abs(a - head * (FRAME_COUNT - 1)) - Math.abs(b - head * (FRAME_COUNT - 1)));
    let next = 0;
    const pump = () => {
      if (disposed || next >= order.length) return;
      const index = order[next++], img = new Image();
      img.decoding = 'async'; img.src = frameUrl(index);
      img.onload = img.onerror = () => { images[index] = img; if (index === nearestFrame()) drawn = -1; pump(); };
    };
    for (let i = 0; i < 6; i++) pump();
  }
  const nearestFrame = () => Math.round(head * (FRAME_COUNT - 1));
  function fit() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5), w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr);
    if (size[0] !== w || size[1] !== h) { size = [w, h]; canvas.width = w; canvas.height = h; drawn = -1; }
  }
  // Find the closest frame that has loaded, so scrolling ahead of the download never shows a blank.
  function loadedFrame(index) {
    for (let d = 0; d < FRAME_COUNT; d++) {
      const a = images[index - d], b = images[index + d];
      if (a?.naturalWidth) return a; if (b?.naturalWidth) return b;
    }
    return null;
  }
  function draw() {
    const index = nearestFrame();
    if (index === drawn) return;
    const img = loadedFrame(index); if (!img) return;
    drawn = images[index]?.naturalWidth ? index : -1;
    const [w, h] = size, r = Math.max(w / img.naturalWidth, h / img.naturalHeight), dw = img.naturalWidth * r, dh = img.naturalHeight * r;
    // When the frame is cropped horizontally (portrait screens), follow the astronaut:
    // it starts right of centre and settles in the middle for the visor close-up.
    const focus = .67 - .17 * ease((head - .1) / .45);
    const x = dw > w ? Math.min(0, Math.max(w - dw, w / 2 - dw * focus)) : (w - dw) / 2;
    ctx.fillStyle = '#020204'; ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, x, (h - dh) / 2, dw, dh);
  }
  function layout() {
    const p = head, out = ease((p - .06) / .1);
    intro.style.opacity = String(1 - out);
    intro.style.transform = `translate3d(0,${(-out * 30).toFixed(1)}px,0)`;
    steps.forEach((el, i) => {
      const start = .38 + i * .19, on = ease((p - start) / .1), off = i < steps.length - 1 ? ease((p - (start + .2)) / .1) : 0;
      el.style.setProperty('--on', (on * (1 - off * .35)).toFixed(3));
      el.style.transform = `translate3d(0,${((1 - on) * 50).toFixed(1)}px,0)`;
      el.classList.toggle('active', p >= start && (i === steps.length - 1 || p < start + .19));
    });
    bar.style.transform = `scaleX(${p.toFixed(4)})`;
  }
  const tick = () => {
    if (disposed || !visible) return;
    const next = getMotion() ? head + (target - head) * .14 : target;
    head = Math.abs(next - target) < .0004 ? target : next;
    draw(); layout();
  };
  const trigger = ScrollTrigger.create({ trigger: section, start: 'top top', end: 'bottom bottom', onUpdate: self => { target = self.progress; }, onRefresh: self => { target = self.progress; } });
  const io = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) { fit(); load(); } }, { rootMargin: '10% 0px' });
  io.observe(section);
  const preload = new IntersectionObserver(e => { if (e[0].isIntersecting) { load(); preload.disconnect(); } }, { rootMargin: '250% 0px' });
  preload.observe(section);
  const onResize = () => fit();
  addEventListener('resize', onResize);
  gsap.ticker.add(tick);
  fit();
  return () => { disposed = true; gsap.ticker.remove(tick); trigger.kill(); io.disconnect(); preload.disconnect(); removeEventListener('resize', onResize); };
}

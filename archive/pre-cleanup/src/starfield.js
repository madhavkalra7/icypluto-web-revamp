export function startStarfield(getMotion) {
  const canvas = document.createElement('canvas'); canvas.id = 'starfield'; canvas.setAttribute('aria-hidden', 'true'); document.body.prepend(canvas);
  const ctx = canvas.getContext('2d', { alpha: true }); if (!ctx) return () => canvas.remove();
  let width, height, stars = [], frame, last = 0, dirty = true, pointerX = 0, pointerY = 0;
  const resize = () => {
    width = innerWidth; height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5); canvas.width = width * dpr; canvas.height = height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    let seed = 134340; const random = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };
    stars = Array.from({ length: Math.min(1000, Math.max(250, Math.floor(width * height / 1900))) }, () => ({ x: random() * width, y: random() * height, r: .45 + random() ** 3 * 1.7, alpha: .3 + random() * .65, phase: random() * 6.28, depth: .2 + random() * .8, violet: random() > .82 })); dirty = true;
  };
  const render = (time = 0) => {
    frame = requestAnimationFrame(render); if (document.hidden || time - last < 48 || (!getMotion() && !dirty)) return; last = time;
    ctx.clearRect(0, 0, width, height); const animated = getMotion();
    for (const s of stars) {
      const twinkle = animated ? .78 + Math.sin(time * .0006 + s.phase) * .22 : 1;
      const x = ((s.x + (animated ? pointerX * s.depth * 12 : 0)) % width + width) % width;
      const y = ((s.y - (animated ? window.scrollY * .018 * s.depth : 0) + (animated ? pointerY * s.depth * 8 : 0)) % height + height) % height;
      ctx.fillStyle = s.violet ? `rgba(176,139,255,${s.alpha * twinkle})` : `rgba(235,231,248,${s.alpha * twinkle})`; ctx.beginPath(); ctx.arc(x, y, s.r, 0, Math.PI * 2); ctx.fill();
      if (s.r > 1.85) { ctx.strokeStyle = `rgba(201,178,255,${s.alpha * twinkle * .35})`; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(x - s.r * 3, y); ctx.lineTo(x + s.r * 3, y); ctx.moveTo(x, y - s.r * 3); ctx.lineTo(x, y + s.r * 3); ctx.stroke(); }
    } dirty = false;
  };
  const pointer = e => { pointerX = e.clientX / innerWidth - .5; pointerY = e.clientY / innerHeight - .5; }, refresh = () => { dirty = true; };
  resize(); render(); window.addEventListener('resize', resize); window.addEventListener('pointermove', pointer, { passive: true }); window.addEventListener('scroll', refresh, { passive: true }); document.addEventListener('visibilitychange', refresh);
  return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); window.removeEventListener('pointermove', pointer); window.removeEventListener('scroll', refresh); document.removeEventListener('visibilitychange', refresh); canvas.remove(); };
}

// A local preference; changing themes never resets the story or scroll position.
export function initTheme() {
  const root = document.documentElement;
  const control = document.createElement('button');
  control.className = 'orbit-switch';
  control.type = 'button';
  control.innerHTML = '<span class="orbit-switch-art" aria-hidden="true"><i class="orbit-switch-track"></i><i class="orbit-switch-planet"></i><i class="orbit-switch-satellite"></i></span><span class="orbit-switch-label" aria-hidden="true"></span>';
  document.body.append(control);
  let busy = false, disposed = false;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('motion-off');
  const daylightAssets=['landing','foreground','shared','seo','aeo','geo'].map(key=>`/assets/pluto-day-${key}.webp`);
  let daylightReady;
  const prepareDaylight=()=>daylightReady??=Promise.all(daylightAssets.map(src=>{const image=new Image();image.src=src;return image.decode().catch(()=>{daylightReady=null;});}));
  const prepare=()=>{if(root.dataset.theme!=='light')prepareDaylight();};
  control.addEventListener('pointerenter',prepare);
  control.addEventListener('focus',prepare);
  function apply(theme) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    control.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    control.setAttribute('aria-pressed', String(theme === 'light'));
    control.title = theme === 'dark' ? 'Enter daylight' : 'Return to the night';
    control.querySelector('.orbit-switch-label').textContent = theme === 'dark' ? 'Daylight' : 'Nightfall';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f3f7fc' : '#020205');
    document.dispatchEvent(new CustomEvent('icypluto:theme',{detail:theme}));
  }
  apply(root.dataset.theme === 'light' ? 'light' : 'dark');
  async function toggle() {
    if (busy) return;
    busy=true;control.setAttribute('aria-busy','true');
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    if(next==='light')await prepareDaylight();
    if(disposed)return;
    try { localStorage.setItem('icypluto-theme', next); } catch {}
    if (reduced() || !document.startViewTransition) { apply(next);busy=false;control.removeAttribute('aria-busy');return; }
    busy = true;
    const rect = control.getBoundingClientRect(), x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth-x), Math.max(y, innerHeight-y));
    const transition = document.startViewTransition(() => apply(next));
    try {
      await transition.ready;
      if (disposed) { transition.skipTransition(); return; }
      await root.animate({clipPath:[`circle(0px at ${x}px ${y}px)`,`circle(${radius}px at ${x}px ${y}px)`]}, {
        duration: 780, easing:'cubic-bezier(.22,1,.36,1)', pseudoElement:'::view-transition-new(root)', fill:'both'
      }).finished;
      await transition.finished;
    } catch { apply(next); } finally { busy = false;control.removeAttribute('aria-busy'); }
  }
  const sync = event => { if (event.key === 'icypluto-theme') apply(event.newValue === 'light' ? 'light' : 'dark'); };
  control.addEventListener('click', toggle);
  window.addEventListener('storage', sync);
  return () => { disposed=true;control.remove();window.removeEventListener('storage',sync); };
}

import './style.css';
import './typography.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionEnabled = !reducedMotion.matches;
let animationContext;
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

// One persistent world links the hero, the manifesto, and the final invitation.
let renderer, scene, camera, planet, atmosphere, stars, orbit, renderFrame;
let sceneDirty = true;
const planetState = { x: 2.7, y: 0, scale: 2.3, opacity: 1, rotation: 0 };
const pointer = { x: 0, y: 0 };
const vertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;
void main(){
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}`;
const fragmentShader = `
precision highp float;
varying vec3 vNormal;
varying vec3 vPosition;
uniform float uOpacity;
uniform float uRotation;
float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 x){
  vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
  return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float fbm(vec3 p){float v=0.;float a=.5;for(int i=0;i<6;i++){v+=a*noise(p);p=p*2.07+vec3(1.7,9.2,3.4);a*=.5;}return v;}
void main(){
  float c=cos(uRotation),s=sin(uRotation);
  vec3 p=mat3(c,0.,s,0.,1.,0.,-s,0.,c)*vPosition;
  float continent=fbm(p*3.8+fbm(p*2.)*2.);
  float ridges=1.-abs(fbm(p*35.)*2.-1.);
  float fine=fbm(p*145.);
  float ice=smoothstep(.40,.64,continent);
  vec3 stone=mix(vec3(.23,.28,.35),vec3(.60,.65,.71),ice);
  stone=mix(stone,vec3(.64,.63,.61),smoothstep(.57,.69,continent)*.45);
  stone*=.57+ridges*.28+fine*.38;
  float crater=pow(abs(sin(p.x*42.+fbm(p*8.)*19.)*sin(p.y*38.+fbm(p*13.)*13.)),18.);
  stone-=crater*.09;
  vec3 n=normalize(vNormal);
  float light=dot(n,normalize(vec3(-.9,.65,.85)));
  float diffuse=smoothstep(-.28,.95,light);
  vec3 color=stone*(diffuse*.97+.025);
  float rim=pow(1.-max(dot(n,vec3(0,0,1)),0.),3.8);
  color+=vec3(.30,.47,.76)*rim*max(light+.35,0.)*.55;
  color=mix(color,vec3(.018,.027,.048),(1.-smoothstep(-.6,.05,light))*.7);
  gl_FragColor=vec4(color,uOpacity);
}`;

function initUniverse() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas: $('#universe'), alpha: true, antialias: window.devicePixelRatio < 2, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
    renderer.setSize(window.innerWidth, window.innerHeight);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, .1, 100);
    camera.position.z = 10;
    planet = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms: { uOpacity: { value: 1 }, uRotation: { value: 0 } }, transparent: true }));
    scene.add(planet);
    atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.018, 64, 48), new THREE.ShaderMaterial({ vertexShader, fragmentShader: `varying vec3 vNormal; uniform float uOpacity; void main(){float edge=pow(1.-abs(dot(normalize(vNormal),vec3(0,0,1))),5.);gl_FragColor=vec4(.38,.55,.95,edge*.20*uOpacity);}`, uniforms: { uOpacity: { value: 1 } }, transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(atmosphere);
    const count = window.innerWidth < 760 ? 400 : 1000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    let seed = 129;
    const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (random() - .5) * 40;
      positions[i * 3 + 1] = (random() - .5) * 28;
      positions[i * 3 + 2] = -random() * 16 - 4;
      const brightness = .15 + random() * .65;
      colors.set([brightness * .72, brightness * .83, brightness], i * 3);
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ size: .022, vertexColors: true, transparent: true, opacity: .8, sizeAttenuation: true }));
    scene.add(stars);
    const points = new THREE.EllipseCurve(0,0,3.75,1.05,0,Math.PI*2,false,0).getPoints(200);
    const geometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x,p.y,0)));
    orbit = new THREE.LineLoop(geometry, new THREE.LineBasicMaterial({ color: 0x91b6ff, transparent: true, opacity: .18 }));
    orbit.rotation.set(.15, -.15, .45);
    scene.add(orbit);
    $('#universe').addEventListener('webglcontextlost', (event) => { event.preventDefault(); document.body.classList.add('webgl-unavailable'); cancelAnimationFrame(renderFrame); });
    renderUniverse();
  } catch (error) {
    document.body.classList.add('webgl-unavailable');
    console.warn('Using the static planet fallback:', error.message);
  }
}

let lastRender = 0;
function renderUniverse(time = 0) {
  renderFrame = requestAnimationFrame(renderUniverse);
  if (document.hidden || time - lastRender < 32 || (!motionEnabled && !sceneDirty)) return;
  lastRender = time;
  const mobile = window.innerWidth <= 760;
  const viewWidth = 2 * Math.tan(THREE.MathUtils.degToRad(20)) * 10 * camera.aspect;
  const scaleUnit = mobile ? Math.min(viewWidth / 7.3, 1) : Math.min(viewWidth / 14.6, 1.2);
  planet.position.set(planetState.x * scaleUnit + pointer.x * .04, planetState.y * scaleUnit + pointer.y * .035, 0);
  planet.scale.setScalar(planetState.scale * scaleUnit);
  planet.material.uniforms.uOpacity.value = planetState.opacity;
  planet.material.uniforms.uRotation.value = planetState.rotation + (motionEnabled ? time * .000012 : 0);
  atmosphere.position.copy(planet.position);
  atmosphere.scale.copy(planet.scale);
  atmosphere.material.uniforms.uOpacity.value = planetState.opacity;
  orbit.position.copy(planet.position);
  orbit.scale.setScalar(scaleUnit * planetState.scale / 2.3);
  orbit.material.opacity = planetState.opacity * .16;
  stars.rotation.y = pointer.x * .007;
  stars.rotation.x = pointer.y * .004;
  renderer.render(scene, camera);
  sceneDirty = false;
}

function configureMotion() {
  animationContext?.revert();
  document.body.classList.toggle('motion-paused', !motionEnabled);
  document.documentElement.style.scrollBehavior = motionEnabled ? 'smooth' : 'auto';
  if (!motionEnabled) { pointer.x = 0; pointer.y = 0; }
  $('#motion-toggle').textContent = `Motion: ${motionEnabled ? 'on' : 'off'}`;
  $('#motion-toggle').setAttribute('aria-pressed', String(!motionEnabled));
  animationContext = gsap.context(() => {
    const mobile = window.innerWidth <= 760;
    const mobileScaleUnit = Math.min((2 * Math.tan(THREE.MathUtils.degToRad(20)) * 10 * window.innerWidth / window.innerHeight) / 7.3, 1);
    const mobilePlanetY = ((window.innerHeight / 2 - 655) / window.innerHeight * 7.2794) / mobileScaleUnit;
    const home = { x: mobile ? .7 : 3.1, y: mobile ? mobilePlanetY : .15, scale: mobile ? 2.65 : 2.35, opacity: 1, rotation: 0 };
    gsap.set(planetState, home);
    // Motion is optional; every chapter retains its full content without it.
    if (motionEnabled) {
      gsap.from('.hero-copy h1', { y: 45, opacity: 0, duration: 1.25, ease: 'power3.out', delay: .15 });
      gsap.from('.hero-copy>p, .hero-actions, .hero-bottom, .planet-label', { y: 15, opacity: 0, duration: 1, stagger: .10, delay: .45 });
      gsap.fromTo(planetState, { scale: home.scale * .88 }, { scale: home.scale, duration: 2.5, ease: 'power2.out' });
      gsap.to('.hero-copy', { y: -35, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 15%', scrub: 1 } });
      gsap.to('.hero-orbits', { rotation: 16, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
      $$('.split-heading, .framework-intro, .community-invite, .final-cta h2, .final-cta>.button, .story-content').forEach(element => {
        gsap.from(element, { y: 35, opacity: 0, duration: .9, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 90%', once: true } });
      });
      gsap.from('.product-shell', { rotateX: mobile ? 0 : 12, y: 40, transformPerspective: 1100, ease: 'none', scrollTrigger: { trigger: '.product-shell', start: 'top 95%', end: 'top 30%', scrub: 1 } });
      gsap.from('.chart-line', { strokeDasharray: 900, strokeDashoffset: 900, duration: 2.1, ease: 'power2.out', scrollTrigger: { trigger: '.chart', start: 'top 85%', once: true } });
      gsap.from('.community-card', { y: 60, opacity: 0, duration: .8, stagger: .13, ease: 'power2.out', scrollTrigger: { trigger: '.community-grid', start: 'top 85%', once: true } });
      gsap.from('.shield-ring', { scale: .35, opacity: 0, stagger: .2, duration: 1.3, ease: 'power2.out', scrollTrigger: { trigger: '.cst-visual', start: 'top 75%', once: true } });
      $$('.cst-card').forEach((card, i) => gsap.from(card, { x: 35, opacity: 0, duration: .7, delay: i * .1, scrollTrigger: { trigger: card, start: 'top 88%', once: true } }));
      gsap.to('.shield-two', { rotation: 180, duration: 65, repeat: -1, ease: 'none' });
      gsap.to('.orbit-arm', { rotation: 325, duration: 28, repeat: -1, ease: 'none' });
      const orbitTimeline = gsap.timeline({ scrollTrigger: { trigger: '.orbit-stage', start: mobile ? 'top 70%' : 'top 20%', end: mobile ? 'bottom 25%' : '+=850', scrub: 1, pin: !mobile, anticipatePin: 1 } });
      orbitTimeline.from('.diagram-ring', { scale: .3, opacity: 0, stagger: .08 }, 0).from('.orbit-node', { opacity: 0, scale: .6, stagger: .2 }, .15).to('.orbit-arm', { rotation: 220, duration: 2 }, 0).from('.story-switch strong', { opacity: .1 }, .4);
      // Each discovery moment travels through an arc as the visitor advances.
      $$('.orbit-node').forEach((node, index) => {
        const distance = mobile ? 22 : 38;
        orbitTimeline.fromTo(node, { x: Math.cos(index * Math.PI / 2) * -distance, y: Math.sin(index * Math.PI / 2) * -distance }, { keyframes: [{ x: Math.cos(index * Math.PI / 2 + .6) * distance, y: Math.sin(index * Math.PI / 2 + .6) * distance }, { x: 0, y: 0 }], duration: 1.5, ease: 'sine.inOut' }, .2);
      });
    }
    // Position updates also run in reduced-motion mode to retain the chapter composition.
    gsap.to(planetState, { x: mobile ? 1 : 5, y: 1, scale: .8, opacity: 0, ease: 'none', onUpdate: () => { sceneDirty = true; }, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: motionEnabled ? 1 : true } });
    gsap.fromTo(planetState, { x: mobile ? -1.5 : -4.4, y: mobile ? 2.3 : 0, scale: mobile ? 3.2 : 3.6, opacity: 0, rotation: .3 }, { x: mobile ? -1.1 : -3.8, y: mobile ? 2 : -.2, scale: mobile ? 3 : 3.4, opacity: 1, rotation: .5, ease: 'none', immediateRender: false, onUpdate: () => { sceneDirty = true; }, scrollTrigger: { trigger: '.story', start: 'top bottom', end: 'top 10%', scrub: motionEnabled ? 1 : true } });
    gsap.to(planetState, { opacity: 0, x: -5, scale: 2.5, ease: 'none', immediateRender: false, onUpdate: () => { sceneDirty = true; }, scrollTrigger: { trigger: '.story', start: 'bottom 70%', end: 'bottom top', scrub: motionEnabled ? 1 : true } });
    gsap.to('.page-progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });
  });
  sceneDirty = true;
  ScrollTrigger.refresh();
}

const previewContent = {
  visibility: { title: 'AI visibility overview', subtitle: 'Brand mentions and share of voice across AI models.', breadcrumb: 'AI visibility', metrics: [['AI visibility score','78.4','/100','↑ 12.6 pts'],['Share of voice','32.8','%','↑ 8.2 pts'],['Brand mentions','1,284','','↑ 24.6%']], chart: 'Visibility over time', legend: 'Your brand', ranking: 'Visibility by model', rows: [['✳ ChatGPT',86],['✧ Gemini',79],['✳ Claude',74],['⌘ Perplexity',68]], insight: 'Go beyond rankings. See how AI models actually talk about your brand.' },
  competitors: { title: 'Competitor comparison', subtitle: 'Compare brand presence and find gaps worth closing.', breadcrumb: 'Competitor intelligence', metrics: [['Your category rank','#2','/8','↑ 2 places'],['Share of voice','32.8','%','↑ 8.2 pts'],['Tracked competitors','7','','Sample category']], chart: 'Competitive share of voice', legend: 'Acme Studio', ranking: 'Category presence', rows: [['Nova Works',91],['Acme Studio',78],['Orbit Labs',61],['Studio North',43]], insight: 'Identify where competitors appear and explore the questions your brand is missing.' },
  citations: { title: 'Citations and sources', subtitle: 'Explore the websites shaping AI recommendations.', breadcrumb: 'Citations & sources', metrics: [['Cited sources','248','','Across sample prompts'],['Owned-site citations','38.2','%','↑ 6.4 pts'],['Unique domains','86','','Sample source set']], chart: 'Owned citations over time', legend: 'Your website', ranking: 'Source distribution', rows: [['Owned website',38],['Editorial',29],['Community',21],['Directories',12]], insight: 'Understand which sources models cite, and where your own content enters the answer.' }
};
function setPreview(key) {
  const data = previewContent[key];
  if (!data) return;
  $$('.product-tabs button').forEach(tab => { const active = tab.dataset.tab === key; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
  $('#product-panel').setAttribute('aria-labelledby', `tab-${key}`);
  $('#preview-title').textContent = data.title;
  $('#preview-subtitle').textContent = data.subtitle;
  $('#preview-breadcrumb').textContent = data.breadcrumb;
  $('#chart-title').textContent = data.chart;
  $('#chart-legend').textContent = data.legend;
  $('#ranking-title').textContent = data.ranking;
  $('#preview-insight').textContent = data.insight;
  $('#dash-metrics').innerHTML = data.metrics.map(([label,value,unit,change]) => `<div class="metric"><span>${label}</span><strong>${value}<small>${unit}</small></strong><b>${change}</b></div>`).join('');
  $('#ranking-rows').innerHTML = data.rows.map(([label,value]) => `<div class="ranking-row"><span>${label}</span><small>${value}%</small><i><b style="width:${value}%"></b></i></div>`).join('');
  gsap.to('.chart-secondary', { opacity: key === 'competitors' ? 1 : 0, duration: motionEnabled ? .4 : 0 });
  $('#chart-svg').setAttribute('aria-label', `Illustrative ${data.chart.toLowerCase()}; sample data, not live results`);
  if (motionEnabled) gsap.fromTo('.dash-metrics, .dash-title, .models-card', { opacity: .3, y: 5 }, { opacity: 1, y: 0, duration: .35, overwrite: true });
}
$$('[data-tab]').forEach(tab => tab.addEventListener('click', () => setPreview(tab.dataset.tab)));
$('.product-tabs').addEventListener('keydown', event => {
  const tabs = $$('.product-tabs button');
  const current = tabs.indexOf(document.activeElement);
  if (current < 0 || !['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) return;
  event.preventDefault();
  const index = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  setPreview(tabs[index].dataset.tab);
  tabs[index].focus();
});
setPreview('visibility');

const contactDialog = $('#contact-dialog');
const resourceDialog = $('#resource-dialog');
let contactIntent = 'Book a demo';
let dialogTrigger;
function showDialog(dialog, trigger = document.activeElement) {
  dialogTrigger = trigger;
  dialog.showModal();
  document.body.classList.add('modal-open');
}
function openContact(intent, trigger) {
  contactIntent = intent;
  $('#contact-form').hidden = false;
  $('#contact-success').hidden = true;
  $('#contact-description').textContent = intent.includes('community') ? 'Meet the marketers thinking beyond the old rules.' : `Let’s talk about your next move. ${intent === 'Book a demo' ? 'Explore IcyPluto with the team.' : 'Tell us a little about your brand.'}`;
  showDialog(contactDialog, trigger);
}
$$('[data-contact]').forEach(button => button.addEventListener('click', () => openContact(button.dataset.contact, button)));
$$('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); });
  dialog.addEventListener('close', () => { if (!$('dialog[open]')) document.body.classList.remove('modal-open'); dialogTrigger?.focus(); });
});
$('#contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const subject = `IcyPluto — ${contactIntent}`;
  const message = `Hi IcyPluto team,\n\nI’m ${data.get('name')}. I’d like to connect about: ${contactIntent}.\n\nBrand website: ${data.get('website')}\nWork email: ${data.get('email')}\n\nLet’s find our orbit.`;
  $('#email-link').href = `mailto:info@icypluto.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  $('#contact-form').hidden = true;
  $('#contact-success').hidden = false;
  $('#contact-description').textContent = 'Your email introduction is ready.';
  $('#email-link').focus();
});
const resources = {
  podcast: { eyebrow: 'ITGAF / THE PODCAST', title: 'ITGAF Podcast', description: 'A space for candid conversations about the changing relationship between AI, brands, and discovery.', details: ['The ideas behind AI visibility and orbit marketing','Conversations with marketers navigating the shift','Episode information will be announced'], intent: 'ITGAF podcast updates' },
  summit: { eyebrow: 'AI VISIBILITY SUMMIT / ROUNDTABLES', title: 'AI Visibility Summit', description: 'A meeting point for marketers exploring how brands earn a place in AI-generated answers.', details: ['AI visibility strategy and practical discussions','Peer conversations and focused roundtables','Dates, speakers, and registration to be announced'], intent: 'AI Visibility Summit and roundtables' },
  academy: { eyebrow: 'AIO / GEO ACADEMY', title: 'AIO / GEO Academy', description: 'The planned learning home for Artificial Intelligence Optimization and Generative Engine Optimization, with a certification program on the horizon.', details: ['Foundations of AIO and GEO','The Content, Structure, Technical framework','Curriculum, certification, and launch dates to be announced'], intent: 'AIO/GEO Academy launch updates' }
};
let resourceIntent;
$$('[data-resource]').forEach(button => button.addEventListener('click', () => {
  const data = resources[button.dataset.resource];
  resourceIntent = data.intent;
  $('#resource-eyebrow').textContent = data.eyebrow;
  $('#resource-title').textContent = data.title;
  $('#resource-title').style.whiteSpace = 'pre-line';
  $('#resource-description').textContent = data.description;
  $('#resource-details').replaceChildren(...data.details.map(detail => { const p = document.createElement('p'); p.textContent = `↗  ${detail}`; return p; }));
  showDialog(resourceDialog, button);
}));
$('#resource-contact').addEventListener('click', () => { const originalTrigger = dialogTrigger; resourceDialog.close(); openContact(resourceIntent, originalTrigger); });

const menuToggle = $('.menu-toggle');
function closeMenu() { menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.setAttribute('aria-label', 'Open navigation'); $('#mobile-nav').hidden = true; }
menuToggle.addEventListener('click', () => { const open = menuToggle.getAttribute('aria-expanded') !== 'true'; menuToggle.setAttribute('aria-expanded', String(open)); menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); $('#mobile-nav').hidden = !open; });
$$('#mobile-nav a, #mobile-nav button').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (!entry.isIntersecting) return; $$('.flight-nav a').forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`)); });
}, { rootMargin: '-30% 0px -40% 0px', threshold: 0 });
$$('#home, #philosophy, #platform, #framework, #community').forEach(section => observer.observe(section));

let resizeTimer;
let previousWidth = window.innerWidth;
window.addEventListener('resize', () => {
  if (renderer) { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); sceneDirty = true; }
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { if (Math.abs(previousWidth - window.innerWidth) > 50) { previousWidth = window.innerWidth; closeMenu(); configureMotion(); } else ScrollTrigger.refresh(); }, 200);
});
window.addEventListener('pointermove', event => { if (!motionEnabled || event.pointerType === 'touch') return; pointer.x = event.clientX / window.innerWidth - .5; pointer.y = .5 - event.clientY / window.innerHeight; }, { passive: true });
window.addEventListener('scroll', () => { sceneDirty = true; }, { passive: true });
document.addEventListener('visibilitychange', () => { sceneDirty = true; });
$('#motion-toggle').addEventListener('click', () => { motionEnabled = !motionEnabled; configureMotion(); });
reducedMotion.addEventListener('change', event => { motionEnabled = !event.matches; configureMotion(); });
$('#year').textContent = String(new Date().getFullYear());
initUniverse();
configureMotion();
document.fonts.ready.then(() => ScrollTrigger.refresh());

// Dispose GPU resources during Vite hot replacement.
if (import.meta.hot) import.meta.hot.dispose(() => { cancelAnimationFrame(renderFrame); animationContext?.revert(); observer.disconnect(); scene?.traverse(object => { object.geometry?.dispose(); if (object.material) object.material.dispose(); }); renderer?.dispose(); });

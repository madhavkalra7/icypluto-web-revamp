import './clean.scss';
import { setupTwentyFirstComponents } from './components/21st/adaptations.js';
import { setupProductStory, animateProductStory } from './product-story.js';
import { startStarfield } from './starfield.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let motion = !reduced.matches;
try { if (localStorage.getItem('icypluto-motion') === 'off') motion = false; } catch {}
let context, productTrigger, animationFrame;
let ringWorld, ringRenderer, ringCamera, ringGroup, orbitBead, ringObserver;
let heroVisible = true, dirty = true, lastFrame = 0;
const ringPose = { turn: 0, tilt: 0 };
const pointer = { x: 0, y: 0 };

function initSculpture() {
  try {
    const canvas = $('#sculpture');
    ringRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    ringRenderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    ringRenderer.setClearColor(0x000000, 0);
    ringWorld = new THREE.Scene();
    ringCamera = new THREE.PerspectiveCamera(40, 1, .1, 50);
    ringCamera.position.z = 7.4;
    ringWorld.add(new THREE.HemisphereLight(0xffffff, 0x5c5d45, 3));
    const key = new THREE.DirectionalLight(0xffffff, 4);
    key.position.set(-3, 5, 5);
    ringWorld.add(key);
    const rim = new THREE.DirectionalLight(0xd6d6de, 2.5);
    rim.position.set(3, -2, 2);
    ringWorld.add(rim);
    // Invisible depth sphere allows the orbital sculpture to pass behind the photo.
    const depthSphere = new THREE.Mesh(new THREE.SphereGeometry(1.77, 48, 32), new THREE.MeshBasicMaterial({ colorWrite: false }));
    depthSphere.renderOrder = 0;
    ringWorld.add(depthSphere);
    ringGroup = new THREE.Group();
    ringGroup.rotation.set(1.14, .15, -.45);
    const metal = new THREE.MeshStandardMaterial({ color: 0xb6b8a2, metalness: .8, roughness: .24 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.15, .055, 14, 140), metal);
    ring.renderOrder = 1;
    ringGroup.add(ring);
    const fineRing = new THREE.Mesh(new THREE.TorusGeometry(2.42, .012, 8, 140), new THREE.MeshStandardMaterial({ color: 0x191916, metalness: .5, roughness: .5 }));
    fineRing.renderOrder = 1;
    ringGroup.add(fineRing);
    orbitBead = new THREE.Mesh(new THREE.SphereGeometry(.12, 24, 16), new THREE.MeshStandardMaterial({ color: 0xd6d6de, metalness: .15, roughness: .25 }));
    orbitBead.renderOrder = 1;
    ringGroup.add(orbitBead);
    ringWorld.add(ringGroup);
    resizeSculpture();
    ringObserver = new IntersectionObserver(entries => { heroVisible = entries[0].isIntersecting; dirty = true; }, { rootMargin: '100px' });
    ringObserver.observe($('.hero'));
    canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); document.body.classList.add('no-webgl'); cancelAnimationFrame(animationFrame); });
    drawSculpture();
  } catch {
    document.body.classList.add('no-webgl');
  }
}
function resizeSculpture() {
  if (!ringRenderer) return;
  const size = $('.hero-sculpture').clientWidth;
  ringRenderer.setSize(size, size, false);
  dirty = true;
}
function drawSculpture(time = 0) {
  animationFrame = requestAnimationFrame(drawSculpture);
  if (!heroVisible || document.hidden || time - lastFrame < 32 || (!motion && !dirty)) return;
  lastFrame = time;
  const turn = motion ? time * .00012 : 1.2;
  ringGroup.rotation.x = 1.14 + ringPose.tilt + pointer.y * .08;
  ringGroup.rotation.z = -.45 + ringPose.turn + pointer.x * .08;
  orbitBead.position.set(Math.cos(turn) * 2.15, Math.sin(turn) * 2.15, 0);
  ringRenderer.render(ringWorld, ringCamera);
  dirty = false;
}

function activeScene(index, managed = false) {
  $$('.scene-nav button').forEach((button, i) => {
    button.classList.toggle('active', i === index);
    if (i === index) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  $$('.product-scene').forEach((scene, i) => { scene.inert = managed && i !== index; });
}

function configureMotion() {
  context?.revert(); productTrigger = null;
  document.body.classList.toggle('motion-off', !motion);
  $('#motion-toggle').textContent = motion ? 'Motion on ◉' : 'Motion off ○';
  $('#motion-toggle').setAttribute('aria-pressed', String(!motion));
  document.documentElement.style.scrollBehavior = motion ? 'smooth' : 'auto';
  const horizontalProducts = motion && innerWidth > 1000 && innerHeight > 740;
  document.body.classList.toggle('natural-products', !horizontalProducts);
  activeScene(0);
  context = gsap.context(() => {
    gsap.to('.scroll-progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });
    animateProductStory(motion);
    if (!motion) return;
    gsap.from('.hero h1 .line > span', { yPercent: 110, duration: 1.05, stagger: .08, ease: 'power4.out' });
    gsap.from('.hero-description', { y: 20, opacity: 0, duration: .8, delay: .3, ease: 'power2.out' });
    gsap.from('.hero-sculpture', { scale: .9, duration: 1.5, ease: 'power3.out' });
    gsap.to('.hero-sculpture', { yPercent: -7, rotation: -6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
    gsap.to(ringPose, { turn: .35, tilt: -.1, ease: 'none', onUpdate: () => { dirty = true; }, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
    if (horizontalProducts) {
      const journey = $('.product-journey'), track = $('.product-track');
      const distance = () => Math.max(0, track.scrollWidth - innerWidth);
      const horizontal = gsap.to(track, { x: () => -distance(), ease: 'none', scrollTrigger: {
        trigger: journey, start: 'top top', end: () => '+=' + Math.max(innerWidth, distance()), pin: true, scrub: .65,
        anticipatePin: 1, invalidateOnRefresh: true, onUpdate: self => activeScene(Math.min(2, Math.round(self.progress * 2)), true)
      } });
      productTrigger = horizontal.scrollTrigger;
      gsap.to('.product-scrollbar i', { xPercent: 200, ease: 'none', scrollTrigger: { trigger: journey, start: () => productTrigger.start, end: () => productTrigger.end, scrub: true } });
    }
    $$('.framework-card, .ticket').forEach(element => gsap.from(element, { y: 22, duration: .7, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true } }));
  });
  dirty = true; ScrollTrigger.refresh();
}

$$('[data-scene]').forEach(button => button.addEventListener('click', () => {
  const index = Number(button.dataset.scene);
  if (productTrigger) {
    const position = productTrigger.start + (productTrigger.end - productTrigger.start) * index / 2 + (index === 0 ? 1 : 0);
    window.scrollTo({ top: position, behavior: motion ? 'smooth' : 'auto' });
  } else $$('.product-scene')[index].scrollIntoView({ behavior: motion ? 'smooth' : 'auto', block: 'start' });
  activeScene(index, Boolean(productTrigger));
}));

// All calls to action work without a backend or hidden subscription.
const contactDialog = $('#contact-dialog'), resourceDialog = $('#resource-dialog');
let lastTrigger, contactIntent = 'Book a demo', resourceIntent;
function showDialog(dialog, trigger = document.activeElement) {
  lastTrigger = trigger;
  dialog.showModal();
  document.body.classList.add('modal-open');
}
function openContact(intent, trigger) {
  contactIntent = intent;
  $('#contact-form').hidden = false;
  $('#contact-success').hidden = true;
  $('#contact-description').textContent = intent.includes('community') ? 'Connect with marketers working on AI visibility.' : 'Tell the IcyPluto team what you want to explore.';
  showDialog(contactDialog, trigger);
}
$$('[data-contact]').forEach(button => button.addEventListener('click', () => openContact(button.dataset.contact, button)));
$$('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (!$('dialog[open]')) document.body.classList.remove('modal-open');
    lastTrigger?.focus({ preventScroll: true });
  });
});
$('#contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const subject = 'IcyPluto - ' + contactIntent;
  const body = 'Hi IcyPluto team,\n\nMy name is ' + data.get('name') + '. I would like to connect about: ' + contactIntent + '.\n\nBrand website: ' + data.get('website') + '\nWork email: ' + data.get('email') + '\n\nThanks!';
  $('#email-link').href = 'mailto:info@icypluto.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  $('#contact-form').hidden = true;
  $('#contact-success').hidden = false;
  $('#email-link').focus();
});
const resources = {
  podcast: { label: 'ITGAF / THE PODCAST', title: 'THE CONVERSATIONS.', description: 'Conversations about AI search, marketing, and how brands adapt.', details: ['AI visibility and the changing discovery journey', 'The decisions facing marketing teams', 'Episode details will be announced'], intent: 'ITGAF podcast updates' },
  summit: { label: 'AI VISIBILITY SUMMIT', title: 'THE GATHERINGS.', description: 'Meet marketers exploring how brands earn a place in AI-generated answers.', details: ['Focused roundtables and strategy discussions', 'Shared experiences from marketers', 'Dates and speakers will be announced'], intent: 'AI Visibility Summit and roundtables' },
  academy: { label: 'AIO / GEO ACADEMY', title: 'THE LEARNING.', description: 'The planned learning program for AI visibility and generative engine optimization.', details: ['AIO and GEO foundations', 'The Content, Structure, Technical framework', 'Certification and curriculum details to be announced'], intent: 'AIO/GEO Academy launch updates' }
};
$$('[data-resource]').forEach(button => button.addEventListener('click', () => {
  const data = resources[button.dataset.resource];
  resourceIntent = data.intent;
  $('#resource-label').textContent = data.label;
  $('#resource-title').textContent = data.title;
  $('#resource-description').textContent = data.description;
  $('#resource-details').replaceChildren(...data.details.map(detail => { const p = document.createElement('p'); p.textContent = '↗ ' + detail; return p; }));
  showDialog(resourceDialog, button);
}));
$('#resource-contact').addEventListener('click', () => {
  const trigger = lastTrigger;
  resourceDialog.close();
  openContact(resourceIntent, trigger);
});
const menuToggle = $('.menu-toggle');
function closeMenu() { menuToggle.setAttribute('aria-expanded','false'); menuToggle.setAttribute('aria-label','Open navigation'); $('#mobile-menu').hidden = true; }
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  $('#mobile-menu').hidden = !open;
});
$$('#mobile-menu a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
$('#motion-toggle').addEventListener('click', () => {
  motion = !motion;
  try { localStorage.setItem('icypluto-motion', motion ? 'on' : 'off'); } catch {}
  configureMotion();
});
reduced.addEventListener('change', event => { motion = !event.matches; configureMotion(); });
window.addEventListener('pointermove', event => {
  if (!motion || event.pointerType === 'touch') return;
  pointer.x = event.clientX / innerWidth - .5;
  pointer.y = .5 - event.clientY / innerHeight;
}, { passive: true });
let resizeTimer, previousWidth = innerWidth;
window.addEventListener('resize', () => {
  resizeSculpture();
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (Math.abs(previousWidth - innerWidth) > 40) { previousWidth = innerWidth; closeMenu(); configureMotion(); }
    else ScrollTrigger.refresh();
  }, 220);
});
document.addEventListener('visibilitychange', () => { dirty = true; });
$('#year').textContent = new Date().getFullYear();
setupProductStory(() => motion);
setupTwentyFirstComponents(() => motion);
const stopStarfield = startStarfield(() => motion);
initSculpture();
configureMotion();
document.fonts.ready.then(() => ScrollTrigger.refresh());
if (import.meta.hot) import.meta.hot.dispose(() => {
  context?.revert(); ringObserver?.disconnect(); cancelAnimationFrame(animationFrame);
  ringWorld?.traverse(object => { object.geometry?.dispose(); object.material?.dispose(); });
  ringRenderer?.dispose();
  stopStarfield();
});


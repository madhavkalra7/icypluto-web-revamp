import { initPillNavigation } from './navbar.js';
import './clean.scss';
import './pluto-hero.scss';
import './navbar.scss';
import { setupTwentyFirstComponents } from './components/21st/adaptations.js';
import { setupProductStory, animateProductStory } from './product-story.js';
import { startStarfield } from './starfield.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initPlutoHero } from './pluto-hero.js';

gsap.registerPlugin(ScrollTrigger);
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let motion = !reduced.matches;
try { if (localStorage.getItem('icypluto-motion') === 'off') motion = false; } catch {}
let context, productTrigger;
let heroExperience, navigation;

let previousScene=-1,previousManaged;
function activeScene(index, managed = false) {
  if(index===previousScene&&managed===previousManaged)return;
  previousScene=index;previousManaged=managed;
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
  heroExperience?.refresh(); ScrollTrigger.refresh();
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
  const panel=trigger?.closest?.('.nav-panel');
  lastTrigger = panel ? document.querySelector(`[aria-controls="${panel.id}"]`) : trigger;
  dialog.showModal();
  document.body.classList.add('modal-open');
}
function openContact(intent, trigger) {
  contactIntent = intent;
  $('#contact-form').hidden = false;
  $('#contact-success').hidden = true;
  $('#contact-description').textContent = intent.includes('community') ? 'Connect with marketers working on AI visibility.' : intent.includes('Pricing') ? 'Ask the IcyPluto team about pricing for your brand or agency.' : 'Tell the IcyPluto team what you want to explore.';
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
function closeMenu() { navigation?.close(); }
$('#motion-toggle').addEventListener('click', () => {
  motion = !motion;
  try { localStorage.setItem('icypluto-motion', motion ? 'on' : 'off'); } catch {}
  configureMotion();
});
reduced.addEventListener('change', event => { motion = !event.matches; configureMotion(); });
let resizeTimer, previousWidth = innerWidth;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (Math.abs(previousWidth - innerWidth) > 40) { previousWidth = innerWidth; closeMenu(); configureMotion(); }
    else ScrollTrigger.refresh();
  }, 220);
});
$('#year').textContent = new Date().getFullYear();
setupProductStory(() => motion);
setupTwentyFirstComponents(() => motion);
const stopStarfield = startStarfield(() => motion);
navigation = initPillNavigation(() => motion);
heroExperience = initPlutoHero(() => motion, ({ focus, website, trigger }) => {
  openContact(focus + ' demo', trigger);
  if (website) document.querySelector('#contact-form [name="website"]').value = website;
});
configureMotion();
document.fonts.ready.then(() => ScrollTrigger.refresh());
if (import.meta.hot) import.meta.hot.dispose(() => {
  context?.revert(); heroExperience?.dispose(); navigation?.dispose(); stopStarfield();
});

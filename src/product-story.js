import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
let readMotion = () => false, launchTrigger, selectedMission = 0;
const signals = {
  mentions: ['Did your brand make the answer?', 'Track when your brand is mentioned across the questions and AI models you monitor.', '◎'],
  competition: ['Who else is in the conversation?', 'Compare competing brands in the same responses. Investigate the questions where they appear and you do not.', '↗'],
  citations: ['Where did the answer come from?', 'Explore cited websites and separate your own content from editorial, community, and other sources.', '⌁'],
};
const tools = {
  brand: ['Brand Analysis', 'Investigate how AI models perceive your brand, with prompts and regional context you choose.'],
  seo: ['SEOMax', 'Audit your website, review category scores, and find technical and content issues with recommended fixes.'],
  content: ['IcyQuill', 'Create AI-assisted content from a topic and writing settings, then review, refine, and export your draft.'],
  shopping: ['AI Shopping', 'Explore which products, brands, and retailers appear in AI shopping answers—and how your products compare.'],
  demand: ['Demand Intelligence', 'Explore demand signals to understand what your audience is looking for and inform your marketing priorities.'],
  geo: ['GEO Bot', 'Explore keyword analytics, AI ranking recommendations, and a copilot for content and discovery optimizations.'],
};
const missions = [
  ['Add your brand.', 'Add your website and brand details. Set the market and region you want to understand.', ['Website', 'Brand profile', 'Target market']],
  ['Choose your questions.', 'Set your topics and competitors. Review the customer questions you want to track and choose the AI models for your report.', ['Topics', 'Competitors', 'Prompts & models']],
  ['Review your report.', 'Review your visibility, citations, and competitors. Use the findings and recommendations to decide what to improve next.', ['AI visibility', 'Cited sources', 'Next actions']],
];
function selectTab(buttons, selected, panel) {
  buttons.forEach(button => { const active = button === selected; button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1; });
  panel.setAttribute('aria-labelledby', selected.id);
}
function keyboardTabs(container, selector, activate) {
  container.addEventListener('keydown', event => {
    const list = [...container.querySelectorAll(selector)], current = list.indexOf(document.activeElement);
    if (current < 0 || !['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? list.length - 1 : (current + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + list.length) % list.length;
    activate(list[next]); list[next].focus({ preventScroll: true });
  });
}
function reveal(selector) { if (readMotion()) gsap.fromTo(selector, { y: 8, opacity: .4 }, { y: 0, opacity: 1, duration: .35, overwrite: true }); }
function setSignal(key, animate = true) {
  const data = signals[key]; if (!data) return;
  selectTab($$('[data-signal-tab]'), $(`[data-signal-tab="${key}"]`), $('#signal-detail'));
  $('.lab-answer').dataset.focus = key;
  $('#signal-title').textContent = data[0]; $('#signal-description').textContent = data[1]; $('#signal-symbol').textContent = data[2];
  if (animate) reveal('#signal-detail > div');
}
function setTool(key, animate = true) {
  const data = tools[key]; if (!data) return;
  selectTab($$('[data-tool]'), $(`[data-tool="${key}"]`), $('#tool-detail'));
  $('#tool-title').textContent = data[0]; $('#tool-description').textContent = data[1]; $('#tool-demo').dataset.contact = `${data[0]} demo`;
  $('.tool-map').dataset.active = key;
  if (animate) reveal('#tool-detail > div');
}
function setMission(index, animate = true, jump = false) {
  const data = missions[index]; if (!data) return;
  selectedMission = index;
  selectTab($$('[data-mission]'), $(`[data-mission="${index}"]`), $('#mission-panel'));
  $('#mission-title').innerHTML = data[0]; $('#mission-description').textContent = data[1]; 
  $('#mission-fields').replaceChildren(...data[2].map(label => { const span = document.createElement('span'); span.textContent = label; return span; })); $('.launch-art').dataset.step = String(index);
  if (animate) reveal('#mission-title, #mission-description, #mission-fields');
  if (jump && launchTrigger) window.scrollTo({ top: launchTrigger.start + (launchTrigger.end - launchTrigger.start) * ((index + .2) / 3), behavior: readMotion() ? 'smooth' : 'auto' });
}
export function setupProductStory(getMotion) {
  readMotion = getMotion;
  $$('[data-signal-tab]').forEach(button => button.addEventListener('click', () => setSignal(button.dataset.signalTab)));
  keyboardTabs($('.signal-tabs'), '[data-signal-tab]', button => setSignal(button.dataset.signalTab));
  $$('[data-tool]').forEach(button => button.addEventListener('click', () => setTool(button.dataset.tool)));
  keyboardTabs($('.tool-nodes'), '[data-tool]', button => setTool(button.dataset.tool));
  $$('[data-mission]').forEach(button => button.addEventListener('click', () => setMission(Number(button.dataset.mission), true, true)));
  keyboardTabs($('.mission-tabs'), '[data-mission]', button => setMission(Number(button.dataset.mission), true, true));
  $('.answer-lab').addEventListener('pointermove', event => {
    if (!readMotion()) return; const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--pointer-x', `${(event.clientX - rect.left) / rect.width * 100}%`);
    event.currentTarget.style.setProperty('--pointer-y', `${(event.clientY - rect.top) / rect.height * 100}%`);
  }, { passive: true });
  setSignal('mentions', false); setTool('brand', false); setMission(0, false);
}
export function animateProductStory(enabled) {
  launchTrigger = null;
  document.body.classList.add('natural-launch');
  if (!enabled) return;
  gsap.from('.answer-lab', { y: 30, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.answer-lab', start: 'top 90%', once: true } });
  gsap.to('.launch-art .astronaut', { y: -9, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
}

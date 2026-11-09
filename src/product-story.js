import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
let readMotion = () => false, launchTrigger, selectedMission = 0;
const tools = {
  brand: ['Brand Analysis', 'See how AI describes your brand.'],
  seo: ['SEOMax', 'Find website issues. Plan your fixes.'],
  content: ['IcyQuill', 'Draft, refine, and export your content.'],
  shopping: ['AI Shopping', 'See which products appear in AI shopping answers.'],
  demand: ['Demand Intelligence', 'Understand what your audience wants.'],
  geo: ['GEO Bot', 'Find keywords and content opportunities.'],
};
const aiMissions = [
  ['Add your brand.', 'Add your website and target market.', ['Website', 'Brand profile', 'Target market']],
  ['Choose your questions.', 'Choose your questions, competitors, and AI models.', ['Topics', 'Competitors', 'Prompts & models']],
  ['Review your report.', 'See your visibility. Choose your next move.', ['AI visibility', 'Cited sources', 'Next actions']],
];
const seoMissions = [
  ['Add your website.', 'Enter your website in SEOMax.', ['Website', 'Audit scope', 'Site context']],
  ['Explore the audit.', 'Review your website findings.', ['Category scores', 'Content issues', 'Technical findings']],
  ['Plan the next fixes.', 'Make changes. Run a fresh audit.', ['Recommended fixes', 'Page updates', 'Fresh audit']],
];
let missions = aiMissions;
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
 $('.launch-art').dataset.step = String(index);
  if (animate) reveal('#mission-title, #mission-description');
  if (jump && launchTrigger) window.scrollTo({ top: launchTrigger.start + (launchTrigger.end - launchTrigger.start) * ((index + .2) / 3), behavior: readMotion() ? 'smooth' : 'auto' });
}
export function setupProductStory(getMotion) {
  readMotion = getMotion;
  $$('[data-tool]').forEach(button => button.addEventListener('click', () => setTool(button.dataset.tool)));
  keyboardTabs($('.tool-nodes'), '[data-tool]', button => setTool(button.dataset.tool));
  $$('[data-mission]').forEach(button => button.addEventListener('click', () => setMission(Number(button.dataset.mission), true, true)));
  keyboardTabs($('.mission-tabs'), '[data-mission]', button => setMission(Number(button.dataset.mission), true, true));
  setTool('brand', false); setMission(0, false);
  document.addEventListener('icypluto:discovery', event => {
    const seo = event.detail === 'seo';
    setTool(seo ? 'seo' : event.detail === 'geo' ? 'geo' : 'brand', false);
    missions = seo ? seoMissions : aiMissions;
    const names = seo ? ['Your website', 'Your audit', 'Your fixes'] : ['Your brand', 'Your questions', 'Your report'];
    $$('[data-mission]').forEach((button,i) => {button.replaceChildren();const number=document.createElement('span');number.textContent=`0${i+1}`;button.append(number,document.createTextNode(names[i]));});
    $('#launch-heading').textContent='Get started.';
    setMission(selectedMission, false);
  });
}
export function animateProductStory(enabled) {
  launchTrigger = null;
  document.body.classList.add('natural-launch');
  if (!enabled) return;

}

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createContinuousWorld } from './continuous-world.js';
let world, readMotion=()=>true, reconfigure=()=>{}, selected='aeo';
const descriptions={
  seo:['SEOMax','Website health, content issues, and technical findings in one audit.'],
  aeo:['Brand Analysis','Brand mentions, competing brands, and the context inside AI answers.'],
  geo:['GEO Bot','Cited sources, keyword insights, and recommendations for your next content work.'],
};
export function setupDiscovery(getMotion, refresh){
  readMotion=getMotion;reconfigure=refresh;
  document.body.classList.add('continuous-pluto');
  document.querySelector('#discovery-experience').innerHTML=`<div class="discovery" data-mode="aeo">
    <section class="world-chapter world-overview" id="what-is-icypluto" data-world="intro" aria-labelledby="discovery-title">
      <div class="world-overview-top"><div class="discovery-switch" role="group" aria-label="Explore a capability"><button data-discovery="seo" aria-pressed="false">SEO</button><button data-discovery="aeo" aria-pressed="true">AEO</button><button data-discovery="geo" aria-pressed="false">GEO</button></div></div>
      <div class="world-overview-copy"><h2 id="discovery-title">Your AI<br>marketing HQ.</h2><p>SEO. AEO. GEO.<br>One connected workspace.</p><a class="world-link" href="#capability-aeo">Explore the platform <span>↓</span></a></div>
    </section>
    <div class="capability-worlds" id="platform">
      <section class="world-chapter world-seo" id="capability-seo" data-world="seo" aria-labelledby="seo-title">
        <div class="world-chapter-copy"><h2 id="seo-title">Fix your<br>website.</h2><p>Find technical issues.<br>Prioritize the fixes.</p><button class="world-link" data-contact="SEOMax website audit demo">Explore SEOMax <span>→</span></button></div>
        <div class="world-scan-readout"><div class="audit-controls" role="group" aria-label="Explore an audit finding"><button data-audit="0" aria-pressed="true">Content</button><button data-audit="1" aria-pressed="false">Structure</button><button data-audit="2" aria-pressed="false">Technical</button></div><p class="audit-explanation">Clear page titles.</p></div>
      </section>
      <section class="world-chapter world-aeo" id="capability-aeo" data-world="aeo" aria-labelledby="aeo-title">
        <div class="answer-heading"><h2 id="aeo-title">Your brand.<br><em>In AI answers.</em></h2></div>
        <div class="answer-explainer"><p>Track mentions.<br>Compare competitors.</p><button class="world-link" data-contact="AI answer visibility demo">See your AI visibility <span>→</span></button></div>
      </section>
      <section class="world-chapter world-geo" id="capability-geo" data-world="geo" aria-labelledby="geo-title">
        <div class="world-chapter-copy"><h2 id="geo-title">Follow the<br>sources.</h2><p>Trace cited websites.<br>Spot content gaps.</p><button class="world-link" data-contact="GEO sources and recommendations demo">Follow your source trail <span>→</span></button></div>
      </section>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend',`<nav class="world-nav" aria-label="Explore the IcyPluto world">${[['intro','what-is-icypluto','Overview'],['aeo','capability-aeo','AEO'],['seo','capability-seo','SEO'],['geo','capability-geo','GEO'],['tools','tools','Toolkit'],['framework','framework','CST'],['collective','collective','Community']].map(([key,id,label])=>`<a href="#${id}" data-world-link="${key}" aria-label="${label}"><i></i><span>${label}</span></a>`).join('')}</nav>`);
  const sectionWorlds={tools:'tools',framework:'framework','how-it-works':'launch',collective:'collective',questions:'questions',contact:'contact'};
  for(const [id,key] of Object.entries(sectionWorlds))document.getElementById(id).dataset.world=key;
  document.querySelector('#tools-heading').innerHTML='Your marketing<br>toolkit.';
  document.querySelector('.tool-intro .folio').textContent='THE ICYPLUTO WORKSPACE';
  document.querySelector('.tool-intro > p').textContent='Research. Write. Optimize.';
  document.querySelector('#framework-heading').innerHTML='Three<br>foundations.';
  document.querySelector('.framework-heading .folio').textContent='CONTENT / STRUCTURE / TECHNICAL';
  document.querySelector('.framework-heading > p').textContent='CST connects the work behind search and AI discovery.';
  document.querySelectorAll('.framework-copy h3').forEach((h,i)=>h.textContent=['Content.','Structure.','Technical.'][i]);
  document.querySelectorAll('.framework-copy > p').forEach((p,i)=>p.textContent=['Answer real questions.','Connect your pages.','Remove crawl barriers.'][i]);
  document.querySelector('#collective-heading').innerHTML='Learn.<br>Meet. Share.';
  document.querySelector('.collective-heading > p').textContent='Conversations, learning, and people exploring what comes next for marketing.';
  document.querySelector('.contact-chapter > h2').innerHTML='Find your<br>next orbit.';
  document.querySelector('.contact-bottom > p').textContent='Take a closer look at what IcyPluto can show you.';
  document.querySelectorAll('[data-discovery]').forEach(button=>button.addEventListener('click',()=>{selectCapability(button.dataset.discovery);document.querySelector(`#capability-${button.dataset.discovery}`).scrollIntoView({behavior:readMotion()?'smooth':'auto'});}));
  document.addEventListener('icypluto:hero-capability',event=>selectCapability(event.detail));
  const auditCopy=['Clear page titles.','Connected pages.','Crawlable content.'];
  document.querySelectorAll('[data-audit]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-audit]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.querySelector('.audit-explanation').textContent=auditCopy[Number(button.dataset.audit)];document.dispatchEvent(new CustomEvent('icypluto:inspect',{detail:Number(button.dataset.audit)}));}));
  document.querySelector('.capability-worlds').prepend(document.querySelector('#capability-aeo'));
  document.querySelector('#launch-heading').textContent='Get started.';
  document.querySelectorAll('#main .folio,.framework-heading > p,.framework-card-top,.collective-heading > p,.ticket-bottom > p,.ticket-bottom > span,.contact-bottom > p').forEach(element=>element.remove());
  const questions=[...document.querySelectorAll('.faq-list details')];[questions[1],questions[3]].forEach(element=>element?.remove());
  document.querySelectorAll('.faq-list details [data-slot="accordion-content"] p').forEach((p,i)=>p.textContent=[
    'Audit your website. Track AI mentions. Compare competitors. Explore the sources behind the answers.',
    'Explore platforms such as ChatGPT, Gemini, Claude, Perplexity, and Google AI Overviews. Availability depends on your report.',
    'No. IcyPluto helps you measure visibility and improve what you control. AI responses vary.'
  ][i]);
  world=createContinuousWorld(readMotion);
  ScrollTrigger.addEventListener('refresh',world.refresh);
  return {dispose(){ScrollTrigger.removeEventListener('refresh',world.refresh);world?.dispose();document.querySelector('.world-nav')?.remove();}};
}
function selectCapability(mode){if(!descriptions[mode]||mode===selected)return;selected=mode;document.querySelector('.discovery').dataset.mode=mode;document.querySelector('.world-overview-copy .world-link').href=`#capability-${mode}`;document.querySelectorAll('[data-discovery]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.discovery===mode)));document.dispatchEvent(new CustomEvent('icypluto:select-capability',{detail:mode}));document.dispatchEvent(new CustomEvent('icypluto:discovery',{detail:mode}));const container=document.querySelector('.capability-worlds'),order=[mode,...['seo','aeo','geo'].filter(key=>key!==mode)];for(const key of order){container.append(document.querySelector(`#capability-${key}`));document.querySelector('.world-nav').insertBefore(document.querySelector(`[data-world-link="${key}"]`),document.querySelector('[data-world-link="tools"]'));}reconfigure();}
export function animateDiscovery(enabled){
  world?.refresh();
  if(!enabled){const lines=document.querySelectorAll('#main .motion-line-inner');if(lines.length)gsap.set(lines,{clearProps:'transform'});return;}
  document.querySelectorAll('#main > section:not(.pluto-hero) h2, .discovery h2').forEach(heading=>{
    if(!heading.querySelector('.motion-line')){
      const lines=heading.innerHTML.split(/<br\s*\/?\s*>/i);
      heading.replaceChildren();
      lines.forEach((html,i)=>{if(i)heading.append(document.createTextNode(' '));const mask=document.createElement('span'),line=document.createElement('span');mask.className='motion-line';line.className='motion-line-inner';line.innerHTML=html;mask.append(line);heading.append(mask);});
      heading.dataset.revealPrepared='true';
    }
    gsap.fromTo(heading.querySelectorAll('.motion-line-inner'),{yPercent:108},{yPercent:0,stagger:.1,ease:'power3.out',scrollTrigger:{trigger:heading,start:'top 91%',end:'top 55%',scrub:.15}});
  });
  document.querySelectorAll('.world-overview-copy,.world-chapter-copy,.answer-explainer,.tool-intro,#tool-detail,.framework-copy,#mission-panel').forEach(group=>{
    const elements=[...group.children].filter(element=>element.matches('p,a,button,h3'));
    if(elements.length)gsap.from(elements,{y:24,opacity:.15,stagger:.12,duration:.8,ease:'power2.out',scrollTrigger:{trigger:group,start:'top 83%',toggleActions:'play none none reverse'}});
  });
}

import gsap from 'gsap';
const questions=[
 {responses:['For a weekend hike, compare Northline Trail 18 and Ridge & River Day 20. Look for a supportive harness, a water-resistant finish, and enough space for an extra layer.','Aster Outdoor offers a lightweight option for shorter walks. Compare it with Northline if carrying comfort is your priority.','Northline, Ridge & River, and Aster Outdoor are useful starting points. Check fit and capacity against the length of your trip.']},
 {responses:['Compare Aster Outdoor and Northline for a compact, lightweight daypack. Pay attention to the empty weight as well as the fit.','Northline and Aster Outdoor offer options worth comparing for short trips. Check pocket layout and how the harness adjusts.','Ridge & River is another option if organization matters more than the lowest weight. Northline is also worth a look.']},
 {responses:['For a rainy commute, compare Ridge & River and Northline. Look for covered zips and check whether the manufacturer describes the fabric as waterproof or water-resistant.','Northline is an option to investigate for wet-weather use. A rain cover can help, but it does not make every opening waterproof.','Compare Ridge & River with Northline and check the warranty and rain-protection details before choosing.']}
];
const brandNames=['Aster Outdoor','Northline','Ridge & River'];
const sources=[
 {name:'Weekend daypack buying guide',type:'Third-party guide',note:'An illustrative independent guide comparing fit, capacity, and weather protection. A source to investigate when checking which information an answer draws on.'},
 {name:'Trail 18 field review',type:'Third-party review',note:'An illustrative product review. Reviews can provide competitor context; inspect the actual cited page before deciding what it means for your brand.'},
 {name:'Aster Outdoor product page',type:'Owned content',note:'An illustrative brand-owned page. Review the information your own site provides about features, use cases, and product comparisons.'}
];
const tools={
 brand:{name:'Brand Analysis',description:'Understand how AI describes your brand and which competitors appear in the same answers.',outputs:['Brand mentions and answer context','Competitor comparisons','Prompt and market context']},
 seo:{name:'SEOMax',description:'Investigate the website issues behind your next technical and content fixes.',outputs:['Website audit findings','Content and technical issues','Prioritized areas to review']},
 content:{name:'IcyQuill',description:'Bring a useful question into your content workflow. Draft, refine, and export your work.',outputs:['Content drafting and refinement','A workspace for your content','Export for the next step']},
 shopping:{name:'AI Shopping',description:'Explore which products appear in AI shopping answers and the context around them.',outputs:['Product discovery context','Products appearing in answers','Shopping-focused research']},
 demand:{name:'Demand Intelligence',description:'Research audience demand and the questions that can guide your next content decision.',outputs:['Audience and topic research','Questions worth investigating','Context for content planning']},
 geo:{name:'GEO Bot',description:'Explore keywords, source signals, and content opportunities for AI discovery.',outputs:['Keyword research','Content opportunities','Research for your next action']}
};
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function setupProductWalkthrough(getMotion){
 const root=document.querySelector('#sample-report'),content=document.querySelector('#report-content');
 let step=0,question=0,answer=0,source=0,frame=0,manualUntil=0,disposed=false;
 const listeners=[];const on=(el,type,fn,options)=>{el.addEventListener(type,fn,options);listeners.push(()=>el.removeEventListener(type,fn,options));};
 const answerMarkup=()=>{
  const text=escape(questions[question].responses[answer]).replaceAll('Aster Outdoor','<mark>Aster Outdoor</mark>');
  const mentioned=questions[question].responses[answer].includes('Aster Outdoor');
  return `<div class="answer-selector" role="tablist" aria-label="Illustrative answers">${[0,1,2].map(i=>`<button role="tab" id="sample-answer-${i}" aria-controls="sample-answer-panel" data-sample-answer="${i}" aria-selected="${i===answer}" tabindex="${i===answer?0:-1}">Answer ${i+1}</button>`).join('')}</div><div class="sample-answer" id="sample-answer-panel" role="tabpanel" aria-labelledby="sample-answer-${answer}"><p>${text}<sup>1, 2</sup></p></div><div class="answer-finding ${mentioned?'is-mentioned':''}"><i></i><span>Aster Outdoor ${mentioned?'is mentioned':'is not mentioned'} in this sample answer.</span></div>`;
 };
 function render(){
  const titles=['Answer explorer','Competitor context','Source investigation','From finding to action'];
  document.querySelector('#report-section-name').textContent=titles[step];document.querySelector('#report-position').textContent=`0${step+1} / 04`;
  if(step===0)content.innerHTML=answerMarkup();
  if(step===1){
   const counts=brandNames.map(name=>questions[question].responses.filter(text=>text.includes(name)).length);
   content.innerHTML=`<div class="comparison-caption">Mentions across these 3 sample answers</div><div class="sample-comparison">${brandNames.map((name,i)=>`<div class="comparison-row ${i===0?'your-brand':''}"><div><strong>${escape(name)}</strong><span>${i===0?'Your example brand':'Example competitor'}</span></div><b>${counts[i]}<small> / 3</small></b><i><em style="width:${counts[i]/3*100}%"></em></i></div>`).join('')}</div><p class="report-insight">${counts[0]===0?'Your example brand is absent from all three responses. Start by inspecting the questions and sources.':'The comparison gives you a starting point. Open the individual answers to understand the context.'}</p>`;
  }
  if(step===2)content.innerHTML=`<p class="source-intro">Inspect a source in this sample report.</p><div class="sample-sources">${sources.map((s,i)=>`<button data-sample-source="${i}" aria-pressed="${i===source}"><span class="source-number">${i+1}</span><span><strong>${s.name}</strong><small>${s.type}</small></span><b>&rarr;</b></button>`).join('')}</div><div class="source-explanation"><span>Illustrative source</span><p>${sources[source].note}</p></div>`;
  if(step===3)content.innerHTML=`<div class="sample-actions"><article><span>Content</span><strong>Answer a missing comparison question.</strong><p>Use IcyQuill to draft and refine useful content.</p></article><article><span>Website health</span><strong>Check the page AI needs to understand.</strong><p>Investigate content and technical issues in SEOMax.</p></article><article><span>Research</span><strong>Explore the next question.</strong><p>Bring another topic into your brand and source research.</p></article></div><a class="report-tool-link" href="#tools">Explore the connected tools <span>&rarr;</span></a>`;
  root.dataset.step=String(step);
  root.querySelectorAll('[data-walk-step]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.walkStep)===step)));
  root.querySelectorAll('[data-walk-chapter]').forEach(a=>a.classList.toggle('is-active',Number(a.dataset.walkChapter)===step));
  if(getMotion())gsap.fromTo(content,{opacity:.35,y:12},{opacity:1,y:0,duration:.35,ease:'power2.out',overwrite:true});else gsap.set(content,{opacity:1,y:0});
 }
 function chooseStep(i,jump=false){if(i<0||i>3)return;const changed=i!==step;step=i;if(changed)render();if(jump&&innerWidth>900){manualUntil=performance.now()+900;document.querySelector(`#walk-step-${i}`).scrollIntoView({behavior:getMotion()?'smooth':'instant',block:'center'});}}
 root.querySelectorAll('[data-walk-step]').forEach(b=>on(b,'click',()=>chooseStep(Number(b.dataset.walkStep),true)));
 on(document.querySelector('#sample-question'),'change',e=>{question=Number(e.target.value);answer=0;render();});
 on(content,'click',e=>{
  const a=e.target.closest('[data-sample-answer]'),s=e.target.closest('[data-sample-source]');
  if(a){answer=Number(a.dataset.sampleAnswer);render();content.querySelector(`[data-sample-answer="${answer}"]`).focus({preventScroll:true});}
  if(s){source=Number(s.dataset.sampleSource);render();content.querySelector(`[data-sample-source="${source}"]`).focus({preventScroll:true});}
 });
 function arrowKeys(container,selector,activate){on(container,'keydown',e=>{const list=[...container.querySelectorAll(selector)],i=list.indexOf(document.activeElement);if(i<0||!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?list.length-1:(i+(['ArrowRight','ArrowDown'].includes(e.key)?1:-1)+list.length)%list.length;activate(list[next]);list[next]?.focus({preventScroll:true});});}
 arrowKeys(root.querySelector('.walkthrough-progress'),'[data-walk-step]',b=>chooseStep(Number(b.dataset.walkStep),true));
 on(content,'keydown',e=>{const list=[...content.querySelectorAll('[data-sample-answer]')],i=list.indexOf(document.activeElement);if(i<0||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();answer=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:-1)+3)%3;render();content.querySelector(`[data-sample-answer="${answer}"]`).focus({preventScroll:true});});
 function readScroll(){frame=0;if(disposed||innerWidth<=900||performance.now()<manualUntil)return;const rect=root.getBoundingClientRect();if(rect.top>innerHeight||rect.bottom<0)return;let next=0;root.querySelectorAll('[data-walk-chapter]').forEach(a=>{if(a.getBoundingClientRect().top<innerHeight*.53)next=Number(a.dataset.walkChapter);});chooseStep(next);}
 const scroll=()=>{if(!frame)frame=requestAnimationFrame(readScroll);};on(window,'scroll',scroll,{passive:true});on(window,'resize',scroll);
 function chooseTool(key){const tool=tools[key];if(!tool)return;document.querySelectorAll('[data-workspace]').forEach(b=>{const active=b.dataset.workspace===key;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});const panel=document.querySelector('#workspace-panel');panel.setAttribute('aria-labelledby',`workspace-tab-${key}`);panel.dataset.tool=key;document.querySelector('#workspace-title').textContent=tool.name;document.querySelector('#workspace-description').textContent=tool.description;document.querySelector('#workspace-outputs').innerHTML=tool.outputs.map(s=>`<li>${s}</li>`).join('');document.querySelector('#workspace-demo').dataset.contact=tool.name+' demo';if(getMotion())gsap.fromTo(panel.querySelector('div:last-child'),{opacity:.4,y:10},{opacity:1,y:0,duration:.3,overwrite:true});}
 const tabs=document.querySelector('.workspace-tabs');tabs.querySelectorAll('[data-workspace]').forEach(b=>on(b,'click',()=>chooseTool(b.dataset.workspace)));arrowKeys(tabs,'[data-workspace]',b=>chooseTool(b.dataset.workspace));
 render();return {refresh:scroll,dispose(){disposed=true;cancelAnimationFrame(frame);listeners.forEach(fn=>fn());gsap.killTweensOf(content);}};
}

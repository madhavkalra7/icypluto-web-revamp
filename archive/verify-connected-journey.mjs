import puppeteer from 'file:///C:/Users/madha/AppData/Roaming/npm/node_modules/lighthouse/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const browser=await puppeteer.launch({executablePath:'C:/Users/madha/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results=[];
try{for(const [width,theme] of [[1440,'dark'],[390,'light'],[820,'dark'],[320,'light']]){
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewport({width,height:900});await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 await page.evaluateOnNewDocument(t=>localStorage.setItem('icypluto-theme',t),theme);
 await page.goto('http://localhost:5173/',{waitUntil:'networkidle0'});await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(()=>document.querySelector('[data-hero-step="2"]').click());
 await page.waitForFunction(()=>document.querySelector('.pluto-hero').dataset.heroStage==='2'&&document.querySelector('.pluto-hero').dataset.heroTransition==='settled');
 const checks=await page.evaluate(()=>{
  const assert=(v,m)=>{if(!v)throw Error(m);};
  document.querySelector('[data-answer="1"]').click();assert(document.querySelector('#sample-verdict').textContent.includes('missing'),'model answer');
  document.querySelector('[data-answer="0"]').click();
  document.querySelector('[data-gap="2"]').click();assert(document.querySelector('#gap-advice').textContent.includes('care guide'),'opportunity');
  document.querySelector('[data-audit="2"]').click();assert(document.querySelector('#audit-issue').textContent.includes('indexing'),'audit');
  document.querySelector('[data-action-step="3"]').click();assert(document.querySelector('#action-detail-title').textContent.includes('Track'),'action');
  document.querySelector('.workflow-next').click();assert(document.querySelector('[data-action-step="0"]').getAttribute('aria-pressed')==='true','replay');
  const sections=[...document.querySelectorAll('.capability-worlds > section')].map(el=>el.id);
  assert(sections.join(',')==='capability-aeo,capability-geo,capability-seo','fixed chapter order');
  const broken=[...document.querySelectorAll('a[href^="#"]')].filter(a=>a.hash.length>1&&!document.getElementById(a.hash.slice(1))).map(a=>a.hash);
  return {theme:document.documentElement.dataset.theme,overflow:document.documentElement.scrollWidth>innerWidth,sections,broken};
 });
 if(checks.overflow||checks.broken.length||errors.length)throw Error(JSON.stringify({width,checks,errors}));
 await page.evaluate(()=>document.querySelector('#capability-aeo').scrollIntoView({behavior:'instant'}));
 await page.screenshot({path:`archive/journey-${width}-${theme}-visibility.png`});
 if(width===1440){await page.evaluate(()=>document.querySelector('#product-action').scrollIntoView({behavior:'instant'}));await page.screenshot({path:'archive/journey-desktop-action.png'});}
 results.push({width,...checks,errors});console.log(JSON.stringify(results.at(-1)));await page.close();
}}finally{await browser.close();}

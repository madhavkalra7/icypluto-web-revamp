import puppeteer from 'file:///C:/Users/madha/AppData/Roaming/npm/node_modules/lighthouse/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';
const b=await puppeteer.launch({executablePath:'C:/Users/madha/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
try {
 for(const width of [1440,390]){
  const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});await p.setViewport({width,height:width===390?844:900});await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await p.evaluateOnNewDocument(()=>{window.__worldDraws=0;const proto=WebGL2RenderingContext.prototype,original=proto.drawElements;proto.drawElements=function(...args){if(this.canvas.classList.contains('world-canvas'))window.__worldDraws++;return original.apply(this,args)}});
  await p.goto('http://localhost:5173/',{waitUntil:'networkidle0'});await p.evaluate(()=>document.fonts.ready);
  assert.equal(await p.$$eval('.pluto-world',es=>es.length),1);assert.equal(await p.$$eval('.world-canvas',es=>es.length),1);assert.equal(await p.$$eval('img[src$="discovery-probe.webp"],img[src$="discovery-shard.webp"]',es=>es.length),0);
  const startDraws=await p.evaluate(()=>window.__worldDraws);await pause(250);assert.equal(await p.evaluate(()=>window.__worldDraws),startDraws,'World does not draw under the initial hero');
  await p.click('[data-hero-step="1"]');await p.waitForFunction(()=>!document.querySelector('.ph-capability-panel').hidden);await p.focus('[data-hero-site="2"]');assert.equal(await p.$eval('.capability-worlds > section',e=>e.dataset.world),'seo');
  for(const mode of ['seo','aeo','geo']){
   await p.$eval('#what-is-icypluto',e=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY-90,behavior:'instant'}));await p.click(`[data-discovery="${mode}"]`);
   await p.waitForFunction(mode=>document.body.dataset.worldScene===mode,{timeout:15000},mode);
   assert.equal(await p.$eval('.capability-worlds > section',e=>e.dataset.world),mode);assert.equal(await p.$eval('[data-hero-site].on',e=>e.dataset.heroSite),String({aeo:0,geo:1,seo:2}[mode]));
   assert.equal(await p.$eval('#tool-title',e=>e.textContent),mode==='seo'?'SEOMax':mode==='geo'?'GEO Bot':'Brand Analysis');
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth),width);
   await p.screenshot({path:`archive/world-verified-${width}-${mode}.png`});
  }
  for(const key of ['seo','aeo','geo','tools','framework','launch','collective','questions','contact','framework','aeo']){
   await p.$eval(`[data-world="${key}"]`,e=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY-90,behavior:'instant'}));await p.waitForFunction(key=>document.body.dataset.worldScene===key,{timeout:15000},key);
   assert.equal(await p.$eval('.pluto-world',e=>e.dataset.ready),'true');
  }
  for(const selector of ['.tool-universe','.framework','.launch-sequence','.collective','.product-faq','.contact-chapter'])assert.equal(await p.$eval(selector,e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');
  await p.$eval('#capability-seo',e=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY-90,behavior:'instant'}));await p.click('[data-audit="2"]');assert.match(await p.$eval('.audit-explanation',e=>e.textContent),/technical/);assert.equal(await p.$eval('[data-audit="2"]',e=>e.getAttribute('aria-pressed')),'true');
  await p.click('#capability-seo [data-contact]');assert.equal(await p.$eval('#contact-dialog',e=>e.open),true);await p.click('#contact-dialog .dialog-close');
  await p.$eval('#framework',e=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY-90,behavior:'instant'}));await pause(300);let before=await p.evaluate(()=>window.__worldDraws);await pause(350);assert.equal(await p.evaluate(()=>window.__worldDraws),before,'Reduced motion stops idle world rendering');
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]);await pause(900);assert.ok(await p.evaluate(()=>window.__worldDraws)>before,'Animated world resumes');
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await p.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await pause(200);before=await p.evaluate(()=>window.__worldDraws);await pause(300);assert.equal(await p.evaluate(()=>window.__worldDraws),before);
  assert.deepEqual(errors,[]);console.log(`PASS ${width}: one persistent world, distinct objects, hero sync and order, all forward/reverse scenes, transparent backgrounds, audit control, demo, reduced motion, hidden-render pause, no browser errors or overflow`);await p.close();
 }
 const p=await b.newPage();await p.setViewport({width:390,height:844});await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await p.evaluateOnNewDocument(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type==='webgl'||type==='webgl2')return null;return original.call(this,type,...args)}});await p.goto('http://localhost:5173/',{waitUntil:'networkidle0'});await p.$eval('#capability-geo',e=>e.scrollIntoView());assert.equal(await p.$eval('.pluto-world',e=>e.classList.contains('world-fallback')),true);assert.match(await p.$eval('#geo-title',e=>e.textContent),/source story/);console.log('PASS WebGL-disabled landscape and readable-content fallback');await p.close();
}finally{await b.close()}

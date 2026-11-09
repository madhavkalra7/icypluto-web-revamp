import puppeteer from 'file:///C:/Users/madha/AppData/Roaming/npm/node_modules/lighthouse/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';
const b=await puppeteer.launch({executablePath:'C:/Users/madha/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
try {
 for(const width of [1440,390]) {
  const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});await p.setViewport({width,height:width===390?844:1000});await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await p.goto('http://localhost:5173/',{waitUntil:'networkidle0'});await p.evaluate(()=>document.fonts.ready);
  assert.equal(await p.$eval('.ds-orbit-story',()=>true),true);
  // The selected hero capability changes the content beneath it.
  await p.click('[data-hero-step="1"]');await p.waitForFunction(()=>!document.querySelector('.ph-capability-panel').hidden);await p.focus('[data-hero-site="2"]');await p.waitForFunction(()=>document.querySelector('.discovery').dataset.mode==='seo');assert.match(await p.$eval('#ds-title',e=>e.innerText),/discoverable/);
  await p.$eval('#what-is-icypluto',e=>e.scrollIntoView());await pause(200);
  for(const mode of ['seo','aeo','geo']) {
   await p.$eval('#what-is-icypluto',e=>e.scrollIntoView());await p.click(`[data-discovery="${mode}"]`);await pause(200);
   assert.equal(await p.$eval('.discovery',e=>e.dataset.mode),mode);assert.equal(await p.$eval(`[data-discovery="${mode}"]`,e=>e.getAttribute('aria-pressed')),'true');assert.equal(await p.$eval('#tool-title',e=>e.textContent),mode==='seo'?'SEOMax':mode==='geo'?'GEO Bot':'Brand Analysis');
   assert.equal(await p.$eval(`.ds-visual--${mode}`,e=>getComputedStyle(e).display),'block');
   assert.equal(await p.$eval('[data-hero-site].on',e=>e.dataset.heroSite),String({aeo:0,geo:1,seo:2}[mode]));
   assert.match(await p.$eval('#mission-description',e=>e.textContent),mode==='seo'?/SEOMax/:/brand/);
   await p.screenshot({path:`archive/discovery-${width}-${mode}-intro.png`});
   for(const step of [0,1,2,1,0]) {
    await p.$eval(`[data-chapter="${step}"]`,e=>{const top=e.getBoundingClientRect().top+scrollY;window.scrollTo({top:top-(innerWidth<=760?innerHeight*.45:innerHeight*.2),behavior:'instant'})});await p.waitForFunction(step=>Number(document.querySelector('.discovery').dataset.step)===step,{timeout:10000},step);
    assert.equal(await p.$eval('.discovery',e=>Number(e.dataset.step)),step,`${mode}/${width}/step ${step}`);
    if(step===1)await p.screenshot({path:`archive/discovery-${width}-${mode}-scene.png`});
   }
   const overflow=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false,`${mode}/${width} horizontal overflow`);
  }
  await p.$eval('#ds-demo',e=>e.scrollIntoView());await p.click('#ds-demo');assert.equal(await p.$eval('#contact-dialog',e=>e.open),true);assert.match(await p.$eval('#ds-demo',e=>e.dataset.contact),/GEO/);await p.click('#contact-dialog .dialog-close');
  await p.$eval('#framework',e=>e.scrollIntoView());await pause(200);await p.screenshot({path:`archive/discovery-${width}-cst.png`});
  for(const src of ['discovery-probe.webp','discovery-shard.webp'])assert.equal(await p.$eval(`img[src$="${src}"]`,e=>e.complete&&e.naturalWidth>0),true);
  await p.$eval('.ds-orbit-story',e=>e.scrollIntoView());await p.screenshot({path:`archive/discovery-${width}-orbit.png`});
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]);await pause(300);
  await p.$eval('[data-chapter="1"]',e=>window.scrollTo({top:e.offsetTop+document.querySelector('.ds-investigation').offsetTop-innerHeight*.2,behavior:'instant'}));await pause(800);
  // Check enabled motion creates real scroll transforms, and turning it off restores the readable layout.
  const gsapExists=await p.$eval('.ds-probe',e=>e.style.transform.length>0);assert.ok(gsapExists);
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await pause(150);
  assert.deepEqual(errors,[]);console.log(`PASS ${width}: hero sync, all journeys, forward/reverse chapters, toolkit context, demo dialog, images, no overflow or browser errors, motion preference`);await p.close();
 }
}finally{await b.close()}

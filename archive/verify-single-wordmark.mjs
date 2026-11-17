import puppeteer from 'file:///C:/Users/madha/AppData/Roaming/npm/node_modules/lighthouse/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';
const b=await puppeteer.launch({executablePath:'C:/Users/madha/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{for(const [width,theme] of [[1440,'dark'],[390,'light']]){
const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.setViewport({width,height:900});await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await p.evaluateOnNewDocument(t=>localStorage.setItem('icypluto-theme',t),theme);await p.goto('http://localhost:5173/',{waitUntil:'networkidle0'});
await p.evaluate(()=>{window.actualWordmark=document.querySelector('.ph-destination-word');document.querySelector('[data-hero-step="2"]').click();});
await p.waitForFunction(()=>document.querySelector('.pluto-hero').dataset.heroStage==='2'&&document.querySelector('.pluto-hero').dataset.heroTransition==='settled');
assert.equal(await p.$('.ph-booking'),null);assert.equal(await p.$('.ph-brand-flight'),null);
await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]);await p.waitForFunction(()=>!document.body.classList.contains('motion-off'));
for(const fraction of [.02,.15,.5,.85,1.05]){
 await p.evaluate(f=>window.scrollTo({top:Math.min(document.querySelector('.pluto-hero').clientHeight*.38,360)*f,behavior:'instant'}),fraction);
 await p.waitForFunction(f=>document.querySelector('.pluto-hero').dataset.brandHandoff===(f>=1?'navbar':'transit'),{},fraction);
 const state=await p.evaluate(()=>({same:window.actualWordmark===document.querySelector('.ph-destination-word'),count:document.querySelectorAll('.ph-destination-word').length,opacity:getComputedStyle(window.actualWordmark).opacity,parent:window.actualWordmark.parentElement.className,overflow:document.documentElement.scrollWidth>innerWidth}));
 assert.equal(state.same,true);assert.equal(state.count,1);assert.equal(state.opacity,'1');assert.equal(state.overflow,false);
 if(fraction===.15)await p.screenshot({path:`archive/single-wordmark-${width}-flight.png`});
}
assert.equal(await p.evaluate(()=>window.actualWordmark.parentElement.classList.contains('brand-wordmark')),true);
await p.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await p.waitForFunction(()=>document.querySelector('.pluto-hero').dataset.brandHandoff==='landscape');assert.equal(await p.evaluate(()=>document.querySelector('.ph-destination strong').firstElementChild===window.actualWordmark),true);
await p.screenshot({path:`archive/single-wordmark-${width}-landscape.png`});
await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await p.evaluate(()=>window.scrollTo({top:400,behavior:'instant'}));await p.waitForFunction(()=>document.querySelector('.pluto-hero').dataset.brandHandoff==='navbar');assert.deepEqual(errors,[]);
console.log('PASS',width,theme,'same actual node at every position, no fade, no clone, navbar docking, reverse, reduced motion; form removed');await p.close();
}}finally{await b.close()}

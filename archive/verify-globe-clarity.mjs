import puppeteer from 'file:///C:/Users/madha/AppData/Roaming/npm/node_modules/lighthouse/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';
const browser=await puppeteer.launch({executablePath:'C:/Users/madha/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
for(const fallback of [false,true]){
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});await page.setViewport({width:fallback?390:1440,height:fallback?844:900});await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 await page.evaluateOnNewDocument(fallback=>{window.__textureReady=false;window.__glDraws=0;window.__textureSize=[];
 if(fallback)window.Worker=undefined;else{const Native=Worker;window.Worker=class extends Native{constructor(...args){super(...args);this.addEventListener('message',e=>{if(e.data.bitmap){window.__textureSize=[e.data.bitmap.width,e.data.bitmap.height];window.__textureReady=true;}});}};}
 const proto=WebGL2RenderingContext.prototype,draw=proto.drawElements,upload=proto.texSubImage2D;
 proto.drawElements=function(...args){if(this.canvas.classList.contains('ph-gl'))window.__glDraws++;return draw.apply(this,args)};
 proto.texSubImage2D=function(...args){if(this.canvas.classList.contains('ph-gl')){const source=args.find(a=>a instanceof HTMLCanvasElement);if(source&&source.width>=2000){window.__textureSize=[source.width,source.height];window.__textureReady=true;}}return upload.apply(this,args)};
 },fallback);
 await page.goto('http://localhost:5173/',{waitUntil:'networkidle0'});await page.waitForFunction(()=>window.__textureReady,{timeout:60000});await page.evaluate(()=>document.fonts.ready);
 const dimensions=await page.evaluate(()=>window.__textureSize);assert.deepEqual(dimensions,fallback?[2048,1024]:[4096,2048]);assert.equal(await page.$eval('.pluto-hero',e=>e.classList.contains('ph-no-webgl')),false);
 await page.click('[data-hero-step="1"]');await page.waitForFunction(()=>!document.querySelector('.ph-capability-panel').hidden);await page.hover('[data-hero-site="0"]');await new Promise(r=>setTimeout(r,250));await page.screenshot({path:`archive/hero-verification/${fallback?'mobile-fallback-2k':'desktop-worker-4k'}-pluto.png`});
 for(let i=0;i<3;i++){await page.focus(`[data-hero-site="${i}"]`);assert.equal(await page.$eval('.ph-preview-title',e=>e.textContent),['AEO','GEO','SEO'][i]);}
 await page.click('.ph-explore');await page.waitForFunction(()=>!document.querySelector('.ph-booking').hidden);assert.ok(await page.$eval('.ph-next',e=>e.textContent.includes('Explore the platform')));
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]);await new Promise(r=>setTimeout(r,200));
 const initial=await page.evaluate(()=>window.__glDraws);const churn=await page.evaluate(async()=>{let mutations=0;const observer=new MutationObserver(records=>mutations+=records.filter(r=>r.type==='childList').length);observer.observe(document.querySelector('.ph-next'),{childList:true,subtree:true});await new Promise(r=>setTimeout(r,800));observer.disconnect();return mutations;});assert.equal(churn,0);assert.equal(await page.evaluate(()=>window.__glDraws),initial,'No hidden globe draws on landing');
 assert.equal(await page.$eval('.pluto-hero',e=>e.classList.contains('ph-on-surface')),true);
 await page.click('.ph-back');await page.waitForFunction(()=>document.querySelector('[data-hero-step="1"]').hasAttribute('aria-current'));await new Promise(r=>setTimeout(r,2600));assert.ok(await page.evaluate(()=>window.__glDraws)>initial,'Globe resumes when going back');
 assert.deepEqual(errors,[]);console.log('PASS',fallback?'2K main-thread fallback/mobile':'4K worker/desktop','texture upload, capability controls, landing labels, no hidden draws or DOM rebuilding, reverse transition');await page.close();
}
}finally{await browser.close()}

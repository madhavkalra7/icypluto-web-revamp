import puppeteer from 'file:///C:/Users/madha/AppData/Roaming/npm/node_modules/lighthouse/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';
const browser=await puppeteer.launch({executablePath:'C:/Users/madha/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
for(const[name,width,height]of[['desktop',1440,900],['mobile',390,844],['small-mobile',320,760]]){
await page.setViewport({width,height});await page.goto('http://localhost:5173/',{waitUntil:'networkidle0'});await page.evaluate(async()=>{scrollTo(0,0);await document.fonts.ready});await page.click('[data-hero-step="1"]');await page.waitForFunction(()=>!document.querySelector('.ph-capability-panel').hidden);
for(let i=0;i<3;i++){
 if(width>760)await page.hover(`[data-hero-site="${i}"]`);else await page.click(`[data-hero-site="${i}"]`);
 assert.equal(await page.$eval('.ph-preview',e=>e.dataset.kind),String(i));assert.equal(await page.$eval('[data-hero-step="1"]',e=>e.hasAttribute('aria-current')),true);
 await page.screenshot({path:`archive/hero-verification/${name}-capability-${i}.png`});
 const fit=await page.evaluate(()=>{const card=document.querySelector('.ph-preview').getBoundingClientRect(),cta=document.querySelector('.ph-controls').getBoundingClientRect();return{card:card.toJSON(),cta:cta.toJSON(),overflow:document.documentElement.scrollWidth>innerWidth}});assert.equal(fit.overflow,false);assert.ok(fit.card.left>=0&&fit.card.right<=width);assert.ok(fit.card.bottom<fit.cta.top,'Card must clear navigation controls');
}
await page.click('.ph-explore');await page.waitForFunction(()=>!document.querySelector('.ph-booking').hidden);assert.equal(await page.$eval('[name="hero-focus"]',e=>e.value),'2');console.log('PASS',name,'all capability cards, navigation clearance, selection and landing');
}
assert.deepEqual(errors,[]);console.log('PASS no page errors');
}finally{await browser.close()}

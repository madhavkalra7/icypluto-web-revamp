import puppeteer from 'file:///C:/Users/madha/AppData/Roaming/npm/node_modules/lighthouse/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';
const browser=await puppeteer.launch({executablePath:'C:/Users/madha/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
for(const[name,width,height]of[['desktop',1440,900],['mobile',390,844],['small-mobile',320,760]]){
await page.setViewport({width,height});await page.goto('http://localhost:5173/',{waitUntil:'networkidle0'});await page.evaluate(()=>scrollTo(0,0));await page.click('[data-hero-step="1"]');await page.waitForFunction(()=>!document.querySelector('.ph-capability-panel').hidden);
for(let i=0;i<3;i++){await page.hover(`[data-hero-site="${i}"]`);assert.equal(await page.$eval('.ph-preview-title',e=>e.textContent),['AEO','GEO','SEO'][i]);const rect=await page.$eval('.ph-preview',e=>e.getBoundingClientRect().toJSON());assert.ok(rect.height<=(width>760?260:225));assert.ok(rect.left>=0&&rect.right<=width);}
await page.screenshot({path:`archive/hero-verification/${name}-short-original-cards.png`});await page.click('.ph-explore');await page.waitForFunction(()=>!document.querySelector('.ph-booking').hidden);assert.equal(await page.$eval('[name="hero-focus"]',e=>e.value),'2');console.log('PASS',name,'short original cards and explore action');
}assert.deepEqual(errors,[]);
}finally{await browser.close()}

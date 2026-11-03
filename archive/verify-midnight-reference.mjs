import puppeteer from 'file:///C:/Users/madha/AppData/Roaming/npm/node_modules/lighthouse/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
for(const name of ['pluto-landing.webp','pluto-foreground.webp'])assert.ok((await fs.readFile('public/assets/'+name)).equals(await fs.readFile('archive/pre-logo-purple-landscape/public/assets/'+name)));
const browser=await puppeteer.launch({executablePath:'C:/Users/madha/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
for(const[name,width,height]of[['desktop',1440,900],['mobile',390,844],['small-mobile',320,760]]){
await page.setViewport({width,height});await page.goto('http://localhost:5173/',{waitUntil:'networkidle0'});await page.evaluate(async()=>{scrollTo(0,0);await document.fonts.ready});await new Promise(r=>setTimeout(r,250));
assert.equal(await page.$eval('.ph-icy',e=>e.textContent),'Icy');assert.equal(await page.$eval('.ph-pluto-letters',e=>e.textContent),'PLUT');assert.equal(await page.$eval('.ph-word',e=>e.getAttribute('aria-label')),'IcyPluto');
const geometry=await page.evaluate(()=>({word:document.querySelector('.ph-pluto-letters').getBoundingClientRect().toJSON(),orbit:document.querySelector('.ph-orbit').getBoundingClientRect().toJSON(),overflow:document.documentElement.scrollWidth>innerWidth}));assert.equal(geometry.overflow,false);assert.ok(geometry.word.left>=0&&geometry.word.right<=width);console.log(name,geometry.word);
await page.screenshot({path:`archive/hero-verification/${name}-midnight-reference-hero.png`});
await page.mouse.move(width*.45,height*.7);await page.mouse.wheel({deltaY:120});await page.waitForFunction(()=>!document.querySelector('.ph-capability-panel').hidden);await page.screenshot({path:`archive/hero-verification/${name}-reference-capabilities.png`});
await page.click('.ph-explore');await page.waitForFunction(()=>!document.querySelector('.ph-booking').hidden);
assert.equal(await page.$eval('.ph-ridge',e=>+getComputedStyle(e).zIndex),10);await page.screenshot({path:`archive/hero-verification/${name}-restored-hills-depth.png`});console.log('PASS',name,'reference composition, scroll exploration, landing and restored terrain');
}
assert.deepEqual(errors,[]);console.log('PASS no page/shader errors');
}finally{await browser.close()}

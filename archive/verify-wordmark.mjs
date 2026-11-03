import puppeteer from 'file:///C:/Users/madha/AppData/Roaming/npm/node_modules/lighthouse/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';
const browser=await puppeteer.launch({executablePath:'C:/Users/madha/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844],['small-mobile',320,760]]){
 await page.setViewport({width,height});await page.goto('http://localhost:5173/',{waitUntil:'networkidle0'});await page.evaluate(async()=>{scrollTo(0,0);await document.fonts.ready;});await new Promise(r=>setTimeout(r,350));
 const result=await page.evaluate(()=>{const e=document.querySelector('.ph-pluto-letters'),box=e.getBoundingClientRect(),style=getComputedStyle(e);return {left:box.left,right:box.right,viewport:innerWidth,clip:style.clipPath,stroke:style.webkitTextStrokeWidth,brand:document.querySelector('.site-header .brand').textContent,overflow:document.documentElement.scrollWidth>innerWidth}});
 console.log(name,result);assert.equal(result.clip,'none');assert.ok(result.right<width&&result.left>=0);assert.equal(result.overflow,false);assert.equal(result.brand,'Icypluto');assert.ok(parseFloat(result.stroke)>=1);
 await page.screenshot({path:`archive/hero-verification/${name}-outline-wordmark.png`});
}
await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]);await new Promise(r=>setTimeout(r,1600));
const a=await page.$eval('.ph-pluto-letters',e=>getComputedStyle(e).backgroundPosition);await new Promise(r=>setTimeout(r,600));const b=await page.$eval('.ph-pluto-letters',e=>getComputedStyle(e).backgroundPosition);assert.notEqual(a,b);assert.equal(await page.$eval('.ph-pluto-letters',e=>getComputedStyle(e).animationIterationCount),'infinite');
assert.deepEqual(errors,[]);console.log('PASS responsive unclipped outlined wordmark, brand capitalization, looping shimmer, reduced motion');
}finally{await browser.close()}

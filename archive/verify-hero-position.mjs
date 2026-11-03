import puppeteer from 'file:///C:/Users/madha/AppData/Roaming/npm/node_modules/lighthouse/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';
import {heroFrame} from '../src/pluto-hero-state.js';
const desktop=heroFrame({state:0,width:1440,height:900,age:5,motion:false});assert.ok(desktop.radius>270);assert.ok(desktop.cy>450);assert.ok(desktop.cy+desktop.radius<900);
const browser=await puppeteer.launch({executablePath:'C:/Users/madha/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
for(const[name,width,height]of[['desktop',1440,900],['mobile',390,844]]){
await page.setViewport({width,height});await page.goto('http://localhost:5173/',{waitUntil:'networkidle0'});await page.evaluate(async()=>{scrollTo(0,0);await document.fonts.ready});await new Promise(r=>setTimeout(r,250));
assert.equal(await page.$eval('.water-nav',e=>e.dataset.highlight),'off');await page.click('[data-nav-trigger="2"]');assert.equal(await page.$eval('.water-nav',e=>e.dataset.highlight),'on');assert.equal(await page.$eval('#nav-panel-2',e=>e.hidden),false);
await page.mouse.click(width*.1,height*.78);assert.equal(await page.$eval('.water-nav',e=>e.dataset.highlight),'off');assert.equal(await page.$eval('#nav-panel-2',e=>e.hidden),true);assert.equal(await page.$eval('.water-drop',e=>getComputedStyle(e).opacity),'0');assert.equal(await page.$eval('.water-canvas',e=>getComputedStyle(e).opacity),'0');
const text=await page.$eval('.ph-word',e=>e.getBoundingClientRect().toJSON());assert.ok(text.left>=0&&text.right<=width);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
await page.screenshot({path:`archive/hero-verification/${name}-larger-lower-hero.png`});
await page.hover('[data-nav-trigger="0"]');assert.equal(await page.$eval('.water-nav',e=>e.dataset.highlight),'on');
console.log('PASS',name,'outside dismissal, reactivation, larger/lower composition, no clipping');
}
assert.deepEqual(errors,[]);console.log('PASS no page errors');
}finally{await browser.close()}

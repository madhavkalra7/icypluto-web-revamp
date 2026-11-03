import puppeteer from 'file:///C:/Users/madha/AppData/Roaming/npm/node_modules/lighthouse/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';
const browser=await puppeteer.launch({executablePath:'C:/Users/madha/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});await page.setViewport({width:1440,height:900});await page.goto('http://localhost:5173/',{waitUntil:'domcontentloaded'});
await page.waitForSelector('.ph-word[style]');await new Promise(r=>setTimeout(r,200));
await page.screenshot({path:'archive/hero-verification/icy-intro.png'});
await new Promise(r=>setTimeout(r,3800));await page.screenshot({path:'archive/hero-verification/icypluto-globe.png'});
assert.equal(await page.$eval('.ph-word',e=>e.getAttribute('aria-label')),'IcyPluto');assert.equal(await page.$$eval('[data-globe-site]',e=>e.length),3);
const before=await page.$eval('[data-globe-site="0"]',e=>e.style.transform);await new Promise(r=>setTimeout(r,1500));const after=await page.$eval('[data-globe-site="0"]',e=>e.style.transform);assert.notEqual(before,after,'Idle rotation must move surface markers');
for(let i=0;i<3;i++){await page.mouse.move(720,450);await page.mouse.down();await page.mouse.move(1320,460,{steps:12});await page.mouse.up();}
await page.screenshot({path:'archive/hero-verification/globe-drag-rotation.png'});
await page.click('[data-hero-step="1"]');await new Promise(r=>setTimeout(r,1800));await page.hover('[data-hero-site="1"]');assert.equal(await page.$eval('.ph-preview-title',e=>e.textContent),'GEO');await page.click('[data-hero-site="1"]');await page.waitForFunction(()=>!document.querySelector('.ph-booking').hidden);await new Promise(r=>setTimeout(r,700));
await page.screenshot({path:'archive/hero-verification/purple-ridge-desktop.png'});
await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await page.setViewport({width:390,height:844});await page.reload({waitUntil:'networkidle0'});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'archive/hero-verification/icypluto-mobile.png'});
console.log('Reduced-motion pins',await page.$$eval('[data-globe-site]',els=>els.map(e=>({label:e.textContent,opacity:e.style.opacity}))));
assert.ok(await page.$$eval('[data-globe-site]',els=>els.every(e=>Number(e.style.opacity)>.5)),'Three initial markers visible with reduced motion');
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
await page.click('[data-globe-site="1"]');await page.waitForFunction(()=>!document.querySelector('.ph-capability-panel').hidden);assert.equal(await page.$eval('.ph-preview-title',e=>e.textContent),'GEO');await page.click('.ph-explore');await page.waitForFunction(()=>!document.querySelector('.ph-booking').hidden);await page.screenshot({path:'archive/hero-verification/purple-ridge-mobile.png'});
console.log('Errors',errors);assert.equal(errors.length,0);console.log('PASS intro, full wordmark, rotation, three markers, dragging, GEO transition, ridge, mobile, reduced motion');
}finally{await browser.close()}

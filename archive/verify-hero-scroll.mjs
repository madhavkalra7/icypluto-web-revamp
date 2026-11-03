import puppeteer from 'file:///C:/Users/madha/AppData/Roaming/npm/node_modules/lighthouse/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';
const browser=await puppeteer.launch({executablePath:'C:/Users/madha/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
const reset=async(width=1440,height=900)=>{await page.setViewport({width,height});await page.goto('http://localhost:5173/',{waitUntil:'networkidle0'});await page.evaluate(()=>scrollTo(0,0));await page.waitForSelector('.ph-word[style]')};
const stage=()=>page.$eval('[aria-current="step"]',e=>e.dataset.heroStep);
await reset();await page.mouse.move(700,45);await page.mouse.wheel({deltaY:100});await page.waitForFunction(()=>document.querySelector('[data-hero-step="1"]').hasAttribute('aria-current'));assert.equal(await page.evaluate(()=>scrollY),0);console.log('PASS wheel over header opens AI visibility');
await new Promise(r=>setTimeout(r,300));await page.mouse.wheel({deltaY:150});await page.waitForFunction(()=>!document.querySelector('.ph-booking').hidden);await new Promise(r=>setTimeout(r,300));await page.mouse.wheel({deltaY:500});await page.waitForFunction(()=>scrollY>0);console.log('PASS subsequent stage and normal page scrolling');
await reset(1440,600);await page.mouse.move(600,300);await page.mouse.wheel({deltaY:120});await page.waitForFunction(()=>document.querySelector('[data-hero-step="1"]').hasAttribute('aria-current'));console.log('PASS short viewport');
await reset();await page.keyboard.press('PageDown');await page.waitForFunction(()=>document.querySelector('[data-hero-step="1"]').hasAttribute('aria-current'));console.log('PASS keyboard');
await reset();await page.click('.ph-skip');await page.waitForFunction(()=>scrollY>500);assert.equal(await stage(),'0');console.log('PASS explicit skip link');
await reset(390,844);await page.evaluate(()=>{const root=document.querySelector('.pluto-hero');const touch=y=>new Touch({identifier:1,target:root,clientX:200,clientY:y});root.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[touch(600)],cancelable:true}));root.dispatchEvent(new TouchEvent('touchmove',{bubbles:true,touches:[touch(450)],cancelable:true}));root.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[],cancelable:true}));});await page.waitForFunction(()=>document.querySelector('[data-hero-step="1"]').hasAttribute('aria-current'));console.log('PASS mobile swipe');
assert.deepEqual(errors,[]);console.log('PASS no page errors');
}finally{await browser.close()}

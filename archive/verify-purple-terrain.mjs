import puppeteer from 'file:///C:/Users/madha/AppData/Roaming/npm/node_modules/lighthouse/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
assert.equal(await fs.readFile('src/pluto-hero.js','utf8'),await fs.readFile('archive/pre-logo-purple-landscape/src/pluto-hero.js','utf8'),'Preserve camera, heading placement and parallax logic');
const browser=await puppeteer.launch({executablePath:'C:/Users/madha/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
for(const[name,width,height]of[['desktop',1440,900],['mobile',390,844]]){
 await page.setViewport({width,height});await page.goto('http://localhost:5173/',{waitUntil:'networkidle0'});await page.evaluate(async()=>{scrollTo(0,0);await document.fonts.ready});await new Promise(r=>setTimeout(r,200));
 assert.equal(await page.$eval('.pluto-hero',e=>getComputedStyle(e).backgroundColor),'rgb(93, 23, 235)');assert.notEqual(await page.$eval('.ph-sky',e=>getComputedStyle(e,'::after').backgroundImage),'none');
 await page.screenshot({path:`archive/hero-verification/${name}-logo-purple-hero.png`});
 await page.click('[data-hero-step="2"]');await page.waitForFunction(()=>!document.querySelector('.ph-booking').hidden);
 const layers=await page.evaluate(()=>({heading:+getComputedStyle(document.querySelector('.ph-destination')).zIndex,ridge:+getComputedStyle(document.querySelector('.ph-ridge')).zIndex,foreground:+getComputedStyle(document.querySelector('.ph-fore')).zIndex,ridgeImage:document.querySelector('.ph-ridge image').getAttribute('href'),land:getComputedStyle(document.querySelector('.ph-land')).backgroundImage,ridgeTransform:document.querySelector('.ph-ridge').style.transform,landTransform:document.querySelector('.ph-land').style.transform}));
 assert.ok(layers.heading<layers.ridge&&layers.ridge<layers.foreground);assert.equal(layers.ridgeTransform,layers.landTransform);assert.ok(layers.land.includes(layers.ridgeImage));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.screenshot({path:`archive/hero-verification/${name}-amethyst-terrain-depth.png`});console.log('PASS',name,'logo-purple background, regenerated terrain, preserved ridge occlusion and parallax');
}assert.deepEqual(errors,[]);console.log('PASS no page or shader errors');
}finally{await browser.close()}

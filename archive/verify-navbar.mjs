import puppeteer from 'file:///C:/Users/madha/AppData/Roaming/npm/node_modules/lighthouse/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';
const browser=await puppeteer.launch({executablePath:'C:/Users/madha/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message)});page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 for(const[name,width,height]of[['desktop',1440,900],['tablet',1024,768],['mobile',390,844],['small-mobile',320,760]]){
 await page.setViewport({width,height});await page.goto('http://localhost:5173/',{waitUntil:'networkidle0'});await page.evaluate(async()=>{scrollTo(0,0);await document.fonts.ready});await new Promise(r=>setTimeout(r,150));
 assert.deepEqual(await page.$$eval('.nav-item',e=>e.map(n=>n.textContent.trim())),['Platform','Services','Resources','Pricing','Contact']);
 assert.equal(await page.$('.ph-intro-copy,.ph-hint,.ph-skip'),null);
 const fit=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,nav:document.querySelector('.water-nav').getBoundingClientRect().toJSON(),items:[...document.querySelectorAll('.nav-item')].map(e=>e.getBoundingClientRect().toJSON()),gl:document.querySelector('.water-nav').dataset.gl}));
 assert.equal(fit.overflow,false);assert.ok(fit.items.every(e=>e.x>=0&&e.right<=width));console.log(name,'pill bounds',fit.nav.x,fit.nav.width,'WebGL',fit.gl);
 await page.screenshot({path:`archive/hero-verification/${name}-pill-navbar.png`});
 await page.click('[data-nav-trigger="0"]');assert.equal(await page.$eval('#nav-panel-0',e=>e.hidden),false);
 await page.click('[data-nav-trigger="1"]');assert.equal(await page.$eval('#nav-panel-0',e=>e.hidden),true);assert.equal(await page.$eval('#nav-panel-1',e=>e.hidden),false);
 await page.keyboard.press('Escape');assert.equal(await page.$eval('#nav-panel-1',e=>e.hidden),true);
 await page.click('[data-nav-trigger="2"]');await page.screenshot({path:`archive/hero-verification/${name}-pill-dropdown.png`});
 await page.click('#nav-panel-2 [data-resource="podcast"]');await new Promise(r=>setTimeout(r,200));console.log('Resource state',await page.$eval('#resource-dialog',e=>({open:e.open,title:e.querySelector('h2').textContent})));assert.equal(await page.$eval('#resource-dialog',e=>e.open),true);await page.click('#resource-dialog .dialog-close');
 await page.click('.water-nav [data-contact="Pricing information"]');assert.equal(await page.$eval('#contact-dialog',e=>e.open),true);await page.click('#contact-dialog .dialog-close');
 const broken=await page.$$eval('.water-nav a[href^="#"]',e=>e.filter(a=>!document.querySelector(a.getAttribute('href'))).map(a=>a.getAttribute('href')));assert.deepEqual(broken,[]);
 }
 assert.deepEqual(errors,[]);console.log('PASS responsive pill, three dropdowns, Escape, resources, pricing intent, anchors, removed copy, no page/shader errors');
}finally{await browser.close()}

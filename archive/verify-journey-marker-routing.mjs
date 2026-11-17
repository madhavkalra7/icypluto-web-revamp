import puppeteer from 'file:///C:/Users/madha/AppData/Roaming/npm/node_modules/lighthouse/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const b=await puppeteer.launch({executablePath:'C:/Users/madha/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{for(const width of [1440,390]){
const p=await b.newPage();await p.setViewport({width,height:900});await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await p.goto('http://localhost:5173/',{waitUntil:'networkidle0'});
await p.evaluate(()=>document.querySelector('[data-hero-step="1"]').click());await p.waitForFunction(()=>document.querySelector('.pluto-hero').dataset.heroStage==='1'&&document.querySelector('.pluto-hero').dataset.heroTransition==='settled');
await p.screenshot({path:`archive/journey-${width}-hero-markers.png`});
await p.evaluate(()=>document.querySelector('[data-hero-site="1"]').click());await p.waitForFunction(()=>document.querySelector('.pluto-hero').dataset.heroStage==='2'&&document.querySelector('.pluto-hero').dataset.heroTransition==='settled');
await p.evaluate(()=>document.querySelector('.ph-next').click());await p.waitForFunction(()=>(()=>{const section=document.querySelector('#capability-geo');const offset=parseFloat(getComputedStyle(section).scrollMarginTop)+parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop);return Math.abs(section.getBoundingClientRect().top-offset)<3;})());
console.log('PASS',width,'Discovery marker enters Pluto and continues to its own chapter');
await p.evaluate(()=>document.querySelector('#capability-seo').scrollIntoView({behavior:'instant'}));await p.screenshot({path:`archive/journey-${width}-health.png`});
await p.close();}}finally{await b.close()}

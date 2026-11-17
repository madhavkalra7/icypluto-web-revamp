import puppeteer from 'file:///C:/Users/madha/AppData/Roaming/npm/node_modules/lighthouse/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const b=await puppeteer.launch({executablePath:'C:/Users/madha/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
const p=await b.newPage();await p.setViewport({width:1440,height:900});await p.evaluateOnNewDocument(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>raf(t=>fn(window.animationClock??t));});await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await p.goto('http://localhost:5173/',{waitUntil:'networkidle0'});await p.evaluate(()=>document.querySelector('[data-hero-step="1"]').click());await p.waitForFunction(()=>document.querySelector('.pluto-hero').dataset.heroStage==='1'&&document.querySelector('.pluto-hero').dataset.heroTransition==='settled');await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]);await p.waitForFunction(()=>!document.body.classList.contains('motion-off'));
await p.evaluate(()=>{document.querySelector('.ph-next').click();window.mergeStart=performance.now();window.animationClock=window.mergeStart+1600;});
await p.screenshot({path:'archive/unified-pluto-converging.png'});
await p.evaluate(()=>window.animationClock=window.mergeStart+1900);
await p.screenshot({path:'archive/unified-pluto-combined.png'});
}finally{await b.close();}

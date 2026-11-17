import puppeteer from 'file:///C:/Users/madha/AppData/Roaming/npm/node_modules/lighthouse/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';
const b=await puppeteer.launch({executablePath:'C:/Users/madha/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{for(const [theme,width,height] of [['dark',1280,800],['light',390,844]]){
 const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.setViewport({width,height});await p.evaluateOnNewDocument(theme=>localStorage.setItem('icypluto-theme',theme),theme);await p.goto('http://localhost:5173/',{waitUntil:'networkidle0'});const settled=stage=>p.waitForFunction(stage=>{const r=document.querySelector('.pluto-hero');return r.dataset.heroStage===String(stage)&&r.dataset.heroTransition==='settled';},{timeout:30000},stage);
 await settled(0);await p.click('[data-hero-step="1"]');await settled(1);await p.click('.ph-explore');
 assert.equal(await p.$eval('.ph-next',e=>e.disabled),true,'Next must not leave a scene while landing');
 await p.evaluate(()=>{document.activeElement?.blur();window.scrollTo({top:220,behavior:'instant'});});await p.keyboard.press('PageDown');await p.mouse.wheel({deltaY:230});await p.waitForFunction(()=>scrollY===0,{timeout:15000});await settled(2);
 assert.equal(await p.evaluate(()=>scrollY),0,'Hero remains aligned until landing settles');assert.equal(await p.$eval('.ph-booking',e=>+e.style.opacity),1);assert.equal(await p.$eval('.ph-gl',e=>+e.style.opacity),0);assert.equal(await p.$eval('.ph-fog',e=>+e.style.opacity),0);assert.equal(await p.$eval('.ph-next',e=>e.disabled),false);await p.screenshot({path:`archive/hero-scroll-fix-${theme}-${width}.png`});
 await p.mouse.wheel({deltaY:250});await p.waitForFunction(()=>scrollY>0);console.log('PASS',theme,width,'scrollbar, PageDown and wheel cannot split landing; scrolling releases afterward');
 await p.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await p.click('.ph-back');await settled(1);await p.click('.ph-back');await settled(0);
 // Interrupt a direct landing with a return to orbit; neither scroll lock nor fog may persist.
 await p.click('[data-hero-step="2"]');await p.click('[data-hero-step="0"]');await settled(0);assert.equal(await p.$eval('.ph-word',e=>+e.style.opacity),1);assert.equal(await p.$eval('.ph-fog',e=>+e.style.opacity),0);
 // A deliberate navigation link may skip the story while the animation finishes off-screen.
 await p.click('[data-hero-step="1"]');await p.evaluate(()=>document.querySelector('.site-footer a[href="#home"]').click());await settled(1);
 await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await p.click('[data-hero-step="2"]');await settled(2);assert.equal(await p.$eval('.ph-booking',e=>+e.style.opacity),1);assert.deepEqual(errors,[]);console.log('PASS',theme,width,'reverse, interrupted transition, anchor navigation and reduced motion');await p.close();
}}finally{await b.close();}

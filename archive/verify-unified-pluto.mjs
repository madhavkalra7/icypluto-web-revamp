import puppeteer from 'file:///C:/Users/madha/AppData/Roaming/npm/node_modules/lighthouse/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';
import {heroFrame} from '../src/pluto-hero-state.js';
for(const state of [1,1.1,1.25,1.39])assert.equal(heroFrame({state,width:1440,height:900,age:10}).zoom,0,'Camera must wait for the merge');
assert.ok(heroFrame({state:1.7,width:1440,height:900,age:10}).zoom>.9);
const b=await puppeteer.launch({executablePath:'C:/Users/madha/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{for(const [width,theme] of [[1440,'dark'],[390,'light']]){
 const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.setViewport({width,height:900});await p.evaluateOnNewDocument(t=>localStorage.setItem('icypluto-theme',t),theme);await p.goto('http://localhost:5173/',{waitUntil:'networkidle0'});
 const settled=stage=>p.waitForFunction(stage=>{const r=document.querySelector('.pluto-hero');return r.dataset.heroStage===String(stage)&&r.dataset.heroTransition==='settled';},{timeout:45000},stage);
 await settled(0);await p.click('[data-hero-step="1"]');await settled(1);
 // Record labels in flight rather than inferring the effect from its final scene.
 await p.evaluate(()=>{
 window.mergeSamples=[];window.captureMerge=true;let pending=true;
 const sample=()=>{if(!window.captureMerge)return;const e=document.querySelector('.ph-convergence'),labels=[...document.querySelectorAll('.ph-merge-label')];if(+e.style.opacity>0){const rect=document.querySelector('.ph-gl').getBoundingClientRect();window.mergeSamples.push({labels:labels.map(el=>({opacity:+el.style.opacity,transform:el.style.transform})),title:document.querySelector('.ph-destination strong').textContent,glOpacity:document.querySelector('.ph-gl').style.opacity,canvasWidth:rect.width});}requestAnimationFrame(sample);};sample();
 });
 await p.mouse.move(width*.3,300);await p.mouse.wheel({deltaY:180});await p.waitForFunction(()=>document.querySelector('.ph-convergence').style.opacity==='1');
 await p.screenshot({path:`archive/unified-pluto-${width}-merge.png`});
 await p.evaluate(()=>{window.scrollTo({top:250,behavior:'instant'});});await settled(2);
 const result=await p.evaluate(()=>{window.captureMerge=false;return {heading:document.querySelector('.ph-destination strong').textContent,subtitle:document.querySelector('.ph-landing-caption').textContent,scroll:scrollY,mergeFrames:window.mergeSamples.length,positions:window.mergeSamples.at(Math.floor(window.mergeSamples.length/2))?.labels,overflow:document.documentElement.scrollWidth>innerWidth,mergeHidden:document.querySelector('.ph-convergence').style.opacity};});
 assert.equal(result.heading,'IcyPluto');assert.equal(result.scroll,0);assert.ok(result.mergeFrames>0);assert.equal(result.overflow,false);assert.equal(result.mergeHidden,'0');assert.deepEqual(errors,[]);
 await p.screenshot({path:`archive/unified-pluto-${width}-landing.png`});
 await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 for(const index of [0,1,2]){await p.evaluate(()=>document.querySelector('[data-hero-step="1"]').click());await settled(1);await p.evaluate(i=>document.querySelector(`[data-hero-site="${i}"]`).click(),index);await settled(2);assert.equal(await p.$eval('.ph-destination strong',e=>e.textContent),'IcyPluto');}
 console.log('PASS',width,theme,JSON.stringify(result));await p.close();
}}finally{await b.close();}

import { clamp, segment, cubicInOut } from './pluto-hero-state.js';

// Reparent the actual landscape wordmark. Never draw a second flight copy.
export function initBrandHandoff(root,getMotion){
 const source=root.querySelector('.ph-destination-word'),home=source.parentElement;
 const caption=root.querySelector('.ph-landing-caption'),target=document.querySelector('.site-header .brand-wordmark');
 const word=source.textContent,slot=document.createElement('span');slot.className='ph-wordmark-slot';slot.setAttribute('aria-hidden','true');slot.style.display='none';home.append(slot);source.setAttribute('aria-hidden','true');
 let entry=0,lastTravel=-1,lastRaw=0,mode='landscape',raf=0,disposed=false,origin,destination,typography,rootTop=0,distance=1;
 const blend=(a,b,t)=>a+(b-a)*t;
 function measure(){
  if(disposed)return;
  rootTop=root.getBoundingClientRect().top+scrollY;distance=Math.min(root.clientHeight*.38,360);
  const style=getComputedStyle(home),size=parseFloat(style.fontSize),from=(mode==='landscape'?source:slot).getBoundingClientRect(),to=target.getBoundingClientRect();
  origin={x:from.left,y:from.top+scrollY-rootTop,width:from.width,height:from.height};destination={x:to.left,y:to.top,width:to.width};
  typography={family:style.fontFamily,size:style.fontSize,weight:style.fontWeight,spacing:style.letterSpacing,color:style.color};
  if(mode==='landscape'&&size>0){slot.style.width=`${from.width/size}em`;slot.style.height=`${from.height/size}em`;}
 }
 function toLandscape(){
  if(mode==='landscape')return;
  source.classList.remove('ph-brand-transit');source.removeAttribute('style');home.prepend(source);slot.style.display='none';target.textContent=word;mode='landscape';
 }
 function toTransit(){
  if(mode==='transit')return;
  if(mode==='landscape')measure();
  slot.style.display='inline-block';document.body.append(source);target.textContent=word;mode='transit';source.classList.add('ph-brand-transit');
 }
 function toNavbar(){
  if(mode==='navbar')return;
  if(mode==='landscape')measure();
  slot.style.display='inline-block';source.classList.remove('ph-brand-transit');source.removeAttribute('style');target.replaceChildren(source);mode='navbar';
 }
 function draw(){
  raf=0;if(disposed)return;if(!origin||!destination)measure();
  const raw=clamp((scrollY-rootTop)/distance),progress=getMotion()?cubicInOut(raw):Number(raw>.12);
  if(lastRaw===0&&raw>0)measure();lastRaw=raw;
  caption.style.opacity=String(segment(lastTravel,.66,.8)*(1-segment(raw,0,.24)));
  if(entry<.01||progress===0){toLandscape();target.style.opacity=String(1-entry);}
  else if(progress===1){toNavbar();target.style.opacity='1';}
  else{
   toTransit();target.style.opacity='0';
   const scale=blend(1,destination.width/origin.width,progress),x=blend(origin.x,destination.x,progress),y=blend(origin.y,destination.y,progress);
   source.style.fontFamily=typography.family;source.style.fontSize=typography.size;source.style.fontWeight=typography.weight;source.style.letterSpacing=typography.spacing;source.style.color=typography.color;
   source.style.transform=`translate3d(${x}px,${y}px,0) scale(${scale})`;
  }
  root.dataset.brandHandoff=mode;
 }
 const schedule=()=>{if(!raf&&!disposed)raf=requestAnimationFrame(draw);};
 function refresh(){measure();schedule();}
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',refresh,{passive:true});document.addEventListener('icypluto:theme',refresh);
 const observer=new ResizeObserver(refresh);observer.observe(source);observer.observe(target);
 document.fonts.ready.then(()=>{if(!disposed)refresh();});
 return {update(travel){entry=segment(travel,.36,.78);if(travel!==lastTravel){lastTravel=travel;if(travel===1)measure();}draw();},refresh,dispose(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',refresh);document.removeEventListener('icypluto:theme',refresh);toLandscape();slot.remove();caption.style.removeProperty('opacity');target.style.removeProperty('opacity');}};
}

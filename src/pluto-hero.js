import { paintPlutoMap } from './pluto-texture.js';
import * as THREE from 'three';
import { CAPABILITIES, clamp, segment, mix, cubicInOut, cubicOut, mapPoint, facing, rotatePoint, heroFrame } from './pluto-hero-state.js';

const vertex = `varying vec2 vUv; varying vec3 vObj; varying vec3 vN;
void main(){vUv=uv;vObj=normalize(position);vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fragment = `precision highp float;
uniform sampler2D map;uniform vec2 texel;uniform vec3 sun,hiDir;uniform float hi,hiR,ready,day;
varying vec2 vUv;varying vec3 vObj;varying vec3 vN;
float luma(vec2 uv){return dot(texture2D(map,uv).rgb,vec3(.3,.6,.1));}
void main(){
vec3 sampleColor=texture2D(map,vUv).rgb;vec3 col=pow(sampleColor,vec3(2.2));
vec3 n=normalize(vN);vec3 t=normalize(cross(vec3(0.,1.,0.),n)+vec3(.0001,0.,0.));vec3 b=cross(n,t);
float dx=luma(vUv+vec2(texel.x*2.,0.))-luma(vUv-vec2(texel.x*2.,0.));float dy=luma(vUv+vec2(0.,texel.y*2.))-luma(vUv-vec2(0.,texel.y*2.));n=normalize(n-(t*dx+b*dy)*.8);
float diff=max(dot(n,sun),0.);vec3 lit=col*(vec3(1.05,1.02,.97)*pow(diff,.85)+mix(vec3(.12,.115,.11),vec3(.24,.255,.28),day));
float d=acos(clamp(dot(normalize(vObj),hiDir),-1.,1.))+(dot(sampleColor,vec3(.3,.6,.1))-.45)*.15;
float mask=1.-smoothstep(hiR-.035,hiR,d);float edge=1.-smoothstep(.0,.018,abs(d-hiR+.01));
lit=mix(lit,lit*vec3(1.12,.94,.82)+vec3(.07,.04,.02),mask*hi*.45);lit+=vec3(.7,.61,.51)*edge*hi*.20;
float fres=pow(1.-max(vN.z,0.),3.2);lit+=vec3(.5,.56,.63)*fres*(.025+diff*.07);
gl_FragColor=vec4(pow(max(lit,vec3(0.)),vec3(1./2.2)),ready);
}`;

export function initPlutoHero(getMotion, requestDemo) {
  const root = document.querySelector('.pluto-hero');
  const $ = selector => root.querySelector(selector), $$ = selector => [...root.querySelectorAll(selector)];
  const el = Object.fromEntries(['word','gl','flare','word-one','capability-panel','preview','region','land','ridge','destination','landing-caption','fore','fog','booking','fallback'].map(name => [name, $(`.ph-${name}`)]));
  let w = root.clientWidth || innerWidth, h = root.clientHeight || innerHeight;
  let st = 0, from = 0, target = 0, t0 = 0, duration = 1, selected = 0, frameId, last = 0;
  const openingStartedAt=performance.now();
  let loadedAt = performance.now(), ready = false, visible = true, dirty = true, disposed = false;
  let focusUntil = 0;
  const globeMarkers = $$('[data-globe-site]');
  const markerCoordinates = [[.54,.43],[.67,.33],[.41,.57]];
  let yaw = facing(mapPoint(.54,.43)).yaw, pitch = .16, velocity = 0, lastDrag = -10000;
  let dragging = false, pointerStart = null, mouseX = 0, mouseY = 0, lastPose, panelWasVisible = false;
  let renderer, scene, camera, planet, tilt, spin, surface, atmosphere, texture, contextLost = false, textureWorker;
  let renderScale=1,qualityFrames=0,qualityTotal=0;
  const letters=$('.ph-pluto-letters'),wordWrap=$('.ph-pluto-wrap'),title=$('.ph-destination strong');
  const openingCopy=$('.ph-opening-copy'),orbit=$('.ph-orbit');
  const controls=$('.ph-controls'),nextButton=$('.ph-next'),backButton=$('.ph-back'),imageNote=$('.ph-image-note');
  let geometry={wordHeight:0,lettersWidth:0,titleTop:0,titleHeight:0,destinationHeight:0};
  function measureGeometry(){geometry={wordHeight:el.word.offsetHeight,lettersWidth:letters.offsetWidth,titleTop:title.offsetTop,titleHeight:title.offsetHeight,destinationHeight:el.destination.offsetHeight};}
  const cleanup = [];
  const listen = (element, type, fn, options) => { element.addEventListener(type, fn, options); cleanup.push(() => element.removeEventListener(type, fn, options)); };
  const opacity = (element, value) => {const next=String(Math.max(0,Math.min(1,value)));if(element.style.opacity!==next)element.style.opacity=next;};
  const showInteractive = (element, show) => { if(element.hidden===show)element.hidden=!show;if(element.inert===show)element.inert=!show; };

  function installTexture(next){
    if(disposed){next.image?.close?.();next.dispose();return;}
    texture=next;texture.colorSpace=THREE.NoColorSpace;texture.wrapS=THREE.RepeatWrapping;
    texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());texture.needsUpdate=true;
    surface.material.uniforms.map.value.dispose();surface.material.uniforms.map.value=texture;
    surface.material.uniforms.texel.value.set(1/texture.image.width,1/texture.image.height);
    surface.material.uniforms.ready.value=1;atmosphere.material.uniforms.ready.value=1;
    loadedAt=performance.now();ready=true;dirty=true;
  }
  function loadFallbackTexture(){
    if(disposed)return;const image=new Image();image.onload=()=>{if(disposed)return;try{installTexture(new THREE.CanvasTexture(paintPlutoMap(document.createElement('canvas'),image,Math.min(2048,renderer.capabilities.maxTextureSize))));}catch{root.classList.add('ph-no-webgl');ready=true;dirty=true;}};
    image.onerror=()=>{root.classList.add('ph-no-webgl');ready=true;loadedAt=performance.now()-2000;dirty=true;};image.src='/assets/pluto-color-map-hd.jpg';
  }
  function loadTexture(){
    if(typeof Worker==='undefined'||typeof OffscreenCanvas==='undefined'){loadFallbackTexture();return;}
    try{
      textureWorker=new Worker(new URL('./pluto-texture.worker.js',import.meta.url),{type:'module'});
      textureWorker.onmessage=({data})=>{textureWorker?.terminate();textureWorker=null;if(data.error){loadFallbackTexture();return;}installTexture(new THREE.Texture(data.bitmap));};
      textureWorker.onerror=()=>{textureWorker?.terminate();textureWorker=null;loadFallbackTexture();};
      textureWorker.postMessage({url:new URL('/assets/pluto-color-map-hd.jpg',location.href).href,maxWidth:Math.min(innerWidth<=760?3072:4096,renderer.capabilities.maxTextureSize)});
    }catch{loadFallbackTexture();}
  }
  function initScene() {
    try {
      renderer = new THREE.WebGLRenderer({canvas:el.gl,alpha:true,antialias:true,powerPreference:'high-performance'});
      renderScale=Math.min(devicePixelRatio||1,innerWidth<=760?1.5:2);renderer.setPixelRatio(renderScale);renderer.setClearColor(0,0);
      scene=new THREE.Scene();camera=new THREE.OrthographicCamera(-w/2,w/2,h/2,-h/2,-200000,200000);camera.position.z=1000;
      planet=new THREE.Group();tilt=new THREE.Group();spin=new THREE.Group();planet.add(tilt);tilt.add(spin);scene.add(planet);
      const fallback=new THREE.DataTexture(new Uint8Array([180,160,138,255]),1,1);fallback.needsUpdate=true;
      const point=mapPoint(.54,.43);
      surface=new THREE.Mesh(new THREE.SphereGeometry(1,128,96),new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,uniforms:{map:{value:fallback},texel:{value:new THREE.Vector2(1/1600,1/800)},sun:{value:new THREE.Vector3(.62,.5,.85).normalize()},hiDir:{value:new THREE.Vector3(point.x,point.y,point.z)},hi:{value:0},hiR:{value:.45},ready:{value:0},day:{value:document.documentElement.dataset.theme==='light'?1:0}},transparent:true}));spin.add(surface);
      atmosphere=new THREE.Mesh(new THREE.SphereGeometry(1.045,64,48),new THREE.ShaderMaterial({vertexShader:'varying vec3 vN;void main(){vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float ready;varying vec3 vN;void main(){float z=clamp(-vN.z,0.,1.);float a=pow(smoothstep(0.,.55,z),3.)*.18;gl_FragColor=vec4(vec3(.65,.73,.82),a*ready);}',uniforms:{ready:{value:0}},side:THREE.BackSide,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false}));planet.add(atmosphere);
      loadTexture();
      resize();
    } catch { root.classList.add('ph-no-webgl');ready=true;loadedAt=performance.now()-2000; }
  }
  function resize() {
    w=root.clientWidth || innerWidth;h=root.clientHeight || innerHeight;
    if(renderer){renderer.setSize(w,h,false);camera.left=-w/2;camera.right=w/2;camera.top=h/2;camera.bottom=-h/2;camera.updateProjectionMatrix();}
    measureGeometry();alignCard();dirty=true;
  }
  function alignCard(){if(w<=760){el.preview.style.left='';el.preview.style.right='';return;}const sites=$('.ph-sites'),button=$$('[data-hero-site]')[selected];el.preview.style.left=`${Math.max(16,sites.getBoundingClientRect().left-root.getBoundingClientRect().left-el.preview.offsetWidth-24)}px`;el.preview.style.right='auto';const ideal=h*.5-sites.offsetHeight*.5+button.parentElement.offsetTop+button.offsetHeight*.5-el.preview.offsetHeight*.5;el.preview.style.top=`${Math.max(170,Math.min(ideal,h*.80-el.preview.offsetHeight))}px`;}
  function pick(index,announce=false){const changed=selected!==index;selected=index;if(changed)document.dispatchEvent(new CustomEvent('icypluto:hero-capability',{detail:CAPABILITIES[index].name.toLowerCase()}));focusUntil=performance.now()+1800;const cap=CAPABILITIES[index];$$('[data-hero-site]').forEach((button,i)=>{button.classList.toggle('on',i===index);button.setAttribute('aria-pressed',String(i===index));});$('.ph-preview-title').textContent=cap.name;$('.ph-preview-description').textContent=cap.description;$('.ph-explore').innerHTML=`Explore ${cap.name} <span>→</span>`;$('.ph-region').textContent=cap.name;$('.ph-destination strong').textContent=cap.destination;$('.ph-destination-copy').textContent=cap.title;$('[name="hero-focus"]').value=String(index);measureGeometry();alignCard();dirty=true;if(announce)$('.ph-status').textContent=`${cap.name}: ${cap.title}`;}
  function go(next){next=Math.max(0,Math.min(2,next));if(next===target)return;from=st;target=next;t0=performance.now();if(next===1)focusUntil=t0+2300;const low=Math.min(from,next),high=Math.max(from,next);duration=getMotion()?Math.max(1,(Math.min(high,1)-Math.min(low,1))*1300+(Math.max(high-1,0)-Math.max(low-1,0))*2500):1;dirty=true;$$('[data-hero-step]').forEach((button,i)=>{button.classList.toggle('on',i===next);if(i===next)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});$('.ph-status').textContent=next===0?'Pluto. Drag to rotate or explore AI visibility.':next===1?'Explore AEO, GEO, and SEO. Select a capability to land.':`${CAPABILITIES[selected].name}: ${CAPABILITIES[selected].title}. Book a demo or continue to the platform.`;}
  function render(now=0){frameId=requestAnimationFrame(render);if(disposed||document.hidden||!visible)return;const moving=Math.abs(st-target)>.0001;const age=(now-loadedAt)/1000;if(!getMotion()&&!dirty&&!moving)return;const interval=now-last,dt=Math.min(interval/1000,.1)||.016;last=now;
    // Adapt only render resolution after sustained GPU pressure, never texture detail.
    if(getMotion()&&ready&&st<1.5&&interval>0&&interval<250){qualityTotal+=interval;qualityFrames++;if(qualityFrames>=120){const average=qualityTotal/qualityFrames,ceiling=Math.min(devicePixelRatio||1,w<=760?1.5:2);let next=renderScale;if(average>24)next=Math.max(1,renderScale-.2);else if(average<14)next=Math.min(ceiling,renderScale+.1);if(renderer&&Math.abs(next-renderScale)>.05){renderScale=next;renderer.setPixelRatio(renderScale);}qualityFrames=0;qualityTotal=0;}}

    st=getMotion()?mix(from,target,cubicInOut(segment(now,t0,t0+duration))):target;
    const f=heroFrame({state:st,width:w,height:h,age:ready?age:0,motion:getMotion()});lastPose=f;
    const cap=CAPABILITIES[selected],point=mapPoint(f.a>.02?cap.u:.54,f.a>.02?cap.v:.43),face=facing(point);
    if(f.a>.02&&!dragging&&now<focusUntil){const delta=Math.atan2(Math.sin(face.yaw-yaw),Math.cos(face.yaw-yaw));const follow=getMotion()?1-Math.exp(-dt*3.6):1;yaw+=delta*follow;pitch+=(face.pitch-pitch)*follow;}
    else if(!dragging){if(getMotion()&&age>3.5&&now-lastDrag>1500)yaw+=dt*.24;yaw+=velocity;velocity*=Math.exp(-dt*4);pitch+=(.10-pitch)*(1-Math.exp(-dt*1.2));}
    if(renderer&&!contextLost&&f.b<.78){planet.position.set(f.cx-w/2,h/2-f.cy,0);planet.scale.setScalar(f.radius);tilt.rotation.x=pitch;spin.rotation.y=yaw;surface.material.uniforms.hiDir.value.set(point.x,point.y,point.z);surface.material.uniforms.hi.value=segment(f.a,.15,.6);surface.material.uniforms.hiR.value=f.b>.02?mix(.45,.27,segment(f.b,0,.1)):.45;renderer.render(scene,camera);}
    if(root.classList.contains('ph-no-webgl')){el.fallback.style.width=`${f.radius*2}px`;el.fallback.style.height=`${f.radius*2}px`;el.fallback.style.left=`${f.cx}px`;el.fallback.style.top=`${f.cy}px`;}
    // The brand occupies its own column; no part is hidden behind Pluto.
    const wordY=w<=760?h*.215:h*.45-geometry.wordHeight*.5;
    el.word.style.transform=`translate(${f.a*-w*.07}px,${wordY-mouseY*5}px)`;
    const openingAge=(now-openingStartedAt)/1000,openingIntro=getMotion()?cubicOut(segment(openingAge,.05,.65)):1;
    el.word.style.clipPath='none';opacity(el.word,f.wordOpacity*openingIntro);
    const reveal=getMotion()?cubicOut(segment(openingAge,.25,1.35)):1;
    wordWrap.style.width=`${geometry.lettersWidth}px`;
    letters.style.clipPath='none';letters.style.transform=`translateY(${(1-reveal)*38}px)`;
    opacity(letters,reveal);
    opacity(openingCopy,f.wordOpacity*openingIntro);
    const opening=f.wordOpacity*f.grow;
    opacity(orbit,opening);
    orbit.style.left=`${f.cx}px`;orbit.style.top=`${f.cy}px`;
    orbit.style.width=`${f.baseRadius*2.72}px`;orbit.style.height=`${f.baseRadius*1.14}px`;
    root.classList.toggle('ph-exploring',st>.05);
    el.flare.style.left=`${f.cx+f.radius*.74}px`;el.flare.style.top=`${f.cy-f.radius*.62}px`;opacity(el.flare,f.grow*.6*(1-segment(f.zoom,0,.35)));
    globeMarkers.forEach((marker,index)=>{
      const [u,v]=markerCoordinates[index],pin=rotatePoint(mapPoint(u,v),yaw,pitch);
      const alpha=segment(pin.z,.12,.35)*(getMotion()?segment(age,3.0,3.5):1)*(1-segment(f.b,0,.25));
      marker.style.transform=`translate(${f.cx+pin.x*f.radius}px,${f.cy-pin.y*f.radius}px)`;
      marker.style.opacity=String(alpha);marker.inert=alpha<.5;marker.tabIndex=alpha>.5?0:-1;
    });
    opacity(el['word-one'],f.wordOneOpacity);el['word-one'].style.transform=`translate(calc(-50% + ${f.portrait?0:-w*.16+(1-cubicOut(segment(f.a,.45,1)))*40}px),${f.portrait?h*.40:h*.56}px)`;
    const panelShow=f.panelOpacity>.02;showInteractive(el['capability-panel'],panelShow);opacity(el['capability-panel'],f.panelOpacity);if(panelShow&&!panelWasVisible)alignCard();panelWasVisible=panelShow;el.preview.style.transform=`translateX(${(1-cubicOut(segment(f.a,.6,1)))*26}px)`;
    el.gl.style.pointerEvents=st<1.02?'auto':'none';el.gl.tabIndex=st<1.02?0:-1;el['capability-panel'].inert=f.panelOpacity<.6;opacity(el.gl,1-segment(f.b,.52,.76));opacity(el.fallback,1-segment(f.b,.52,.76));opacity(el.region,segment(f.b,.14,.26)*(1-segment(f.b,.42,.52)));
    const covered=f.b>.55;if(root.classList.contains('ph-on-surface')!==covered)root.classList.toggle('ph-on-surface',covered);
    const layers=f.b>.5;opacity(el.land,layers?1:0);opacity(el.ridge,layers?1:0);opacity(el['landing-caption'],segment(f.b,.66,.8));opacity(el.fore,layers?1:0);opacity(el.destination,segment(f.b,.66,.8));
    const drift=1;el.land.style.transform=`translate(${mouseX*-14}px,${mix(h*.2,mouseY*-8,f.landProgress)}px) scale(${mix(1.3,1.05,f.landProgress)*drift})`;el.fore.style.transform=`translate(${mouseX*-36}px,${mix(h*.42,0,f.foregroundProgress)}px) scale(1.06)`;el.ridge.style.transform=el.land.style.transform;
    // Place the headline across the photographed ridgeline, between terrain layers.
    const imageScale=Math.max(w/1672,h/941);
    const horizon=h*.5+(442-941*.5)*imageScale*1.05;
    const destinationY=mix(h*.62,horizon-geometry.titleTop-geometry.titleHeight*.77,f.destinationProgress);
    el.destination.style.transform=`translate(${mouseX*-18}px,${destinationY}px)`;
    el['landing-caption'].style.transform=`translate(${mouseX*-18}px,${destinationY+geometry.destinationHeight+20}px)`;opacity(el.fog,f.fogOpacity);
    const bookingShow=f.bookingProgress>.02;showInteractive(el.booking,bookingShow);opacity(el.booking,f.bookingProgress);el.booking.style.transform=`translate(-50%,${(1-cubicOut(f.bookingProgress))*34}px)`;
    imageNote.hidden=st<1.9;backButton.hidden=target===0;controls.style.bottom=f.b>.8?(w<=760?'6%':'4%'):'';const nextLabel=target===0?'Explore AI visibility <span>→</span>':target===1?`Land on ${cap.name} <span>→</span>`:'Explore the platform <span>↓</span>';
    if(nextButton.innerHTML!==nextLabel)nextButton.innerHTML=nextLabel;
    dirty=false;
  }

  listen(document,'icypluto:theme',()=>{if(surface)surface.material.uniforms.day.value=document.documentElement.dataset.theme==='light'?1:0;dirty=true;});
  listen(document,'icypluto:select-capability',event=>{const index=CAPABILITIES.findIndex(cap=>cap.name.toLowerCase()===event.detail);if(index>=0&&index!==selected)pick(index);});
  globeMarkers.forEach(button=>{listen(button,'click',()=>{pick(Number(button.dataset.globeSite),true);go(1);});listen(button,'focus',()=>{lastDrag=performance.now();});});
  $$('[data-hero-step]').forEach(button=>listen(button,'click',()=>go(Number(button.dataset.heroStep))));
  $$('[data-hero-site]').forEach(button=>{listen(button,'pointerenter',()=>pick(Number(button.dataset.heroSite)));listen(button,'focus',()=>pick(Number(button.dataset.heroSite)));listen(button,'click',()=>{pick(Number(button.dataset.heroSite),true);go(2);});});
  listen($('.ph-explore'),'click',()=>go(2));listen($('.ph-back'),'click',()=>go(target-1));listen($('.ph-next'),'click',()=>target<2?go(target+1):document.querySelector('#what-is-icypluto').scrollIntoView({behavior:getMotion()?'smooth':'auto'}));
  listen($('[name="hero-focus"]'),'change',event=>pick(Number(event.target.value)));
  listen(el.booking,'submit',event=>{event.preventDefault();if(!el.booking.reportValidity())return;requestDemo({focus:CAPABILITIES[selected].name,website:$('[name="hero-website"]').value,trigger:el.booking.querySelector('button')});});
  listen(el.gl,'pointerdown',event=>{if(!lastPose||target>1)return;const rect=root.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;if(Math.hypot(x-lastPose.cx,y-lastPose.cy)>lastPose.radius)return;pointerStart={x:event.clientX,y:event.clientY,lastX:event.clientX,lastY:event.clientY};dragging=true;velocity=0;el.gl.classList.add('dragging');el.gl.setPointerCapture?.(event.pointerId);});
  listen(el.gl,'pointermove',event=>{if(!dragging||!pointerStart)return;const dx=event.clientX-pointerStart.lastX,dy=event.clientY-pointerStart.lastY,k=1.1/(lastPose?.baseRadius||200);yaw+=dx*k;pitch=Math.max(-1,Math.min(1,pitch+dy*k));velocity=dx*k*.18;pointerStart.lastX=event.clientX;pointerStart.lastY=event.clientY;lastDrag=performance.now();focusUntil=0;dirty=true;});
  const release=event=>{if(!dragging)return;const clicked=pointerStart&&Math.hypot(event.clientX-pointerStart.x,event.clientY-pointerStart.y)<6;dragging=false;pointerStart=null;el.gl.classList.remove('dragging');lastDrag=performance.now();if(clicked)go(target+1);};listen(el.gl,'pointerup',release);listen(el.gl,'pointercancel',()=>{dragging=false;pointerStart=null;el.gl.classList.remove('dragging');});
  listen(root,'pointermove',event=>{const rect=root.getBoundingClientRect();mouseX=getMotion()?(event.clientX-rect.left)/w-.5:0;mouseY=getMotion()?(event.clientY-rect.top)/h-.5:0;dirty=true;},{passive:true});
  // Listen at the viewport so scrolling over the header also opens the hero.
  const scrollingForm = node => node instanceof Element && !!node.closest('input,select,textarea,[contenteditable="true"]');
  const heroActive = () => {const rect=root.getBoundingClientRect();return rect.top<=2&&rect.top>-innerHeight*.45&&rect.bottom>innerHeight*.55;};
  const scrollBlocked = event => document.querySelector('dialog[open]') || scrollingForm(event.target);
  let wheelAt=0,wheelTotal=0,wheelConsumed=false,swipe=null,skipScrollUntil=0,previousScroll=scrollY;
  function scrollStage(direction,event){
    if(performance.now()<t0+duration){event.preventDefault();return false;}
    const next=target+direction;
    if(next<0||next>2)return false;
    event.preventDefault();go(next);return true;
  }
  listen(window,'wheel',event=>{
    if(event.ctrlKey||scrollBlocked(event)||!heroActive()||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
    const now=performance.now(),delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
    if(!delta)return;
    if(now-wheelAt>220||Math.sign(delta)!==Math.sign(wheelTotal)){wheelTotal=0;wheelConsumed=false;}
    wheelAt=now;wheelTotal+=delta;
    if(wheelConsumed){if(target<2||now<t0+duration)event.preventDefault();return;}
    if((delta>0&&target<2)||(delta<0&&target>0)){
      event.preventDefault();
      if(Math.abs(wheelTotal)>=12)wheelConsumed=scrollStage(Math.sign(delta),event);
    }
  },{passive:false});
  listen(root,'touchstart',event=>{
    if(event.touches.length!==1||scrollBlocked(event)||!heroActive()){swipe=null;return;}
    swipe={x:event.touches[0].clientX,y:event.touches[0].clientY,consumed:false};
  },{passive:true});
  listen(root,'touchmove',event=>{
    if(!swipe||event.touches.length!==1)return;
    const dx=swipe.x-event.touches[0].clientX,dy=swipe.y-event.touches[0].clientY;
    if(Math.abs(dx)>Math.abs(dy)||Math.abs(dy)<16)return;
    if(swipe.consumed){event.preventDefault();return;}
    swipe.consumed=scrollStage(Math.sign(dy),event);
  },{passive:false});
  listen(root,'touchend',()=>{swipe=null;},{passive:true});
  listen(root,'touchcancel',()=>{swipe=null;},{passive:true});
  // Native scrollbar/keyboard scrolling also opens the first capability stage.
  // Explicit anchor navigation, including the skip link, continues to its destination.
  listen(document,'click',event=>{if(event.target instanceof Element&&event.target.closest('a[href^="#"]'))skipScrollUntil=performance.now()+2000;},{capture:true});
  listen(window,'scroll',()=>{
    const current=scrollY,top=root.getBoundingClientRect().top+current;
    if(target===0&&current>top+12&&previousScroll<=top+12&&heroActive()&&performance.now()>skipScrollUntil&&!document.querySelector('dialog[open]')){
      go(1);window.scrollTo({top,behavior:'instant'});
    }
    previousScroll=scrollY;
  },{passive:true});
  listen(window,'keydown',event=>{
    if(target===0&&heroActive()&&!scrollBlocked(event)&&!event.defaultPrevented&&!event.altKey&&!event.ctrlKey&&!event.metaKey&&['ArrowDown','PageDown',' '].includes(event.key)&&!(event.target instanceof Element&&event.target.closest('button,a,summary'))){scrollStage(1,event);}
  });
  listen(el.gl,'keydown',event=>{if(['Enter',' ','ArrowRight','ArrowLeft','Home','End'].includes(event.key)){event.preventDefault();go(event.key==='Home'?0:event.key==='End'?2:event.key==='ArrowLeft'?target-1:target+1);}});
  listen(document,'keydown',event=>{if(event.key==='Escape'&&!document.querySelector('dialog[open]')&&target>0&&root.getBoundingClientRect().bottom>0)go(target-1);});
  listen(window,'resize',resize);listen(document,'visibilitychange',()=>{dirty=true;});
  listen(el.gl,'webglcontextlost',event=>{event.preventDefault();contextLost=true;root.classList.add('ph-no-webgl');dirty=true;});
  listen(el.gl,'webglcontextrestored',()=>{contextLost=false;root.classList.remove('ph-no-webgl');dirty=true;});
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;dirty=true;},{rootMargin:'100px'});observer.observe(root);
  const typeObserver=new ResizeObserver(()=>{measureGeometry();dirty=true;});
  typeObserver.observe($('.ph-pluto-letters'));typeObserver.observe($('.ph-icy'));
  document.fonts.ready.then(()=>{if(!disposed){resize();dirty=true;}});
  pick(0);initScene();resize();frameId=requestAnimationFrame(render);
  return {refresh(){dirty=true;if(!getMotion()){st=target;mouseX=0;mouseY=0;}},dispose(){disposed=true;cancelAnimationFrame(frameId);observer.disconnect();typeObserver.disconnect();cleanup.forEach(fn=>fn());scene?.traverse(object=>{object.geometry?.dispose();object.material?.dispose();});textureWorker?.terminate();texture?.image?.close?.();texture?.dispose();renderer?.dispose();}};
}

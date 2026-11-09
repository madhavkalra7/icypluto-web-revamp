import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const clamp = x => Math.max(0,Math.min(1,x));
const smooth = x => {x=clamp(x);return x*x*(3-2*x)};
// One renderer and one lighting rig for the entire story. No per-section canvases.
export function createContinuousWorld(getMotion) {
  const host=document.createElement('div');host.className='pluto-world';host.setAttribute('aria-hidden','true');host.innerHTML=`${['default','seo','aeo','geo'].map(key=>`<div class="world-terrain" data-world-bg="${key}"${key==='default'?'':` style="background-image:url(/assets/pluto-world-${key}.webp);opacity:0"`}></div>`).join('')}<div class="world-atmosphere"></div><canvas class="world-canvas"></canvas><div class="world-grain"></div>`;
  document.body.prepend(host);
  const backgroundLayers=[...host.querySelectorAll('[data-world-bg]')];
  const backgroundKey=key=>['seo','aeo','geo'].includes(key)?key:'default';
  function blendBackgrounds(a,b,t){
    const first=backgroundKey(a),second=backgroundKey(b);
    for(const layer of backgroundLayers){const key=layer.dataset.worldBg;const weight=first===second?(key===first?1:0):(key===first?1-t:key===second?t:0);const opacity=String(weight*.85);if(layer.style.opacity!==opacity)layer.style.opacity=opacity;}
  }
  let renderer,scene,camera,environment,raf,disposed=false,dirty=true,width=innerWidth,height=innerHeight,anchors=[],introTop=0,pointer={x:0,y:0},last=0,sceneY=scrollY,activeKey=null,qualityFrames=0,qualityTotal=0,renderDpr=Math.min(devicePixelRatio||1,innerWidth<760?1.25:1.5);
  const objects=new Map(),geometries=new Set(),materials=new Set(),textures=new Set();
  const geo=g=>(geometries.add(g),g),mat=m=>(materials.add(m),m);
  const ice=()=>{
    const material=mat(new THREE.MeshPhysicalMaterial({color:0x8f97ad,metalness:.5,roughness:.3,clearcoat:1,clearcoatRoughness:.18,flatShading:false,envMapIntensity:1.25}));
    material.onBeforeCompile=shader=>{
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vIceLocal;').replace('#include <begin_vertex>','#include <begin_vertex>\nvIceLocal=position;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
        varying vec3 vIceLocal;
        float ih(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
        float inoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(ih(i),ih(i+vec3(1,0,0)),f.x),mix(ih(i+vec3(0,1,0)),ih(i+vec3(1,1,0)),f.x),f.y),mix(mix(ih(i+vec3(0,0,1)),ih(i+vec3(1,0,1)),f.x),mix(ih(i+vec3(0,1,1)),ih(i+vec3(1,1,1)),f.x),f.y),f.z);}
      `).replace('#include <color_fragment>',`#include <color_fragment>
        float frost=inoise(vIceLocal*18.)*.65+inoise(vIceLocal*51.)*.35;float micro=inoise(vIceLocal*91.);
        float vein=pow(1.-abs(sin(vIceLocal.y*14.+vIceLocal.x*8.+frost*9.)),20.);
        vec3 iceDark=vec3(.014,.018,.027);vec3 iceFrost=vec3(.18,.21,.27);
        diffuseColor.rgb=mix(iceDark,iceFrost,smoothstep(.4,.78,frost)*.5)+micro*.025+vein*.045;
      `).replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
        roughnessFactor=clamp(.16+frost*.46+micro*.08,.18,.65);
      `);
    };
    material.customProgramCacheKey=()=> 'icypluto-frost-1';return material;
  };
  const edge=mat(new THREE.LineBasicMaterial({color:0xe8dff9,transparent:true,opacity:.26}));
  const light=mat(new THREE.MeshBasicMaterial({color:0xcfb3f5}));
  function mesh(g,m,parent){const o=new THREE.Mesh(geo(g),m);parent.add(o);return o}
  function rim(mesh,parent=mesh){const e=new THREE.LineSegments(geo(new THREE.EdgesGeometry(mesh.geometry,25)),edge);parent.add(e);return e}
  function ring(parent,radius,rotation=[0,0,0],opacity=.24){const points=[];for(let i=0;i<=180;i++){const t=i/180*Math.PI*2;points.push(new THREE.Vector3(Math.cos(t)*radius,Math.sin(t)*radius,0))}const line=new THREE.Line(geo(new THREE.BufferGeometry().setFromPoints(points)),mat(new THREE.LineBasicMaterial({color:0xb698dd,transparent:true,opacity})));line.rotation.set(...rotation);parent.add(line);return line}
  function crystal(parent,radius=1,seed=1){const g=new THREE.IcosahedronGeometry(radius,3),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),n=1+Math.sin(x*13.1+y*7.3+z*19.7+seed)*.055;p.setXYZ(i,x*n,y*n,z*n)}g.computeVertexNormals();const m=mesh(g,ice(),parent);rim(m);return m}
  function group(key,x,y,scale=1){const g=new THREE.Group();g.userData={key,x,y,scale};scene.add(g);objects.set(key,g);return g}
  function makeObjects(){
    let g=group('intro',2,-.35,1.15);
    for(let i=0;i<3;i++){const o=crystal(g,.9,i);o.scale.set(.55,1.9,.5);o.position.set((i-1)*1.02,i===1?.2:-.35,(i%2)*.45);o.rotation.z=(i-1)*-.3}ring(g,2.1,[1.13,.2,-.3]);ring(g,2.6,[1.13,.2,-.3],.1);
    g=group('seo',2.65,-.25,1.05);g.rotation.set(.03,-.48,-.1);
    for(let i=0;i<5;i++){const page=mesh(new RoundedBoxGeometry(2.5,3.15,.14,2,.06),ice(),g);page.position.set((i-2)*.25,(i-2)*.15,-i*.42);page.rotation.z=(i-2)*.025;page.userData.pageIndex=i;rim(page);if(i===0){const lineMat=mat(new THREE.MeshBasicMaterial({color:0xddd5ea,transparent:true,opacity:.45}));for(let j=0;j<6;j++){const bar=mesh(new THREE.BoxGeometry(j===0?1.4:1.8-j*.09,j===0?.12:.025,.012),lineMat,page);bar.position.set(j===0?-.2:0,1.04-j*.35,.085)}const scan=mesh(new THREE.BoxGeometry(2.7,.025,.035),light,page);scan.position.set(0,-.2,.13);scan.name='scan'}}
    ring(g,2.75,[1.28,.1,.15],.16);
    g=group('aeo',2.65,-.4,.85);
    const orbit=new THREE.Group();orbit.name='signal-orbit';orbit.rotation.set(.4,-.35,.08);g.add(orbit);
    for(let i=0;i<18;i++){const a=i/18*Math.PI*2;const o=mesh(new THREE.TorusGeometry(1.72,.19,7,12,Math.PI*2/18*.86),ice(),orbit);o.rotation.z=a;o.position.z=Math.sin(a*3)*.025;o.userData.segmentAngle=a;rim(o);}
    const core=crystal(g,.62,8);core.rotation.set(.4,.7,.2);ring(g,1.12,[.1,.4,.6],.5);ring(g,2.15,[.7,-.35,.2],.17);ring(g,2.45,[-.6,.2,-.3],.12);
    for(let i=0;i<5;i++){const dot=mesh(new THREE.OctahedronGeometry(.04),light,g);dot.position.set(-3+i*.53,.1+Math.sin(i)*.2,0)}
    g=group('geo',-2.5,-.1,1);crystal(g,.72,2);
    for(let i=0;i<9;i++){const a=i/9*Math.PI*2,r=1.9+(i%3)*.35;const v=new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r*.76,Math.sin(a*2)*.85);const o=crystal(g,.2+(i%3)*.09,i);o.position.copy(v);o.rotation.set(a,a*.5,0);const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(),new THREE.Vector3(v.x*.65,v.y*.45,.8),v);g.add(new THREE.Line(geo(new THREE.BufferGeometry().setFromPoints(curve.getPoints(32))),mat(new THREE.LineBasicMaterial({color:i%3===0?0xd5b2fa:0x8b849b,transparent:true,opacity:.38}))));}ring(g,2.6,[.5,.2,.3],.2);
    g=group('tools',-2.65,-1.9,.7);
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2,o=mesh(new RoundedBoxGeometry(.9,.9,.65,2,.08),ice(),g);o.position.set(Math.cos(a)*2,Math.sin(a)*1.6,Math.sin(a)*.5);o.rotation.set(.3,a,.25);o.userData.toolIndex=i;rim(o)}ring(g,2,[.2,.1,0],.35);crystal(g,.45,8);
    g=group('framework',-2.45,0,1.05);
    for(let i=0;i<3;i++){const o=mesh(new RoundedBoxGeometry(3,.36,2.15,2,.09),ice(),g);o.position.y=(i-1)*.95;o.rotation.set(.1,-.5,.04);rim(o);const bar=mesh(new THREE.BoxGeometry(2.6,.014,.014),light,o);bar.position.set(0,.01,1.08)}
    g=group('launch',-2.5,-1.0,.9);
    for(let i=0;i<3;i++){const o=mesh(new THREE.TorusGeometry(1.65-i*.22,.085,5,64,Math.PI*1.75),ice(),g);o.position.z=-i*.65;o.rotation.z=i*.5;rim(o)}crystal(g,.28,3);
    g=group('collective',-2.65,-1.1,.8);const wire=new THREE.LineSegments(geo(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2,1))),mat(new THREE.LineBasicMaterial({color:0xa590bc,transparent:true,opacity:.32})));g.add(wire);for(let i=0;i<14;i++){const a=i*2.399,o=mesh(new THREE.OctahedronGeometry(.05),light,g);o.position.set(Math.cos(a)*Math.sqrt(1-(i/7-1)**2)*2,(i/7-1)*2,Math.sin(a)*Math.sqrt(1-(i/7-1)**2)*2)}
    g=group('questions',3.1,-.2,.55);ring(g,2,[.5,.5,.1],.12);crystal(g,.7,7);
    g=group('contact',0,-1.4,.85);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const o=mesh(new THREE.CapsuleGeometry(.045,.65,3,6),ice(),g);o.position.set(Math.cos(a)*1.25,Math.sin(a)*1.25,0);o.rotation.z=a-Math.PI/2;}crystal(g,.25,9);ring(g,2.3,[.5,.4,.2],.14);
  }
  function makeParticles(){let seed=71;const random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};const positions=new Float32Array(540*3);for(let i=0;i<540;i++){positions[i*3]=(random()-.5)*30;positions[i*3+1]=(random()-.5)*18;positions[i*3+2]=-random()*20-3}const g=geo(new THREE.BufferGeometry());g.setAttribute('position',new THREE.BufferAttribute(positions,3));const m=mat(new THREE.PointsMaterial({size:.018,color:0xd9d4e3,transparent:true,opacity:.6,depthWrite:false}));const points=new THREE.Points(g,m);points.name='dust';scene.add(points)}
  function resize(){width=innerWidth;height=innerHeight;if(renderer){renderer.setSize(width,height,false);renderer.setPixelRatio(renderDpr);camera.aspect=width/height;camera.updateProjectionMatrix()}refresh();dirty=true}
  function refresh(){introTop=document.querySelector('#what-is-icypluto')?.offsetTop||0;anchors=[...document.querySelectorAll('[data-world]')].map(el=>({key:el.dataset.world,top:el.getBoundingClientRect().top+scrollY-90}));dirty=true}
  function pose(g,weight,progress,time){
    const d=g.userData,mobile=width<760;
    const x=mobile?0:d.x;
    const slots={intro:800,seo:800,aeo:870,geo:830,tools:520,framework:600,launch:540,collective:510,questions:1100,contact:550};
    const anchor=anchors.find(a=>a.key===d.key);
    const screenY=(anchor?.top||0)+90+(slots[d.key]||650)-scrollY;
    const pixelsPerUnit=height/(2*Math.tan(THREE.MathUtils.degToRad(39/2))*10);
    const y=mobile?(height*.5-screenY)/pixelsPerUnit:d.y;
    g.visible=weight>.006&&!(mobile&&d.key==='questions');if(!g.visible)return;
    const s=d.scale*(mobile?.6:1)*Math.pow(weight,.65);g.scale.setScalar(s);
    g.position.set(x+(1-weight)*(x<0?-1.2:1.2),y+(1-weight)*-.7,-(1-weight)*4);
    g.rotation.y=getMotion()?Math.sin(progress*1.3)*.18+time*.018:0;
    g.rotation.x=getMotion()?Math.sin(progress*2)*.055:0;
    const enabled=getMotion(),phase=enabled?progress:0;
    if(d.key==='seo'){
      g.rotation.y-=.48;g.rotation.z=-.08;
      const fan=smooth(phase)*.36;
      g.children.filter(o=>o.userData.pageIndex!==undefined).forEach(page=>{const i=page.userData.pageIndex;page.position.set((i-2)*(.25+fan),(i-2)*(.15+fan*.32),-i*(.42+fan*.3));page.rotation.z=(i-2)*(.025+fan*.13)});
      const scanner=g.getObjectByName('scan');if(scanner){const target=scanner.userData.inspect!==undefined?[.8,0,-.8][scanner.userData.inspect]:enabled?Math.sin(time*.85)*1.12:0;scanner.position.y=enabled?THREE.MathUtils.lerp(scanner.position.y,target,.09):target;}
    }
    if(d.key==='aeo'){
      const orbit=g.getObjectByName('signal-orbit');
      if(orbit){orbit.rotation.z=phase*.6;for(const segment of orbit.children){const angle=segment.userData.segmentAngle;if(angle===undefined)continue;const spread=(1-weight)*1.05;segment.position.set(Math.cos(angle)*spread,Math.sin(angle)*spread,Math.sin(angle*3)*.025);segment.rotation.z=angle+(1-weight)*.25;}}
    }
    if(d.key==='geo'){g.rotation.z=phase*.6+(enabled?Math.sin(time*.1)*.06:0);g.children.filter(o=>o.isMesh).forEach((node,i)=>{node.rotation.y=phase*.3+(enabled?time*.06:0)+i*.2;});}
    if(d.key==='collective')g.rotation.y=phase*.35+(enabled?time*.025:0);
    if(d.key==='tools')g.children.filter(o=>o.userData.toolIndex!==undefined).forEach(node=>{node.rotation.y=phase*.25+(enabled?Math.sin(time*.3+node.userData.toolIndex)*.15:0);});
    if(d.key==='framework')g.children.filter(o=>o.isMesh).forEach((o,i)=>{o.position.y=(i-1)*(.8+smooth(phase)*.55);o.rotation.y=-.5+(i-1)*Math.sin(phase*Math.PI)*.07});

  }
  function draw(now){raf=requestAnimationFrame(draw);if(disposed||document.hidden)return;const visible=scrollY>introTop-innerHeight*.98;host.classList.toggle('world-visible',visible);document.body.classList.toggle('in-world',visible&&scrollY>introTop-150);if(!visible){delete document.body.dataset.worldScene;activeKey=null;last=now;return;}
    if(!getMotion()&&!dirty)return;
    const interval=now-last;if(getMotion()&&interval>0&&interval<250){qualityTotal+=interval;qualityFrames++;if(qualityFrames>=120){const mean=qualityTotal/qualityFrames;if(mean>26&&renderDpr>.85){renderDpr=Math.max(.85,renderDpr-.15);renderer?.setPixelRatio(renderDpr)}qualityFrames=0;qualityTotal=0}}
    sceneY=getMotion()?THREE.MathUtils.lerp(sceneY,scrollY,1-Math.exp(-Math.min(Math.max(interval,1)/1000,.1)*10)):scrollY;
    const y=sceneY;let index=0;while(index<anchors.length-1&&y>anchors[index+1].top)index++;
    const a=anchors[index],b=anchors[Math.min(index+1,anchors.length-1)];if(!a)return;
    const distance=b.top-a.top;const t=distance?smooth(((y-a.top)/distance-.7)/.3):0;
    blendBackgrounds(a.key,b.key,getMotion()?t:(t>.5?1:0));
    const key=t>.5?b.key:a.key;if(activeKey!==key){activeKey=key;host.dataset.scene=key;document.body.dataset.worldScene=key;document.querySelectorAll('.world-nav a').forEach(link=>{const active=link.dataset.worldLink===key;link.classList.toggle('on',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')})}
    const time=getMotion()?now*.001:0;
    for(const [k,g] of objects){const weight=k===a.key?1-t:k===b.key?t:0;const ownIndex=anchors.findIndex(anchor=>anchor.key===k),own=anchors[ownIndex],next=anchors[ownIndex+1];const progress=own?clamp((y-own.top)/Math.max(height,(next?.top??own.top+height)-own.top)):0;pose(g,a.key===b.key&&k===a.key?1:weight,progress,time)}
    if(camera){camera.position.x=getMotion()?pointer.x*.12:0;camera.position.y=getMotion()?pointer.y*.08:0;camera.lookAt(0,0,0)}
    const dust=scene?.getObjectByName('dust');if(dust)dust.position.y=getMotion()?Math.sin(time*.06)*.12:0;
    host.style.setProperty('--world-travel',`${-Math.min(22,y/400)}px`);
    if(renderer){renderer.render(scene,camera);host.dataset.ready='true'}dirty=false;last=now;
  }
  function onInspect(event){const scan=objects.get('seo')?.getObjectByName('scan');if(scan)scan.userData.inspect=Number(event.detail);dirty=true}
  function onScroll(){dirty=true}function onPointer(e){pointer.x=e.clientX/width-.5;pointer.y=.5-e.clientY/height;dirty=true}function onVisibility(){dirty=true}
  try{renderer=new THREE.WebGLRenderer({canvas:host.querySelector('canvas'),alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x060609,.025);camera=new THREE.PerspectiveCamera(39,width/height,.1,100);camera.position.z=10;
    const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();environment=pmrem.fromScene(room,.05);scene.environment=environment.texture;room.dispose();pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xe6e6ed,0x16101e,.75));const key=new THREE.DirectionalLight(0xffffff,2.2);key.position.set(-3,5,5);scene.add(key);const rimLight=new THREE.DirectionalLight(0xbca0ed,1.8);rimLight.position.set(4,1,-2);scene.add(rimLight);makeObjects();makeParticles();host.classList.add('has-webgl');
  }catch(error){host.classList.add('world-fallback');console.info('IcyPluto world uses the landscape fallback:',error.message)}
  window.addEventListener('resize',resize);window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('pointermove',onPointer,{passive:true});document.addEventListener('visibilitychange',onVisibility);document.addEventListener('icypluto:inspect',onInspect);
  const layoutObserver=new ResizeObserver(refresh);layoutObserver.observe(document.querySelector('#main'));document.querySelectorAll('[data-world]').forEach(element=>layoutObserver.observe(element));
  resize();document.fonts.ready.then(refresh);raf=requestAnimationFrame(draw);
  return {refresh,dispose(){disposed=true;layoutObserver.disconnect();cancelAnimationFrame(raf);window.removeEventListener('resize',resize);window.removeEventListener('scroll',onScroll);window.removeEventListener('pointermove',onPointer);document.removeEventListener('visibilitychange',onVisibility);document.removeEventListener('icypluto:inspect',onInspect);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());environment?.dispose();renderer?.dispose();host.remove()}};
}

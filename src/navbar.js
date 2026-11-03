// Adapted from the user-supplied Nimbus UI Waterline navbar by guglielmogiannattasio.it.
// Original reference: components/liquid-navbar/user-reference.tsx
const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uDpr;uniform float uTime;uniform vec4 uPill;
uniform vec4 uBlob[6];uniform float uSy[6];uniform vec4 uRip[6];uniform vec3 uMouse;uniform float uDark;uniform float uAmb;
float sdRB(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float sdCap(vec2 p,vec4 B,float sy){p-=B.xy;p.y/=sy;p.x=max(abs(p.x)-B.z,0.);return(length(p)-B.w)*min(1.,sy);}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float dropD(vec2 p){float d=1e4;for(int i=0;i<6;i++){if(uBlob[i].w>.5){d=smin(d,sdCap(p,uBlob[i],uSy[i]),13.);}}return d;}
float pillD(vec2 p){vec2 h=uPill.zw*.5;return sdRB(p-uPill.xy-h,h,h.y);}
float lens(float d,float w){float t=clamp(-d/w,0.,1.);return sqrt(1.-(1.-t)*(1.-t));}
float waves(vec2 p){float w=0.;
 for(int i=0;i<6;i++){vec4 R=uRip[i];if(R.w>0.){float x=length(p-R.xy)-R.z*240.;w+=R.w*exp(-R.z*1.7)*sin(x*.3)*exp(-x*x/700.);}}
 vec2 m=p-uMouse.xy;w+=uMouse.z*3.6*exp(-dot(m,m)/1000.);
 w+=uAmb*(sin(p.x*.05+uTime*1.2)*.45+sin(p.x*.13-uTime*.85+p.y*.2)*.25);return w;}
float H(vec2 p){float dp=pillD(p);return lens(dp,uPill.w*.36)*2.4+lens(dropD(p),11.)*7.5+waves(p)*smoothstep(0.,7.,-dp);}
float caus(vec2 p,float t){vec2 q=p;float c=0.;for(int i=0;i<3;i++){q+=vec2(sin(q.y*1.1+t),cos(q.x*1.3-t*.7))*.6;c+=1./(1.+16.*abs(sin(q.x)*sin(q.y)));}return c/3.;}
void main(){
 vec2 p=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;
 float dp=pillD(p);float dd=dropD(p);
 float h0=H(p);vec3 n=normalize(vec3(h0-H(p+vec2(1.,0.)),h0-H(p+vec2(0.,1.)),1.));
 vec3 V=vec3(0.,0.,1.);
 float spec=pow(max(dot(reflect(-normalize(vec3(-.45,-.8,.85)),n),V),0.),70.);
 float spec2=pow(max(dot(reflect(-normalize(vec3(.6,.75,.7)),n),V),0.),22.)*.3;
 float fres=clamp((1.-n.z)*4.,0.,1.);
 vec3 irid=.5+.5*cos(6.2831*(vec3(0.,.33,.67)+fres*.85+p.x*.0028+uTime*.035));
 float pm=smoothstep(1.,-1.,dp);float dm=smoothstep(1.,-1.,dd)*smoothstep(1.,-2.,dp);
 float sh=smoothstep(9.,-9.,dropD(p-vec2(0.,5.)))*(1.-dm)*pm*(.11+.07*uDark);
 vec3 c=vec3(0.,.14,.36)*sh;float a=sh;
 float pa=clamp(pm*(fres*.5+spec*.9+spec2),0.,1.);
 c=mix(vec3(1.),irid,.5*fres)*pa+c*(1.-pa);a=pa+a*(1.-pa);
 float th=lens(dd,11.);
 float cs=caus((p+n.xy*th*18.)*.085,uTime*.9);
 vec3 tint=mix(vec3(.80,.95,1.),vec3(.55,.82,1.),uDark);
 float rim=dm*(1.-smoothstep(0.,8.,-dd));
 float cres=dm*smoothstep(.12,.55,dot(n.xy,normalize(vec2(.55,.85))))*smoothstep(0.,3.,-dd);
 float body=.5+.5*clamp(-n.y*3.,-1.,1.);
 float da=dm*(.26+.14*body)*(1.-.35*uDark);vec3 dc=mix(tint,vec3(1.),body*.6);
 float la=rim*.22;vec3 lc=mix(vec3(0.,.42,.78),vec3(.1,.55,.95),uDark);dc=lc*la+dc*da*(1.-la);da=la+da*(1.-la);
 la=clamp(cres*.7+smoothstep(.6,1.,cs)*.28*th*dm,0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
 la=clamp(dm*(spec*1.2+spec2*.5),0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
 la=dm*smoothstep(-2.,0.,dd)*.4;dc=mix(vec3(1.),irid,.35)*la+dc*(1.-la);da=la+da*(1.-la);
 c=dc+c*(1.-da);a=da+a*(1.-da);
 gl_FragColor=vec4(c,a);
}`;
export function initPillNavigation(getMotion) {
  const nav=document.querySelector('.water-nav'),canvas=nav.querySelector('canvas'),drop=nav.querySelector('.water-drop');
  const items=[...nav.querySelectorAll('.nav-item')],triggers=[...nav.querySelectorAll('[data-nav-trigger]')];
  const cleanup=[];const on=(e,t,fn,o)=>{e.addEventListener(t,fn,o);cleanup.push(()=>e.removeEventListener(t,fn,o));};
  let highlight=false;nav.dataset.highlight="off";
  let active=0,open=-1,raf=0,last=0,time=0,visible=true,disposed=false,dirty=true,gl,program,buffer,shaders=[],uniforms={};
  let x=0,tail=0,width=0,targetX=0,targetWidth=0,w=0,h=0,itemTop=0,ready=false,mouse={x:0,y:0,on:0},ripples=[];
  const PAD=14;
  function start(){dirty=true;if(!raf&&!disposed&&visible&&!document.hidden)raf=requestAnimationFrame(render);}
  function close(){open=-1;triggers.forEach(t=>{t.setAttribute('aria-expanded','false');document.getElementById(t.getAttribute('aria-controls')).hidden=true;});}
  function dismiss(){close();highlight=false;nav.dataset.highlight='off';mouse.on=0;ripples=[];start();}
  function activate(index){highlight=true;nav.dataset.highlight='on';measure(index);}
  function measure(index=active){active=index;const item=items[index];w=nav.offsetWidth;h=nav.offsetHeight;const rect=item.getBoundingClientRect(),navRect=nav.getBoundingClientRect();targetX=rect.left-navRect.left+rect.width/2+PAD;itemTop=rect.top-navRect.top;targetWidth=rect.width;
    if(!ready){x=tail=targetX;width=targetWidth;ready=true;}
    const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round((w+PAD*2)*dpr);canvas.height=Math.round((h+PAD*2)*dpr);canvas.style.width=`${w+PAD*2}px`;canvas.style.height=`${h+PAD*2}px`;start();
  }
  function initGL(){try{
    gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false});if(!gl)throw Error('No WebGL');
    program=gl.createProgram();for(const [type,source]of [[gl.VERTEX_SHADER,VERT],[gl.FRAGMENT_SHADER,FRAG]]){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));gl.attachShader(program,shader);shaders.push(shader);}
    gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Link failed');gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);const loc=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    for(const name of ['uRes','uDpr','uTime','uPill','uBlob','uSy','uRip','uMouse','uDark','uAmb'])uniforms[name]=gl.getUniformLocation(program,name);nav.dataset.gl='on';
  }catch{gl=null;nav.dataset.gl='off';}}
  function render(now){raf=0;if(disposed||!visible||document.hidden)return;const dt=Math.min((now-last)/1000,.05)||.016;last=now;time+=dt;const motion=getMotion();
    if(motion){x+=(targetX-x)*(1-Math.exp(-dt*15));tail+=(targetX-tail)*(1-Math.exp(-dt*7));width+=(targetWidth-width)*(1-Math.exp(-dt*12));}else{x=tail=targetX;width=targetWidth;}
    const radius=items[active].offsetHeight/2,half=Math.max(0,width/2-radius),cy=PAD+itemTop+radius;
    drop.style.width=`${width+Math.abs(x-tail)}px`;drop.style.height=`${radius*2}px`;drop.style.top=`${itemTop}px`;drop.style.transform=`translateX(${Math.min(x,tail)-width/2-PAD}px)`;
    ripples=ripples.filter(r=>now-r.at<2200);
    if(gl){gl.viewport(0,0,canvas.width,canvas.height);gl.useProgram(program);const u=uniforms;gl.uniform2f(u.uRes,w+PAD*2,h+PAD*2);gl.uniform1f(u.uDpr,Math.min(devicePixelRatio||1,1.5));gl.uniform1f(u.uTime,time);gl.uniform4f(u.uPill,PAD,PAD,w,h);
      const blobs=new Float32Array(24);blobs.set([x,cy,half,radius],0);blobs.set([tail,cy,half,radius],4);gl.uniform4fv(u.uBlob,blobs);gl.uniform1fv(u.uSy,new Float32Array([1,1,1,1,1,1]));
      const waves=new Float32Array(24);if(motion)ripples.slice(-6).forEach((r,i)=>waves.set([r.x,r.y,(now-r.at)/1000,r.amp],i*4));gl.uniform4fv(u.uRip,waves);gl.uniform3f(u.uMouse,mouse.x,mouse.y,motion?mouse.on:0);gl.uniform1f(u.uDark,1);gl.uniform1f(u.uAmb,motion?.35:0);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,3);
    }
    dirty=false;const moving=Math.abs(x-targetX)>.1||Math.abs(tail-targetX)>.1||Math.abs(width-targetWidth)>.1;
    if((motion&&highlight)||moving)raf=requestAnimationFrame(render);
  }
  items.forEach((item,i)=>{
    on(item,'pointerenter',()=>activate(i));on(item,'focus',()=>activate(i));
    on(item,'click',event=>{activate(i);const rect=nav.getBoundingClientRect();ripples.push({x:event.clientX?event.clientX-rect.left+PAD:targetX,y:PAD+h/2,at:performance.now(),amp:.7});start();
      if(item.hasAttribute('data-nav-trigger')){const index=Number(item.dataset.navTrigger),next=open===index?-1:index;close();if(next>=0){open=next;item.setAttribute('aria-expanded','true');document.getElementById(item.getAttribute('aria-controls')).hidden=false;}}else close();
    });
    on(item,'keydown',event=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?items.length-1:(i+(event.key==='ArrowRight'?1:-1)+items.length)%items.length;items[next].focus();}else if(event.key==='ArrowDown'&&item.hasAttribute('data-nav-trigger')){event.preventDefault();if(item.getAttribute('aria-expanded')!=='true')item.click();document.getElementById(item.getAttribute('aria-controls')).querySelector('a,button').focus();}});
  });
  on(nav,'pointermove',event=>{const rect=nav.getBoundingClientRect();mouse={x:event.clientX-rect.left+PAD,y:event.clientY-rect.top+PAD,on:1};start();});on(nav,'pointerleave',()=>{mouse.on=0;start();});
  on(nav,'click',event=>{if(event.target.closest('.nav-panel a,.nav-panel button'))close();});
  on(document,'click',event=>{if(!nav.contains(event.target))dismiss();});
  on(document,'keydown',event=>{if(event.key==='Escape'&&open>=0){const trigger=triggers[open];close();trigger.focus();}});
  on(nav,'focusout',event=>{if(!nav.contains(event.relatedTarget))dismiss();});
  on(window,'resize',()=>{close();measure();});on(document,'visibilitychange',()=>{if(!document.hidden)start();});
  on(canvas,'webglcontextlost',event=>{event.preventDefault();gl=null;nav.dataset.gl='off';start();});
  const observer=new ResizeObserver(()=>measure());observer.observe(nav);document.fonts.ready.then(()=>{if(!disposed)measure();});
  const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else{cancelAnimationFrame(raf);raf=0;}});io.observe(nav);
  const motionObserver=new MutationObserver(()=>start());motionObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
  initGL();measure();
  return {close:dismiss,dispose(){disposed=true;cancelAnimationFrame(raf);cleanup.forEach(fn=>fn());observer.disconnect();io.disconnect();motionObserver.disconnect();if(gl){gl.deleteBuffer(buffer);shaders.forEach(s=>gl.deleteShader(s));gl.deleteProgram(program);}}};
}

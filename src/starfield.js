// A dense, fine-grained violet galaxy and subtle moving stars, confined to the hero.
export function startStarfield(getMotion) {
  const hero=document.querySelector('.pluto-hero');if(!hero)return()=>{};
  const canvas=document.createElement('canvas');canvas.id='starfield';canvas.setAttribute('aria-hidden','true');hero.querySelector('.ph-sky').after(canvas);
  const ctx=canvas.getContext('2d',{alpha:true});if(!ctx){canvas.remove();return()=>{};}
  let width=0,height=0,particles=[],frame=0,last=0,elapsed=0,visible=true,disposed=false;
  let pointerX=0,pointerY=0;
  const glow=document.createElement('canvas');glow.width=glow.height=64;
  // Keep the cached galaxy on its own compositor layer; animate only its transform.
  const galaxy=document.createElement('canvas');galaxy.className='ph-galaxy';galaxy.setAttribute('aria-hidden','true');canvas.before(galaxy);
  const gc=glow.getContext('2d');if(gc){const g=gc.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.08,'rgba(255,255,255,.65)');g.addColorStop(.22,'rgba(245,246,255,.16)');g.addColorStop(.5,'rgba(235,235,255,.035)');g.addColorStop(1,'rgba(255,255,255,0)');gc.fillStyle=g;gc.fillRect(0,0,64,64);}
  const hash=(x,y)=>{let n=Math.imul(x,374761393)+Math.imul(y,668265263);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;};
  function noise(x,y){const ix=Math.floor(x),iy=Math.floor(y);let tx=x-ix,ty=y-iy;tx=tx*tx*(3-2*tx);ty=ty*ty*(3-2*ty);const a=hash(ix,iy),b=hash(ix+1,iy),c=hash(ix,iy+1),d=hash(ix+1,iy+1);return(a+(b-a)*tx)*(1-ty)+(c+(d-c)*tx)*ty;}
  const bandY=x=>.46+x*.29+Math.sin(x*5)*.055;
  function buildGalaxy(random,dpr){
    galaxy.width=Math.round(width*dpr);galaxy.height=Math.round(height*dpr);const layer=galaxy.getContext('2d');if(!layer)return;layer.setTransform(dpr,0,0,dpr,0,0);
    const cloud=document.createElement('canvas');cloud.width=Math.min(420,Math.ceil(width/4));cloud.height=Math.min(300,Math.ceil(height/4));const cc=cloud.getContext('2d');
    if(cc){const pixels=cc.createImageData(cloud.width,cloud.height);for(let y=0;y<cloud.height;y++)for(let x=0;x<cloud.width;x++){
      const nx=x/cloud.width,ny=y/cloud.height;let field=0,amp=.54,freq=1;
      for(let octave=0;octave<5;octave++){field+=noise(nx*5*freq+17,ny*7*freq+31)*amp;freq*=2.05;amp*=.49;}
      const distance=(ny-bandY(nx))/.17,band=Math.exp(-distance*distance)*(1-nx*.26);
      const density=Math.max(0,(field-.24)*1.6)*band,index=(y*cloud.width+x)*4;
      pixels.data[index]=72+field*28;pixels.data[index+1]=8+field*5;pixels.data[index+2]=98+field*36;pixels.data[index+3]=Math.min(105,density*175);
    }cc.putImageData(pixels,0,0);layer.drawImage(cloud,0,0,width,height);}
    const colors=['241,222,231','202,165,226','248,229,209','187,160,215'];
    const count=Math.min(4600,Math.max(1100,Math.floor(width*height/380)));
    for(let i=0;i<count;i++){
      const nx=random(),clustered=random()<.5,ny=clustered?bandY(nx)+(random()+random()+random()-1.5)*.19:random();
      if(ny<0||ny>1)continue;const x=nx*width,y=ny*height,r=.2+random()**3*.9,alpha=.12+random()**2*.72;
      if(r>.75){const size=r*7;layer.globalAlpha=alpha*.4;layer.drawImage(glow,x-size/2,y-size/2,size,size);}
      layer.globalAlpha=1;layer.fillStyle=`rgba(${colors[Math.floor(random()*colors.length)]},${alpha})`;layer.beginPath();layer.arc(x,y,r,0,Math.PI*2);layer.fill();
    }
    layer.globalAlpha=1;
  }
  function start(){if(!frame&&!disposed&&visible&&!document.hidden&&!hero.classList.contains('ph-on-surface')){last=performance.now();frame=requestAnimationFrame(render);}}
  function resize(){width=hero.clientWidth;height=hero.clientHeight;if(!width||!height)return;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    let seed=134340;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
    buildGalaxy(random,dpr);
    particles=Array.from({length:Math.min(85,Math.max(26,Math.floor(width*height/17000)))},()=>({x:random()*width,y:random()*height,r:.25+random()**2*1.1,alpha:.26+random()*.52,phase:random()*Math.PI*2,depth:.2+random()*.8,vx:(random()-.35)*4,vy:-.8-random()*3.5,flare:random()>.98}));start();
  }
  function render(time){frame=0;if(disposed||!visible||document.hidden||hero.classList.contains('ph-on-surface'))return;

    const dt=Math.min((time-last)/1000,.12);last=time;const moving=getMotion();if(moving)elapsed+=dt;
    ctx.clearRect(0,0,width,height);
    const driftX=moving?Math.sin(elapsed*.025)*4+pointerX*2:0,driftY=moving?Math.cos(elapsed*.02)*2:0;
    galaxy.style.transform=`translate3d(${driftX}px,${driftY}px,0)`;
    for(const p of particles){
      const x=((p.x+(moving?elapsed*p.vx+Math.sin(elapsed*.16+p.phase)*4+pointerX*p.depth*7:0))%(width+40)+width+40)%(width+40)-20;
      const y=((p.y+(moving?elapsed*p.vy+pointerY*p.depth*5:0))%(height+40)+height+40)%(height+40)-20;
      const light=p.alpha*(moving?.78+Math.sin(elapsed*.7+p.phase)*.22:1),halo=p.r*(p.flare?24:15);
      ctx.globalAlpha=light;ctx.drawImage(glow,x-halo*.5,y-halo*.5,halo,halo);
      ctx.fillStyle='rgba(255,255,255,.9)';ctx.beginPath();ctx.arc(x,y,Math.max(.3,p.r*.43),0,Math.PI*2);ctx.fill();
      if(p.flare){const arm=5+p.r*4;const line=ctx.createRadialGradient(x,y,0,x,y,arm);line.addColorStop(0,'rgba(255,255,255,.7)');line.addColorStop(1,'rgba(255,255,255,0)');ctx.strokeStyle=line;ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(x-arm,y);ctx.lineTo(x+arm,y);ctx.moveTo(x,y-arm);ctx.lineTo(x,y+arm);ctx.stroke();}
    }
    ctx.globalAlpha=1;if(moving)frame=requestAnimationFrame(render);
  }
  const pointer=event=>{if(!getMotion())return;const rect=hero.getBoundingClientRect();pointerX=(event.clientX-rect.left)/width-.5;pointerY=(event.clientY-rect.top)/height-.5;start();};
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else start();};
  const bounds=new ResizeObserver(resize);bounds.observe(hero);
  const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else{cancelAnimationFrame(frame);frame=0;}},{threshold:0});io.observe(hero);
  const motion=new MutationObserver(start);motion.observe(document.body,{attributes:true,attributeFilter:['class']});motion.observe(hero,{attributes:true,attributeFilter:['class']});
  hero.addEventListener('pointermove',pointer,{passive:true});document.addEventListener('visibilitychange',visibility);resize();
  return()=>{disposed=true;cancelAnimationFrame(frame);bounds.disconnect();io.disconnect();motion.disconnect();hero.removeEventListener('pointermove',pointer);document.removeEventListener('visibilitychange',visibility);canvas.remove();galaxy.remove();};
}

// Shared texture preparation. The worker handles the large map without blocking UI.
export function paintPlutoMap(canvas,image,maxWidth=4096){
 const sourceWidth=image.width||image.naturalWidth;
 const w=Math.min(sourceWidth,maxWidth),h=Math.round(w/2),scale=w/1600;
 canvas.width=w;canvas.height=h;const context=canvas.getContext('2d',{willReadFrequently:true});if(!context)throw Error('No 2D texture context');
 context.imageSmoothingQuality='high';context.drawImage(image,0,0,w,h);
 const pixels=context.getImageData(0,0,w,h),data=pixels.data;
 const mix=(a,b,t)=>a+(b-a)*t,segment=(v,a,b)=>Math.max(0,Math.min(1,(v-a)/(b-a))),ease=t=>t<.5?4*t*t*t:1-(-2*t+2)**3/2;
 // Artistic completion of the unphotographed south, preserving all valid coverage.
 for(let x=0;x<w;x++){
  let valid=h-1;while(valid>h/2&&data[(valid*w+x)*4]+data[(valid*w+x)*4+1]+data[(valid*w+x)*4+2]<80)valid--;
  const begin=Math.max(0,valid-Math.round(52*scale)),reference=Math.min(valid-55*scale,495*scale);
  for(let y=begin;y<h;y++){
   const sy=Math.max(Math.round(160*scale),Math.floor(reference-(y-begin)*.73));
   const blend=ease(segment(y,begin,valid-8*scale)),to=(y*w+x)*4,from=(sy*w+x)*4;
   // Sample from untouched rows above the blend: no second full-size pixel buffer.
   for(let c=0;c<3;c++)data[to+c]=mix(data[to+c],data[from+c],blend);data[to+3]=255;
  }
 }
 const seam=Math.round(96*scale);
 for(let y=0;y<h;y++)for(let x=0;x<seam;x++){
  const weight=(1-(1-(x/seam))**3),blend=(1-weight)*.5,left=(y*w+x)*4,right=(y*w+w-1-x)*4;
  for(let c=0;c<3;c++){const a=data[left+c],b=data[right+c];data[left+c]=mix(a,b,blend);data[right+c]=mix(b,a,blend);}
 }
 context.putImageData(pixels,0,0);
 const fade=Math.round(20*scale);
 for(const top of[true,false]){const gradient=context.createLinearGradient(0,top?0:h,0,top?fade:h-fade);gradient.addColorStop(0,top?'#c9bcac':'#9a8577');gradient.addColorStop(1,'transparent');context.fillStyle=gradient;context.fillRect(0,top?0:h-fade,w,fade);}
 return canvas;
}

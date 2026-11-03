import {paintPlutoMap} from './pluto-texture.js';
self.onmessage=async({data})=>{
 let source;
 try{
  const response=await fetch(data.url);if(!response.ok)throw Error('Texture download failed');
  source=await createImageBitmap(await response.blob());
  const canvas=paintPlutoMap(new OffscreenCanvas(1,1),source,data.maxWidth);source.close();source=null;
  // Three.js cannot flip ImageBitmap uploads; perform the flip when creating it.
  const bitmap=await createImageBitmap(canvas,{imageOrientation:'flipY'});
  self.postMessage({bitmap},[bitmap]);
 }catch(error){source?.close();self.postMessage({error:String(error)});}
};

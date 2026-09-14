// Cache display portraits from loaded game frames. No gameplay texture mutation.
export function menuPortraits(scene){
 const cache=new Map();
 return character=>{
  if(cache.has(character.texture))return cache.get(character.texture);
  const f=scene.textures.getFrame(character.texture,'cell0'),source=document.createElement('canvas');source.width=f.cutWidth;source.height=f.cutHeight;
  const g=source.getContext('2d');g.drawImage(f.source.image,f.cutX,f.cutY,f.cutWidth,f.cutHeight,0,0,f.cutWidth,f.cutHeight);
  const pixels=g.getImageData(0,0,source.width,source.height).data;let left=source.width,top=source.height,right=0,bottom=0;
  for(let y=0;y<source.height;y++)for(let x=0;x<source.width;x++)if(pixels[(y*source.width+x)*4+3]>32){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  const out=document.createElement('canvas');out.width=192;out.height=240;const ctx=out.getContext('2d');ctx.imageSmoothingEnabled=false;
  if(right>=left&&bottom>=top){const w=right-left+1,h=bottom-top+1,scale=Math.min(176/w,224/h);ctx.drawImage(source,left,top,w,h,(192-w*scale)/2,232-h*scale,w*scale,h*scale);}
  const url=out.toDataURL();cache.set(character.texture,url);return url;
 };
}

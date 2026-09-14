// Decode exterior matte pixels once at load time, never during gameplay.
export function prepareRecruits(scene,characters,sourceKey="recruits",ids=["castellan","bellkeeper","scholar"],rowStops=[0,390/1086,734/1086,1]){const source=scene.textures.get(sourceKey).getSourceImage(),canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,0,0);const data=ctx.getImageData(0,0,canvas.width,canvas.height),d=data.data,w=canvas.width,h=canvas.height,seen=new Uint8Array(w*h),queue=new Int32Array(w*h);let head=0,tail=0;
 const visit=i=>{if(i<0||i>=w*h||seen[i])return;seen[i]=1;const k=i*4,min=Math.min(d[k],d[k+1],d[k+2]),max=Math.max(d[k],d[k+1],d[k+2]);if(min<160||max-min>24)return;d[k+3]=0;queue[tail++]=i;};
 for(let x=0;x<w;x++){visit(x);visit((h-1)*w+x);}for(let y=0;y<h;y++){visit(y*w);visit(y*w+w-1);}while(head<tail){const i=queue[head++],x=i%w;if(x)visit(i-1);if(x<w-1)visit(i+1);visit(i-w);visit(i+w);}ctx.putImageData(data,0,0);
 const rows=rowStops.map(n=>Math.round(n*h));
 for(const id of ids){const c=characters[id],row=c.starterRow??c.portraitRow,t=scene.textures.createCanvas(id,1536,384),out=t.context;out.imageSmoothingEnabled=false;
  const bounds=[];for(let f=0;f<4;f++){const left=Math.round(f*w/4),right=Math.round((f+1)*w/4);let x0=right,x1=left,y0=rows[row+1],y1=rows[row];for(let y=rows[row];y<rows[row+1];y++)for(let x=left;x<right;x++)if(d[(y*w+x)*4+3]){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}bounds.push({x0,y0,width:x1-x0+1,height:y1-y0+1});}
  const scale=Math.min(324/Math.max(...bounds.map(b=>b.height)),344/Math.max(...bounds.map(b=>b.width)));
  bounds.forEach((b,f)=>{const dw=b.width*scale,dh=b.height*scale;out.drawImage(canvas,b.x0,b.y0,b.width,b.height,f*384+(384-dw)/2,360-dh,dw,dh);t.add('cell'+f,0,f*384,0,384,384);});t.refresh();scene.anims.create({key:c.walk,frames:[0,1,2,3].map(n=>({key:id,frame:'cell'+n})),frameRate:7,repeat:-1});
 }
}

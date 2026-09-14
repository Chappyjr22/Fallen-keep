// Authority-side return policy shared by solo and co-op. No health or rewards reset.
export const BOSS_RETURN_SECONDS=2.5;
export function viewSize(v){return {width:Math.max(320,Math.min(4000,Number(v?.width)||1280)),height:Math.max(240,Math.min(2400,Number(v?.height)||720))};}
export function playerView(p,map,size){const v=viewSize(size),w=Math.min(map.w,v.width),h=Math.min(map.h,v.height);return {x:Math.max(0,Math.min(map.w-w,p.x-w/2)),y:Math.max(0,Math.min(map.h-h,p.y-h/2)),width:w,height:h};}
export function bossReturn(e,point,views,players,dt,valid){
 if(e.dead||e.royalArt===4||e.royal?.startsWith('banner'))return null;
 const margin=(e.size||100)/2;
 if(views.some(v=>point.x>=v.x-margin&&point.x<=v.x+v.width+margin&&point.y>=v.y-margin&&point.y<=v.y+v.height+margin)){e.offscreenFor=0;return null;}
 e.offscreenFor=(e.offscreenFor||0)+dt;if(e.offscreenFor<BOSS_RETURN_SECONDS)return null;
 // Search the near edge first, but require a safe landing away from every hero.
 const candidates=[];
 for(const v of views){const inset=32;for(let i=0;i<=16;i++){const t=i/16;for(const q of [{x:v.x+inset+t*(v.width-2*inset),y:v.y+inset},{x:v.x+inset+t*(v.width-2*inset),y:v.y+v.height-inset},{x:v.x+inset,y:v.y+inset+t*(v.height-2*inset)},{x:v.x+v.width-inset,y:v.y+inset+t*(v.height-2*inset)}])if(players.every(p=>Math.hypot(q.x-p.x,q.y-p.y)>=Math.max(300,margin+180))&&valid(q))candidates.push(q);}}
 candidates.sort((a,b)=>Math.hypot(a.x-point.x,a.y-point.y)-Math.hypot(b.x-point.x,b.y-point.y));
 if(!candidates.length){e.offscreenFor=2;return null;}
 e.offscreenFor=0;e.returnGrace=1;e.charge=null;e.royalCast=Math.max(e.royalCast||0,2);e.cast=Math.max(e.cast||0,2);e.sealCast=Math.max(e.sealCast||0,2);return candidates[0];
}

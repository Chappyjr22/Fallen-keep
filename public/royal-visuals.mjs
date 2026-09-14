import {CLAIMS,BANNERS,FOUNTAIN,claimsComplete} from './royal-objectives.mjs';
import {KING_STAIR} from './royal-interior.mjs';
export function drawClaimGround(g,mapId,s,time){if(mapId!=='firstfloor')return;for(const q of CLAIMS){const done=q.id==='banners'?s.champion===2:s[q.id]===2;const color=q.id==='tome'?0x9cdef0:q.id==='banners'?0xdb9de6:0xe9b76b;g.lineStyle(done?4:2,done?0x91b599:color,done?.75:.65).strokeEllipse(q.x,q.y,110,45);if(q.id==='tome'&&s.tome===1){g.lineStyle(3,0x78cbbb,.65).strokeCircle(q.x,q.y,260);g.lineStyle(7,0xe3c276,.9).beginPath().arc(q.x,q.y,260,-Math.PI/2,-Math.PI/2+Math.PI*2*s.ritual/60).strokePath();}}g.lineStyle(3,0x83ddcf,.55+Math.sin(time*2)*.15).strokeEllipse(FOUNTAIN.x,FOUNTAIN.y,95,40);const open=claimsComplete(s);for(let i=0;i<3;i++){const done=[s.west===2&&s.east===2,s.tome===2,s.champion===2][i];const color=[0xe9b76b,0x9cdef0,0xdb9de6][i];g.lineStyle(3,done?0x91b599:color,.85).strokeCircle(KING_STAIR.x+140,KING_STAIR.y-110+i*40,12);if(!done){g.lineStyle(4,color,.3+Math.sin(time*2+i)*.1).lineBetween(KING_STAIR.x+190+i*22,KING_STAIR.y-145,KING_STAIR.x+190+i*22,KING_STAIR.y+25);}else g.fillStyle(0x91b599,.65).fillCircle(KING_STAIR.x+140,KING_STAIR.y-110+i*40,6);}if(open)g.lineStyle(4,0xe5c876,.7).strokeEllipse(KING_STAIR.approach.x,KING_STAIR.approach.y,100,45);}

export function idleCaptains(mapId,claims){return mapId==='firstfloor'?CLAIMS.filter(q=>(q.id==='west'||q.id==='east')&&(claims?.[q.id]??0)===0):[];}
export function syncIdleRoyalObjectives(scene,mapId,claims){
 const previews=scene.royalPreviews??=new Map(),idle=idleRoyalObjectives(mapId,claims),wanted=new Set(idle.map(q=>q.id));
 for(const [id,sprite] of previews)if(!wanted.has(id)){sprite.destroy();previews.delete(id);}
 for(const q of idle)if(!previews.has(q.id))previews.set(q.id,scene.add.image(q.x,q.y,q.texture,q.frame).setDisplaySize(q.w,q.h).setOrigin(.5,.95).setDepth(q.y));
}

export function idleRoyalObjectives(mapId,claims){
 const actors=idleCaptains(mapId,claims).map(q=>({...q,texture:'royal-enemies',frame:'cell'+q.art,w:130,h:130}));
 if(mapId==='firstfloor'&&(claims?.banners??0)===0)for(const [i,q] of BANNERS.entries())actors.push({...q,id:'banner'+i,texture:'royal-props',frame:'cell0',w:130,h:190});
 return actors;
}

// Short combat effects remain in network snapshots briefly after expiry. Guests
// play each ID once, so a slow relay cannot erase an entire slash or lightning bolt.
export class EffectTimeline{
 constructor(){this.active=new Map();this.seen=new Set();}
 update(incoming,dt,paused=false){
  for(const [id,f] of this.active){if(!paused)f.t-=dt;if(f.t<=0)this.active.delete(id);}
  for(const f of incoming)if(!this.seen.has(f.id)){this.seen.add(f.id);this.active.set(f.id,{...f,t:Math.max(f.t,Math.min(.16,f.life||.22))});}
  const retained=new Set([...incoming.map(f=>f.id),...this.active.keys()]);for(const id of this.seen)if(!retained.has(id))this.seen.delete(id);
  return [...this.active.values()];
 }
}
export function enemyPresentation(e){if(e.royal)return {texture:e.royalArt===4?'royal-props':'royal-enemies',frame:'cell'+(e.royalArt===4?0:e.royalArt),origin:.95,animation:null,tint:e.flash>0?0xffffff:null,healthBar:true,healthColor:0xb14051};const row=e.type+1,guardian=e.seal?(e.seal===1?0:e.seal===2?1:2):null;return {
 texture:e.tier==='breakable'?'rewards':e.seal?'guardians':'characters',
 frame:'cell'+(e.tier==='breakable'?4+e.type:e.seal?guardian*4:row*4),
 origin:e.tier==='breakable'?.9:e.seal?.93:row===2?.85:row===3?.86:.93,
 animation:e.tier==='breakable'?null:e.seal?'guardianWalk'+guardian:'walk'+row,
 tint:e.flash>0?0xffffff:e.tier==='elite'?0xe7c785:e.tier==='veteran'?0xc4a0ea:e.tier==='boss'&&!e.seal?0x96e7e6:null,
 healthBar:e.tier==='boss'||e.tier==='elite'||e.tier==='veteran'&&e.hp<e.maxHp,
 healthColor:e.tier==='boss'?0xb14051:e.tier==='veteran'?0xa77dce:0xd9b966
};}
export function drawChestBeacon(g,l,time){const x=l.x,y=l.y-14,pulse=(Math.sin(time*3+l.id)+1)/2;g.fillStyle(0xffd66f,.07+pulse*.03).fillRect(x-19,y-210,38,210).fillStyle(0xffd66f,.13).fillRect(x-9,y-210,18,210).fillStyle(0xffefbe,.23+pulse*.1).fillRect(x-3,y-210,6,210).lineStyle(2,0xffd976,.5).strokeEllipse(x,y+12,48+pulse*8,17+pulse*4);for(let k=0;k<6;k++){const phase=(time*.3+k/6+l.id*.13)%1;g.fillStyle(0xffedb0,(1-phase)*.7).fillCircle(x+Math.sin(k*2.3+l.id)*14,y-phase*205,1.5);}}

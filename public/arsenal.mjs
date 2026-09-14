import {FINAL_ITEMS,FINAL_RECIPES,castFinalEvolutions,drawFinalEvolution} from './final-evolutions.mjs';
import {CROWN_ITEMS,CROWN_RECIPE,castCrownWeapon,drawCrownEffect} from './crownless.mjs';
// Shared attack definitions keep solo and co-op damage, scaling and patterns aligned.
export const ARSENAL_ITEMS={...FINAL_ITEMS,...CROWN_ITEMS,
 halberd:{name:'Royal Halberd',kind:'weapon',max:8,arsenalIcon:0,desc:'Thrusts through a long, narrow line of enemies.',upgrade:'Longer reach, more damage and additional thrusts.'},
 bell:{name:'Storm Bell',kind:'weapon',max:8,arsenalIcon:1,desc:'Calls lightning that chains between nearby enemies.',upgrade:'More chain targets, greater damage and faster strikes.'},
 tome:{name:'Cinder Tome',kind:'weapon',max:8,arsenalIcon:2,desc:'Calls down firebursts on nearby enemies, damaging groups.',upgrade:'More firebursts, wider blasts and greater damage.'},
 reckoning:{name:'Crown’s Reckoning',kind:'weapon',max:1,arsenalIcon:3,evolved:true,desc:'Spectral halberds erupt in every direction, piercing the surrounding horde.'},
 tempest:{name:'Tempest Choir',kind:'weapon',max:1,arsenalIcon:4,evolved:true,desc:'Several lightning chains leap through the horde. Each chain strikes a target only once.'},
 covenant:{name:'Ashen Covenant',kind:'weapon',max:1,arsenalIcon:5,evolved:true,desc:'Large fire eruptions scorch several targets and leave burning ground.'}
};
export const ARSENAL_RECIPES=[...FINAL_RECIPES,CROWN_RECIPE,
 {id:'reckoning',requires:{halberd:8,might:1},consume:['halberd'],label:'Royal Halberd VIII + Iron Oath'},
 {id:'tempest',requires:{bell:8,echo:1},consume:['bell'],label:'Storm Bell VIII + Echo Shard'},
 {id:'covenant',requires:{tome:8,vitality:1},consume:['tome'],label:'Cinder Tome VIII + Crimson Heart'}
];
export const ARSENAL_MASTERY={crownshards:'Mastery: +40% damage and one extra blade.',halberd:'Mastery: +40% damage, +45 reach and one extra thrust.',bell:'Mastery: +40% damage and two extra chain targets.',tome:'Mastery: +40% blast damage, +20 blast radius and an extra eruption.'};
export function arsenalStats(id,level,stats){const master=level===8,area=stats.area||1,amount=stats.amount||0;switch(id){
 case 'halberd':case 'reckoning':{const evolved=id==='reckoning';return {count:Math.min(16,(evolved?8:1+Math.floor((level-1)/3)+(master?1:0))+amount),range:(evolved?300:145+level*10+(master?45:0))*area,width:(evolved?30:17+level)*area,damage:evolved?125:(22+level*8)*(master?1.4:1),cooldown:evolved?1.6:2-level*.08};}
 case 'bell':case 'tempest':{const evolved=id==='tempest';return {chains:Math.min(6,(evolved?3:1)+Math.floor(amount/2)),jumps:Math.min(14,(evolved?9:2+Math.floor(level/2)+(master?2:0))+amount),range:600,hop:(evolved?250:150+level*8)*area,damage:evolved?105:(16+level*7)*(master?1.4:1),cooldown:evolved?2.1:3.2-level*.12};}
 case 'tome':case 'covenant':{const evolved=id==='covenant';return {count:Math.min(12,(evolved?5:1+Math.floor((level-1)/3)+(master?1:0))+amount),range:550,radius:(evolved?112:40+level*5+(master?20:0))*area,damage:evolved?145:(20+level*8)*(master?1.4:1),cooldown:evolved?3:3.8-level*.1,duration:evolved?4*(stats.duration||1):0,burn:evolved?35:0};}
}}
export function inThrust(origin,target,angle,range,width,radius=0){const dx=target.x-origin.x,dy=target.y-origin.y,along=dx*Math.cos(angle)+dy*Math.sin(angle),across=Math.abs(-dx*Math.sin(angle)+dy*Math.cos(angle));return along>=-radius&&along<=range+radius&&across<=width+radius;}
let effectId=0;
export function castArsenal(ctx){castFinalEvolutions(ctx);castCrownWeapon(ctx);const {inv,cool,stats,position:pos,targets,point,dead,radius,damage,effect,pool,clear}=ctx;if(![['halberd','reckoning'],['bell','tempest'],['tome','covenant']].some(([base,evo])=>(inv[base]||inv[evo])&&!(cool[base]>0)))return;const alive=()=>targets.filter(e=>!dead(e));const sorted=alive().sort((a,b)=>Math.hypot(point(a).x-pos.x,point(a).y-pos.y)-Math.hypot(point(b).x-pos.x,point(b).y-pos.y));const nearest=sorted.find(e=>Math.hypot(point(e).x-pos.x,point(e).y-pos.y)<600&&clear(pos,point(e)));const emit=e=>effect({id:'arsenal'+(++effectId),x:pos.x,y:pos.y,...e});
 for(const [base,evolved] of [['halberd','reckoning'],['bell','tempest'],['tome','covenant']]){const id=inv[evolved]?evolved:base,level=inv[base]||8;if(!inv[id]||(cool[base]||0)>0)continue;if(base!=='halberd'&&!nearest)continue;const q=arsenalStats(id,level,stats);cool[base]=q.cooldown;const target=nearest?point(nearest):null,a=target?Math.atan2(target.y-pos.y,target.x-pos.x):ctx.facing;
  if(base==='halberd'){for(let i=0;i<q.count;i++){const angle=id===evolved?a+i*Math.PI*2/q.count:a+(i-(q.count-1)/2)*.18;emit({kind:id,a:angle,r:q.range,t:.28});for(const e of alive())if(inThrust(pos,point(e),angle,q.range,q.width,radius(e))&&clear(pos,point(e)))damage(e,q.damage*stats.damage);}}
  if(base==='bell'){const starters=sorted.filter(e=>!dead(e)&&Math.hypot(point(e).x-pos.x,point(e).y-pos.y)<=q.range&&clear(pos,point(e))).slice(0,q.chains);for(const first of starters){let next=first,from=pos;const visited=new Set();for(let hop=0;hop<q.jumps&&next;hop++){const to={...point(next)};visited.add(next);emit({kind:'lightning',x:from.x,y:from.y,toX:to.x,toY:to.y,r:0,t:.24});damage(next,q.damage*stats.damage*Math.pow(.92,hop));from=to;next=alive().filter(e=>!visited.has(e)&&Math.hypot(point(e).x-from.x,point(e).y-from.y)<=q.hop&&clear(from,point(e))).sort((a,b)=>Math.hypot(point(a).x-from.x,point(a).y-from.y)-Math.hypot(point(b).x-from.x,point(b).y-from.y))[0];}}}
  if(base==='tome'){const points=sorted.filter(e=>!dead(e)&&Math.hypot(point(e).x-pos.x,point(e).y-pos.y)<=q.range&&clear(pos,point(e))).slice(0,q.count).map(e=>({...point(e)}));for(const at of points){emit({kind:'fireburst',x:at.x,y:at.y,r:q.radius,t:1.35,life:1.35});for(const e of alive())if(Math.hypot(point(e).x-at.x,point(e).y-at.y)<q.radius+radius(e)&&clear(at,point(e)))damage(e,q.damage*stats.damage);if(q.duration)pool({x:at.x,y:at.y,r:q.radius*.8,duration:q.duration,damage:q.burn*stats.damage,kind:'fire'});}}
 }
}
export function drawArsenalEffects(g,effects,drawIcon){for(const f of effects){if(drawFinalEvolution(g,f))continue;if(f.kind==='repulse'){g.lineStyle(3,0x91d7ff,Math.max(0,f.t/.35)).strokeCircle(f.x,f.y,f.r*(1-f.t/.35));continue;}if(f.kind==='crownblade'||f.kind==='crownnova'){drawCrownEffect(g,f,drawIcon);continue;}if(f.kind==='halberd'||f.kind==='reckoning'){const reach=f.r*(1-f.t/.28),x=f.x+Math.cos(f.a)*reach,y=f.y+Math.sin(f.a)*reach;g.lineStyle(f.kind==='reckoning'?8:5,f.kind==='reckoning'?0xffdf83:0xc4dce6,Math.max(0,f.t/.28)).lineBetween(f.x,f.y,x,y);drawIcon?.(f,x,y,f.kind==='reckoning'?3:0,f.a);}
 else if(f.kind==='lightning'){const dx=f.toX-f.x,dy=f.toY-f.y,n=Math.hypot(dx,dy)||1;g.lineStyle(5,0x5aaeff,Math.max(0,f.t/.24)*.65).beginPath().moveTo(f.x,f.y);for(let i=1;i<6;i++){const zig=(i%2?1:-1)*9;g.lineTo(f.x+dx*i/6-dy/n*zig,f.y+dy*i/6+dx/n*zig);}g.lineTo(f.toX,f.toY).strokePath();g.lineStyle(1,0xe2f7ff,.9).lineBetween(f.x,f.y,f.toX,f.toY);}
 else if(f.kind==='fireburst')drawFire(g,f,Math.max(0,(f.life||1.35)-f.t),Math.min(1,f.t/.55));
}}
// Bounded, deterministic pixel particles: no per-frame sprites or random allocations.
// Burst flame rises quickly, then settles into drifting embers over 1.35 seconds.
export function drawFire(g,f,age,fade=1,persistent=false){
 const r=f.r,px=n=>Math.round(n/3)*3,seed=f.x*.017+f.y*.031;
 const bloom=persistent?1:Math.min(1,.35+age*5),heat=persistent?1:Math.max(0,1-age/.95);
 const flames=persistent?9:13;
 g.fillStyle(0x331510,.15*fade).fillEllipse(f.x,f.y,r*1.7,r*.85);
 for(let i=0;i<flames;i++){
  const a=i*2.39996,spread=Math.sqrt((i+.5)/flames)*r*.8;
  const x=px(f.x+Math.cos(a)*spread*bloom),y=px(f.y+Math.sin(a)*spread*.65*bloom);
  const flicker=.78+.22*Math.sin(age*19+i*2.7+seed);
  const h=(22+r*.65)*( .65+(i%3)*.19)*heat*flicker*bloom;
  const w=Math.max(6,r*.19)*(.7+heat*.3);
  // Stepped tongues with a bright core and leaning, tapering tips.
  for(let j=0;j<6&&h>2;j++){
   const u=j/6,ww=Math.max(3,px(w*(1-u))),lean=Math.sin(age*11+i+u*3)*u*w*.65;
   g.fillStyle(j<2?0xe54412:0xff7820,fade*(.8-u*.25)).fillRect(px(x+lean-ww/2),px(y-h*u),ww,Math.max(3,px(h/6)+3));
   if(j<4)g.fillStyle(j<2?0xfff2aa:0xffca45,fade*.95).fillRect(px(x+lean-ww*.2),px(y-h*u),Math.max(3,px(ww*.4)),Math.max(3,px(h/6)));
  }
 }
 for(let i=0;i<14;i++){
  const cycle=persistent?(age*.7+i*.137)%1:Math.min(1,age/(.8+(i%4)*.18));
  const a=i*2.39996+seed,x=f.x+Math.cos(a)*r*(.2+cycle*.6)+Math.sin(age*4+i)*7,y=f.y+Math.sin(a)*r*.45-cycle*(45+r*.65);
  g.fillStyle(i%3?0xffa12e:0xffed91,Math.max(0,(1-cycle)*fade)).fillRect(px(x),px(y),i%3?3:6,3);
 }
}

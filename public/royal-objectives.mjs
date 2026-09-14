import {KING_STAIR} from './royal-interior.mjs';
export const CLAIMS=[
 {id:'west',name:'Sir Aldric, the Iron Oath',label:'Break the Oath Ward · Challenge the shield captain',x:2040,y:3360,art:0,hp:14000},
 {id:'east',name:'Marshal Vey, the Crown’s Eye',label:'Break the Oath Ward · Challenge the crossbow commander',x:7560,y:3360,art:1,hp:12000},
 {id:'tome',name:'Unbind the Crown',label:'Unbind the Lore Ward · Defend the tome for 60 seconds',x:11400,y:2040},
 {id:'banners',name:'Challenge the Throne',label:'Break the Crown Ward · Burn 3 banners, then defeat the champion',x:10680,y:6480}
];
export const BANNERS=[{x:10680,y:6480},{x:12120,y:6480},{x:11400,y:6840}];
export const FOUNTAIN={x:8760,y:5880};
export const CHAMPION={id:'champion',name:'The King’s First Blade',x:11400,y:5880,art:2,hp:28000};
export const KING={id:'king',name:'The Corrupted King',x:2400,y:1680,art:3,hp:380000};
export const near=(a,b,r=220)=>Math.hypot(a.x-b.x,a.y-b.y)<r;
export const createClaims=()=>({west:0,east:0,tome:0,ritual:0,banners:0,broken:0,champion:0,healed:[],wave:0,reinforce:0});
export const claimsComplete=s=>!!s&&s.west===2&&s.east===2&&s.tome===2&&s.champion===2;
export const claimsCount=s=>Number(s.west===2&&s.east===2)+Number(s.tome===2)+Number(s.champion===2);
export function claimAction(s,p){if(near(p,FOUNTAIN)&&!s.healed.includes(p.id??0))return {id:'heal',label:'Drink from the fountain · once per hero'};return CLAIMS.find(q=>near(p,q)&&s[q.id]===0);}
export function startClaim(s,id,spawn){const q=CLAIMS.find(q=>q.id===id);if(!q||s[id]!==0)return false;if(id==='west'||id==='east'){if(!spawn(q))return false;}if(id==='banners'){if(!spawn({id:'banner0',...BANNERS[0],hp:1800,art:4,name:'Cursed royal banner'}))return false;for(let i=1;i<3;i++)spawn({id:'banner'+i,...BANNERS[i],hp:1800,art:4,name:'Cursed royal banner'});}s[id]=1;return true;}
export function claimDeath(s,id){if(id==='west'||id==='east')s[id]=2;else if(id.startsWith('banner'))s.broken|=1<<Number(id.slice(-1));else if(id==='champion')s.champion=2;}
export function tickClaims(s,players,dt,spawn,reward){if(!(s.west===2&&s.east===2)&&players.some(p=>p.hp>0&&near(p,KING_STAIR.approach,550))){s.reinforce+=dt;if(s.reinforce>=10){s.reinforce=0;reward('wave',KING_STAIR.approach);}}if(s.tome===1&&players.some(p=>p.hp>0&&near(p,CLAIMS[2],260))){s.ritual=Math.min(60,s.ritual+dt);s.wave+=dt;if(s.wave>=8){s.wave=0;reward('wave',CLAIMS[2]);}if(s.ritual>=60-1e-8){s.ritual=60;s.tome=2;reward('chest',CLAIMS[2]);}}if(s.broken===7&&s.champion===0&&spawn(CHAMPION))s.champion=1;}
// One description model for solo, party HUD, map and staircase.
export function wardSteps(s=createClaims()){
 return [
 {key:'oath',name:'Oath Ward',symbol:'I',color:'#e9b76b',done:s.west===2&&s.east===2,task:`Defeat the barracks captains (${Number(s.west===2)+Number(s.east===2)}/2)`,where:'West and East Barracks'},
 {key:'lore',name:'Lore Ward',symbol:'II',color:'#9cdef0',done:s.tome===2,task:s.tome===2?'Tome unbound':s.tome===1?`Defend the tome circle (${Math.floor(s.ritual)}/60s)`:'Activate the tome, then defend its circle for 60s',where:'Abandoned Library'},
 {key:'crown',name:'Crown Ward',symbol:'III',color:'#db9de6',done:s.champion===2,task:s.champion===2?'Champion defeated':s.broken===7?'Defeat the King’s First Blade':`Burn the banners (${[1,2,4].filter(b=>s.broken&b).length}/3), then defeat the champion`,where:'Council Chamber'}
 ];
}
export function claimsText(s){return `${claimsComplete(s)?'THE KING’S STAIR IS OPEN':'OPEN THE KING’S STAIR'} · ${claimsCount(s)}/3 wards broken\n`+wardSteps(s).map(w=>`${w.done?'✓':w.symbol} ${w.name} · ${w.done?'Broken':w.task}`).join('\n');}
export function stairHint(s){return claimsComplete(s)?'All wards broken. Ascend to face the king.':'Stair sealed · '+wardSteps(s).filter(w=>!w.done).map(w=>w.name).join(' + ');}
export function wardBrief(s){return `<section class="ward-brief"><h3>Break the three wards protecting the king</h3><div>${wardSteps(s).map(w=>`<article style="--ward-color:${w.color}"><strong>${w.symbol} · ${w.name}${w.done?' · BROKEN':''}</strong><small>${w.where}</small><p>${w.done?'Protection destroyed.':w.task+'.'}</p></article>`).join('')}</div><p>Each ward breaks one lock on the King’s Stair. All three must fall in this run. Tome progress is kept when you leave its circle.</p></section>`;}
export const claimMarkers=s=>[...CLAIMS.filter(q=>q.id!=='banners'||s.broken!==7).map(q=>({...q,kind:q.id==='west'||q.id==='east'?'ward-oath':q.id==='tome'?'ward-lore':'ward-crown',label:q.id==='west'?'I · West captain':q.id==='east'?'I · East captain':q.id==='tome'?'II · Tome':'III · Banners',done:q.id==='banners'?s.champion===2:s[q.id]===2})),...(s.broken===7?[{...CHAMPION,kind:'ward-crown',label:'III · Champion',done:s.champion===2}]:[]),{...KING_STAIR,kind:'gate'}, {...FOUNTAIN,kind:'heart'}];
export function royalStrength(q,time,party=1){const hp=Math.round(q.hp*(1+Math.min(time,1800)/1800)*party);return {hp,maxHp:hp,damage:q.id==='king'?38:24,speed:q.art===4?0:q.art===1?105:120,radius:q.art===4?30:40,size:q.id==='king'?170:130,xp:q.art===4?10:400,slowCap:.2,knockFactor:.08};}
// Telegraph every charge before moving. The same simulation drives solo and co-op.
export function royalCombat(e,p,dt,api){if(e.royalArt===0||e.royalArt===4){e.charge=null;return;}if(e.charge){e.charge.t-=dt;if(e.charge.t>0){api.ring(e.charge.x,e.charge.y,90,0xe5bb68);return;}if(!e.charge.go){e.charge.go=.55;const d=Math.hypot(e.charge.x-e.x,e.charge.y-e.y)||1;e.charge.vx=(e.charge.x-e.x)/d*520;e.charge.vy=(e.charge.y-e.y)/d*520;}e.charge.go-=dt;api.move(e.charge.vx*dt,e.charge.vy*dt);if(e.charge.go<=0)e.charge=null;return;}e.royalCast=(e.royalCast??2)-dt;if(e.royalCast>0||Math.hypot(e.x-p.x,e.y-p.y)>900)return;const rage=e.hp<e.maxHp*.5;e.royalCast=rage?2.5:4;const a=Math.atan2(p.y-e.y,p.x-e.x);if(e.royalArt===0||e.royalArt===2){e.charge={x:p.x,y:p.y,t:.85};}else {const n=e.royalArt===3?(rage?12:8):5;for(let i=0;i<n;i++)api.bolt(e.x,e.y,a+(e.royalArt===3?i*Math.PI*2/n:(i-2)*.16),rage?240:185,e.damage*.7);if(e.royalArt===3&&rage)e.charge={x:p.x,y:p.y,t:1};}}

export function wardMessage(s,id){
 if(claimsComplete(s))return 'All three wards broken. The King’s Stair is open. Return to the Council Chamber stair.';
 if(id==='tome')return 'Lore Ward broken. One lock on the King’s Stair shatters.';
 if(id==='champion')return 'Crown Ward broken. One lock on the King’s Stair shatters.';
 if(id==='west'||id==='east')return s.west===2&&s.east===2?'Oath Ward broken. One lock on the King’s Stair shatters.':'One captain defeated. Defeat the other barracks captain to break the Oath Ward.';
 return s.broken===7?'The banners fall. Defeat the King’s First Blade to break the Crown Ward.':'A cursed banner burns. Destroy the remaining banners, then defeat the champion.';
}

// Summoned guards grant XP but never chests. Bounded independently of ambient waves.
export function kingSummons(e,dt,active){if(e.dead||e.royal!=='king')return 0;e.summonClock=(e.summonClock??12)-dt;if(e.summonClock>0||active>=20)return 0;const rage=e.hp<e.maxHp*.5;e.summonClock=rage?12:18;return Math.min(20-active,rage?10:6);}

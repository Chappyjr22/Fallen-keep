import {resolveProps} from './layouts.mjs';
import {royalProps,KING_STAIR} from './royal-interior.mjs';
import {dungeon,firstFloorDungeon,TILE} from './dungeon.mjs';
export const MAPS={
 courtyard:{id:'courtyard',name:'The Royal Courtyard',w:6200,h:4800,spawn:{x:3100,y:4200},gate:{x:3100,y:850},tint:0xffffff,difficulty:1,chartSpots:[{x:1050,y:900},{x:4350,y:950},{x:1050,y:3300},{x:4350,y:3300}],zones:[{name:'Royal Approach',x:3100,y:1350,r:820},{name:'Forgotten Graveyard',x:1100,y:1600,r:700},{name:'Bellwatch Ruins',x:4300,y:1600,r:700},{name:'Lower Bailey',x:3100,y:3900,r:800},{name:'Ruined Court',x:3100,y:2600,r:1000}]},
 basement:{id:'basement',name:'The Keep Basement',w:4800,h:3840,spawn:{x:2400,y:3180},tint:0x77908c,difficulty:1.12,stairs:{x:2400,y:540},dungeon:dungeon(),chartSpots:[{x:780,y:2940},{x:4020,y:1500},{x:2400,y:540}],zones:dungeon().rooms.map(([x,y,w,h,name])=>({name,x:(x+w/2)*TILE,y:(y+h/2)*TILE,r:Math.min(w,h)*TILE/2}))},
 firstfloor:{id:'firstfloor',name:'The First Floor',w:4800,h:3840,spawn:{x:2400,y:3240},tint:0xb2a68b,difficulty:1.3,dungeon:firstFloorDungeon(),chartSpots:[{x:780,y:1500},{x:4020,y:1500}],zones:firstFloorDungeon().rooms.map(([x,y,w,h,name])=>({name,x:(x+w/2)*TILE,y:(y+h/2)*TILE,r:Math.min(w,h)*TILE/2}))}
};
export function mapUnlockMessage(id){return {basement:'Finish a 30-minute courtyard run to earn the Keep Key.',firstfloor:'Break all three dungeon seals to unlock the first floor.',throne:'Complete all three royal claims in one first-floor run to unlock the Throne Room.'}[id]||'This starting area is unavailable.';}
export function mapUnlocked(id,profile){return id==='courtyard'||id==='basement'&&!!profile?.keepKey||id==='firstfloor'&&!!profile?.firstFloor||id==='throne'&&!!profile?.throneRoom;}
export function baseMapProps(map){if(map.id==='throne')return [{atlas:'royal-furnishings',frame:0,x:2400,y:840,w:650,h:500,r:150},...[1440,3360].flatMap(x=>[1440,2400,3360,4320].map(y=>({atlas:'royal-props',frame:2,x,y,w:130,h:200,r:30})))];if(map.id==='firstfloor')return [...royalProps(map),{atlas:'props',frame:1,x:8760,y:5800,w:180,h:155,r:40},{atlas:'arsenal',frame:2,x:11400,y:2040,w:110,h:110,r:0,objective:true}];const out=[],add=(atlas,frame,x,y,w,h,r=0)=>out.push({atlas,frame,x,y,w,h,r});
 for(let x=100;x<map.w/2;x+=230){if(map.id!=='courtyard'||Math.abs(x-map.gate.x/2)>650)add('props',0,x,map.id==='courtyard'?map.gate.y/2-60:100,260,200);add('props',0,x,map.h/2-10,260,200);}for(let y=330;y<map.h/2-100;y+=220){add('props',2,80,y,150,190);add('props',2,map.w/2-80,y,150,190);}
 if(map.id==='courtyard'){
 for(const [x,y] of [[1050,1450],[4300,1450],[1900,2200],[3500,2200],[1750,3300],[3650,3300]]){add('props',1,x,y,220,190,57);for(const dx of [-170,170])add('props',3,x+dx,y,64,86,14);}
 for(const x of [2700,3500])for(const y of [1250,1650,2050])add('props',2,x,y,115,145,30);
 for(const [x,y] of [[700,2700],[4700,2700],[1000,3550],[4400,3550]])add('castle',6,x,y,90,110,22);
 add('facade',null,map.gate.x,map.gate.y-130,2600,900);
 for(const [x,y] of [[850,3650],[5250,3250],[5100,1400]]){add('props',1,x,y,260,220,65);for(const dx of [-180,180])add('castle',6,x+dx,y,100,130,25);}
 // Three ruined bell towers make the Courtyard readable as a place and anchor timed events.
 for(const [x,y] of [[725,1225],[5475,1225],[3100,3600]]){add('castle',4,x,y,250,310,72);add('castle',6,x,y-105,74,92,18);}
 // A small memorial cluster marks the western graveyard without exposing its secret.
 for(const [x,y] of [[760,1720],[870,1780],[980,1700]])add('castle',6,x,y,66,82,14);
 }else if(map.id==='firstfloor'){for(const x of [1800,3000])for(const y of [700,1200,2800,3300])add('castle',2,x,y,120,170,33);
 for(const [x,y] of [[5400,900],[5700,2850],[5500,4500]])add('castle',7,x,y,180,160,40);
 }else{
 for(const [x,y] of [[1750,1500],[3000,1500],[1750,1950],[3000,1950]])add('castle',2,x,y,110,155,33);
 for(const [x,y] of [[460,1320],[460,1770],[1040,1320]])add('castle',3,x,y,145,165,43);
 for(const [x,y] of [[3730,1350],[4240,1350],[4240,1980]])add('castle',4,x,y,155,130,43);
 for(const [x,y] of [[480,2760],[1120,3420],[3600,2820]])add('castle',5,x,y,140,135,38);
 for(const [x,y] of [[1900,2940],[2800,2940],[1860,600],[2800,600]])add('castle',6,x,y,80,110,20);
 add('castle',7,2400,400,200,170,48);for(const [x,y] of [[5400,900],[5400,2400],[3600,4450],[1800,4450]]){add('castle',4,x,y,180,150,45);add('castle',6,x+200,y,85,110,20);}
 }return out.map(p=>p.atlas==='facade'?{...p,y:map.gate.y-130}:({...p,x:p.x*2,y:p.y*2}));}

// Larger world coordinates preserve the existing routes and saved section IDs.
for(const map of Object.values(MAPS)){
 map.w*=2;map.h*=2;map.spawn={x:map.spawn.x*2,y:map.spawn.y*2};
 for(const key of ['gate','stairs'])if(map[key])map[key]={x:map[key].x*2,y:map[key].y*2};
 map.chartSpots=map.chartSpots.map(p=>({x:p.x*2,y:p.y*2}));
 if(map.dungeon){map.w=map.dungeon.cols*TILE;map.h=map.dungeon.rows*TILE;}
 else map.zones=map.zones.map(z=>({...z,x:z.x*2,y:z.y*2,r:z.r*2}));
}
MAPS.courtyard.zones.push({name:'Eastern Ruins',x:10500,y:6500,r:1100},{name:'Western Watch',x:1700,y:7300,r:1100});
MAPS.basement.chartSpots.push({x:11400,y:9000});
MAPS.firstfloor.chartSpots.push({x:11400,y:9000});

MAPS.firstfloor.zones.push({name:'The King’s Stair',x:KING_STAIR.x,y:KING_STAIR.y,r:250});

const throneTiles=new Uint8Array(20*24);for(let y=2;y<22;y++)for(let x=3;x<17;x++)throneTiles[y*20+x]=1;MAPS.throne={id:'throne',name:'The Throne Room',royal:true,w:4800,h:5760,spawn:{x:2400,y:4560},tint:0x687487,difficulty:1.5,dungeon:{cols:20,rows:24,tiles:throneTiles,rooms:[[3,2,14,20,'The Corrupted Throne']]},chartSpots:[{x:2400,y:4320}],zones:[{name:'The Corrupted Throne',x:2400,y:2400,r:2000}]};

export function mapProps(map){return resolveProps(map);}

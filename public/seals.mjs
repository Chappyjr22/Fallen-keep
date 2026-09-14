export const SEALS=[{bit:1,name:'The Gaoler',area:'The Cells',x:720,y:1080,type:0,hp:2600,color:0xb886e0},{bit:2,name:'The Bone Steward',area:'Burial Vault',x:4140,y:1320,type:2,hp:3200,color:0xd9cfaa},{bit:4,name:'The Drowned Warden',area:'The Cistern',x:4020,y:3180,type:1,hp:3600,color:0x74c8c4}];
export const sealCount=mask=>[1,2,4].filter(bit=>(mask&bit)!==0).length;
export const validSeals=n=>Number.isInteger(n)&&n>=0&&n<=7;
export const savedSeals=runs=>Object.values(runs).filter(r=>r.mapId==='basement').reduce((m,r)=>m|(r.seals||0),0)&7;

for(const q of SEALS){q.x*=2;q.y*=2;}SEALS[2].x=11400;SEALS[2].y=8760;
SEALS[2].area='Drowned Sanctum';

export function createSealRun(){return {runSeals:0,sealMask:0,sealActive:0};}
export const staircaseOpen=run=>run.runSeals===7;

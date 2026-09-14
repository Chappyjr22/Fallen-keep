import {TILE,walkable} from './dungeon.mjs';
export function prepareRoyalMaterials(scene){const source=scene.textures.get('royal-materials').getSourceImage();for(const [i,key] of ['royal-floor','royal-wall','royal-rug-v','royal-rug-h'].entries()){if(scene.textures.exists(key))continue;const tex=scene.textures.createCanvas(key,512,512),x=Math.round(i%2*source.width/2),y=Math.round(Math.floor(i/2)*source.height/2),w=Math.round((i%2+1)*source.width/2)-x,h=Math.round((Math.floor(i/2)+1)*source.height/2)-y;tex.context.imageSmoothingEnabled=false;tex.context.drawImage(source,x,y,w,h,0,0,512,512);tex.refresh();}}
// Connection bits: north, east, south, west. Trim belongs only to exposed edges.
export function rugConnections(cells){const occupied=new Set(cells.map(p=>p.gx+','+p.gy));return cells.map(p=>({...p,mask:[[0,-1],[1,0],[0,1],[-1,0]].reduce((mask,[dx,dy],i)=>mask|(occupied.has((p.gx+dx)+','+(p.gy+dy))?1<<i:0),0)}));}
export function royalRugs(map){const cells=[],seen=new Set();const add=(gx,gy)=>{const x=(gx+.5)*TILE,y=(gy+.5)*TILE,key=gx+','+gy;if(seen.has(key)||!walkable(map,x,y,119))return;seen.add(key);cells.push({gx,gy,x,y});};for(const [x,y1,y2] of [[20,4,37],[47,6,37]])for(let y=y1;y<=y2;y++)add(x,y);for(const [y,x1,x2] of [[13,7,48],[24,20,48],[37,13,49]])for(let x=x1;x<=x2;x++)add(x,y);return rugConnections(cells);}
function prepareRugAtlas(scene){const key='royal-rug-connected';if(scene.textures.exists(key))return key;const tex=scene.textures.createCanvas(key,1024,1024),ctx=tex.context,v=scene.textures.get('royal-rug-v').getSourceImage(),h=scene.textures.get('royal-rug-h').getSourceImage();ctx.imageSmoothingEnabled=false;for(let mask=0;mask<16;mask++){const x=mask%4*256,y=Math.floor(mask/4)*256;ctx.save();ctx.translate(x,y);ctx.drawImage(v,64,0,384,512,0,0,256,256);if(!(mask&1))ctx.drawImage(h,0,0,512,48,0,0,256,24);if(!(mask&4))ctx.drawImage(h,0,464,512,48,0,232,256,24);if(!(mask&8))ctx.drawImage(v,0,0,48,512,0,0,24,256);if(!(mask&2))ctx.drawImage(v,464,0,48,512,232,0,24,256);ctx.restore();tex.add('join'+mask,0,x,y,256,256);}tex.refresh();return key;}
export function drawRoyalRugs(scene){if(scene.map.id!=='firstfloor'&&!scene.map.royal)return;const key=prepareRugAtlas(scene);for(const p of (scene.map.royal?rugConnections(Array.from({length:17},(_,i)=>({gx:10,gy:i+4,x:2520,y:(i+4.5)*TILE}))):royalRugs(scene.map)))scene.decor.push(scene.add.image(p.x,p.y,key,'join'+p.mask).setDisplaySize(TILE,TILE).setDepth(-95).setTint(scene.map.id==='throne'?0xffffff:0x9c7880));}
export const KING_STAIR={x:33.15*TILE,y:24.6*TILE,approach:{x:34.65*TILE,y:24.6*TILE}};
export function nearKingStair(player){return Math.hypot(player.x-KING_STAIR.approach.x,player.y-KING_STAIR.approach.y)<230;}
// Furnishings are authored in room groups, with circulation space between them.
export function royalProps(map){
 const out=[];
 const add=(atlas,frame,gx,gy,w,h,r,room)=>{const x=gx*TILE,y=gy*TILE;if(!walkable(map,x,y,r+20))throw new Error('Royal furnishing outside room: '+room);out.push({atlas,frame,x,y,w,h,r,room});};
 const banner=(x,y,room)=>add('royal-props',0,x,y,145,245,25,room);
 const armor=(x,y,room)=>add('royal-props',2,x,y,145,210,35,room);
 const fire=(x,y,room)=>add('props',3,x,y,82,115,20,room);
 const table=(x,y,room)=>add('royal-props',1,x,y,440,245,90,room);
 const shelf=(x,y,room)=>add('royal-props',3,x,y,235,290,65,room);
 const rack=(x,y,room)=>add('royal-furnishings',2,x,y,260,245,65,room);
 const bed=(x,y,room)=>add('royal-furnishings',1,x,y,310,225,75,room);
 const dining=(x,y,room)=>add('royal-furnishings',3,x,y,370,230,85,room);
 // Entrance: a ceremonial aisle, guarded at either end, with clear exits.
 for(const x of [18.8,22.2]){banner(x,22,'Entrance Hall');armor(x,28.5,'Entrance Hall');fire(x,25.5,'Entrance Hall');}
 // Sleeping quarters occupy the perimeter. The crossing corridor stays open.
 for(const [left,room] of [[3,'West Barracks'],[26,'East Barracks']]){
  for(const x of [left+1.4,left+4,left+7])bed(x,11.4,room);
  for(const x of [left+1.5,left+4.5,left+8])rack(x,17,room);
  fire(left+1,14.5,room);fire(left+9.5,14.5,room);
 }
 // Gallery displays are paired beside the aisle, rather than scattered in corners.
 for(const y of [5,8])for(const x of [17.8,23.2]){armor(x,y,'Royal Gallery');fire(x,y+1,'Royal Gallery');}
 for(const x of [18.7,22.3])banner(x,4.2,'Royal Gallery');
 // Library stacks sit along the north wall; reading tables form two quiet bays.
 for(const x of [43.4,45.4,47.4,49.4,51.4])shelf(x,5.4,'Abandoned Library');
 for(const x of [43.4,51.4])shelf(x,8,'Abandoned Library');
 for(const x of [44.8,50.2]){table(x,10,'Abandoned Library');fire(x,11.5,'Abandoned Library');}
 // Council table occupies the north bay, leaving the east-west royal approach clear.
 for(const x of [44.8,50.2])table(x,22,'Council Chamber');
 for(const x of [44,51]){banner(x,21.5,'Council Chamber');fire(x,23,'Council Chamber');armor(x,28.6,'Council Chamber');}
 // Armory racks and dress armor form a perimeter display around its through route.
 for(const x of [43.6,46.2,49,51.4])rack(x,35.5,'Royal Armory');
 for(const x of [44,50.5]){armor(x,39.6,'Royal Armory');fire(x,38.6,'Royal Armory');}
 // The staff eat at plain tables. No ceremonial armor or royal banners here.
 for(const x of [27.2,30.5,33.5])dining(x,35.6,'Servants’ Hall');
 for(const x of [27,34])add('castle',5,x,39.5,150,135,40,'Servants’ Hall');
 fire(26,38.5,'Servants’ Hall');fire(35,38.5,'Servants’ Hall');
 for(const x of [11,15]){armor(x,35.5,'West Gallery');banner(x,39.6,'West Gallery');fire(x,38.5,'West Gallery');}
 // Encounter furniture sits off the carpet and outside objective activation circles.
 for(const [x,room] of [[8.5,'West Barracks'],[31.5,'East Barracks']]){
  for(const dx of [-2,2]){rack(x+dx,15.7,room);banner(x+dx,12.1,room);}
 }
 for(const x of [45.6,49.6]){shelf(x,7.7,'Abandoned Library');fire(x,9.3,'Abandoned Library');}
 for(const x of [43,52]){armor(x,26.5,'Council Chamber');fire(x,27.5,'Council Chamber');}
 // The stair rises westward at the blind end identified on the map.
 add('royal-furnishings',0,KING_STAIR.x/TILE,KING_STAIR.y/TILE,510,420,140,'The King’s Stair');
 for(const y of [23.85,25.4]){armor(35.7,y,'The King’s Stair');fire(34.7,y,'The King’s Stair');}
 return out;
}
export function drawRoyalAtmosphere(scene,props){scene.royalLights=[];if(scene.map.id!=='firstfloor')return;for(const [x,y,text,color] of [[2040,3180,'I · OATH WARD','#e9b76b'],[7560,3180,'I · OATH WARD','#e9b76b'],[11400,1810,'II · LORE WARD','#9cdef0'],[10680,6210,'III · CROWN WARD','#db9de6']])scene.decor.push(scene.add.text(x,y,text,{fontFamily:'Georgia',fontSize:'18px',color,backgroundColor:'#11181ddd',padding:{x:10,y:5}}).setOrigin(.5).setDepth(y));const key='royal-firelight';if(!scene.textures.exists(key)){const tex=scene.textures.createCanvas(key,128,128),ctx=tex.context,g=ctx.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,165,66,0.46)');g.addColorStop(1,'rgba(255,177,66,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);tex.refresh();}for(const p of props||royalProps(scene.map))if(p.atlas==='props'&&p.frame===3){const light=scene.add.image(p.x,p.y,key).setDisplaySize(420,320).setDepth(-79).setBlendMode('ADD');scene.decor.push(light);scene.royalLights.push(light);}}

export function animateRoyalAtmosphere(scene,g,time){if(scene.map.id==='throne'){for(let i=0;i<36;i++){const a=i*2.399,t=(time*.12+i/36)%1;g.fillStyle(i%3?0x59b58d:0xbbe8ce,Math.sin(t*Math.PI)*.35).fillRect(2400+Math.cos(a)*(300+i%5*280),1700+Math.sin(a)*(350+i%4*260)-t*90,3,3);}return;}if(scene.map.id!=='firstfloor')return;for(const [i,light] of (scene.royalLights||[]).entries())light.setAlpha(.84+Math.sin(time*3.7+i*2.3)*.08+Math.sin(time*8+i)*.04);
 const x=KING_STAIR.x+100,y=KING_STAIR.y;
 // Sparse emerald motes signal the royal seal without hiding combat.
 for(let i=0;i<18;i++){const t=(time*.12+i/18)%1,a=i*2.4;g.fillStyle(i%3?0x64b692:0xc6dfca,Math.sin(t*Math.PI)*.4).fillRect(x+Math.cos(a)*170+Math.sin(time+i)*9,y+Math.sin(a)*120-t*110,2,3);}
}

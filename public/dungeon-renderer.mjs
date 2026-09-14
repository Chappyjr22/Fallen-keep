import {TILE} from './dungeon.mjs';
const ATLAS='dungeon-wall-shared';
const PERIOD=256;
// All walls share a 512-square atlas. Never allocate a TileSprite per wall:
// Phaser creates a separate power-of-two fill canvas and GPU texture for each.
export function wallCells(g){const cells=[];for(let y=0;y<g.rows;y++)for(let x=0;x<g.cols;x++){if(g.tiles[y*g.cols+x])continue;const edge=[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>{const a=x+dx,b=y+dy;return a>=0&&b>=0&&a<g.cols&&b<g.rows&&g.tiles[b*g.cols+a];});if(edge)cells.push({x,y});}return cells;}
export function drawDungeonTerrain(scene){const g=scene.map.dungeon;if(!g)return;const royal=(scene.map.id==='firstfloor'||scene.map.royal),atlasKey=royal?'royal-wall-shared':ATLAS;let atlas=scene.textures.exists(atlasKey)?scene.textures.get(atlasKey):null;if(!atlas){atlas=scene.textures.createCanvas(atlasKey,PERIOD*2,PERIOD*2);const ctx=atlas.context,source=scene.textures.get(royal?'royal-wall':'dungeon-wall').getSourceImage();ctx.imageSmoothingEnabled=false;for(let y=0;y<2;y++)for(let x=0;x<2;x++)ctx.drawImage(source,x*PERIOD,y*PERIOD,PERIOD,PERIOD);atlas.refresh();}
 const dark=scene.add.graphics().setDepth(-90);scene.decor.push(dark);dark.fillStyle(0x080e10,1);for(let y=0;y<g.rows;y++){let start=-1;for(let x=0;x<=g.cols;x++){const blocked=x<g.cols&&!g.tiles[y*g.cols+x];if(blocked&&start<0)start=x;if(!blocked&&start>=0){dark.fillRect(start*TILE,y*TILE,(x-start)*TILE,TILE);start=-1;}}}
 for(const {x,y} of wallCells(g)){const u=(x*TILE)%PERIOD,v=(y*TILE)%PERIOD,frame=u+':'+v;if(!atlas.has(frame))atlas.add(frame,0,u,v,TILE,TILE);scene.decor.push(scene.add.image(x*TILE,y*TILE,atlasKey,frame).setOrigin(0).setDepth(-80).setTint(scene.map.id==='throne'?0xffffff:royal?0x626d80:0xffffff));}
}

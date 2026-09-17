export const MIMIC_EVENT_ID='hungry_chest';

export function hungryChestPosition(map){
 if(!map||map.id!=='basement')return null;
 const cells=(map.zones||[]).find(zone=>zone.name==='The Cells');
 if(!cells)return null;
 const offset=Math.min(300,Math.max(120,(cells.r||480)*.28));
 return {x:Math.round(cells.x+offset),y:Math.round(cells.y-offset*.35)};
}

export function mimicBossStats(elapsed=0){
 const minute=Math.max(0,Number(elapsed)||0)/60;
 return {
  maxHp:Math.round(900+minute*55),
  speed:Math.min(78,46+minute*.9),
  damage:Math.round(18+minute*.6),
  radius:42,
  lungeSpeed:132,
  lungeEvery:4.2,
  lungeDuration:.7
 };
}

export function hungryChestAvailable({mapId,discoveries=[],runId}={}){
 return mapId==='basement'&&!!runId&&!new Set(discoveries||[]).has(MIMIC_EVENT_ID);
}

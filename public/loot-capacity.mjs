// Called only at the entity cap. Matching rewards share a pickup without losing value.
// Chest/passive amount is a count; currency/XP/healing amount remains its value.
export function compactLoot(loot){
 const seen=new Map();
 for(let i=0;i<loot.length;i++){
  const l=loot[i];if(l.dead){loot.splice(i,1);return true;}
  const key=l.kind+':'+(l.item||'');
  const previous=seen.get(key);
  if(previous){previous.amount=(previous.amount??1)+(l.amount??1);loot.splice(i,1);return true;}
  seen.set(key,l);
 }
 return false;
}
export function consumeReward(loot){
 if((loot.kind==='chest'||loot.kind==='passive')&&(loot.amount??1)>1){loot.amount--;loot.dead=false;}
 else loot.dead=true;
}

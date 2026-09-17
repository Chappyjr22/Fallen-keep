const freeze=o=>Object.freeze(o);

export const FORGOTTEN_GRAVE_ID='forgotten_grave';
export const FORGOTTEN_GRAVE=freeze({x:1600,y:3600,radius:92});

export const COURTYARD_BELLS=freeze([
 // ringAt avoids 180s: that exact tick is also the game's independently
 // scheduled first elite spawn (see begin()'s eliteAt=180), which would
 // otherwise guarantee two elites converge on every brand-new character's
 // very first encounter with this content.
 freeze({id:'west_bell',name:'The Western Bell',area:'Forgotten Graveyard',x:1450,y:2450,ringAt:200}),
 freeze({id:'east_bell',name:'The Eastern Bell',area:'Bellwatch Ruins',x:10950,y:2450,ringAt:420}),
 freeze({id:'south_bell',name:'The Lower Bell',area:'Lower Bailey',x:6200,y:7200,ringAt:720})
]);

export function forgottenGraveAvailable(context={}){
 return context.mapId==='courtyard'&&!context.discoveries?.includes(FORGOTTEN_GRAVE_ID)&&!!context.inventory?.lantern;
}

export function nextBellTower(elapsed=0,completed=[],activeId=null){
 if(activeId)return null;
 const done=new Set(completed);
 return COURTYARD_BELLS.find(b=>!done.has(b.id)&&elapsed>=b.ringAt)||null;
}

export function bellEncounterStats(elapsed=0){
 const minutes=Math.max(0,elapsed)/60;
 return {
  hp:Math.round(720*(1+minutes*.055)),
  damage:Math.round(12*(1+minutes*.035)),
  speed:66+Math.min(26,minutes*1.5),
  horde:8+Math.min(8,Math.floor(minutes/3))
 };
}

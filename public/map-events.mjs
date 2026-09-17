const freeze=o=>Object.freeze(o);

export const MAP_EVENTS=freeze({
 forgotten_grave:freeze({
  id:'forgotten_grave',mapId:'courtyard',kind:'conditional',repeat:'account',hidden:true,
  placement:'west_memorial_grave',conditions:freeze({requiredItems:freeze(['lantern'])}),
  reward:freeze({type:'future-character-hook',id:'gravebinder'}),
  text:'An old grave bears a name the Keep tried to forget.'
 }),
 hungry_chest:freeze({
  id:'hungry_chest',mapId:'basement',kind:'encounter',repeat:'account',hidden:true,
  placement:'sealed_cell_chest',encounter:'mimic',reward:freeze({type:'future-character-hook',id:'mimic'}),
  text:'The chest opens. Something inside opens with it.'
 }),
 royal_coffer:freeze({
  id:'royal_coffer',mapId:'firstfloor',kind:'interaction',repeat:'account',hidden:true,
  placement:'treasury_coffer',reward:freeze({type:'future-character-hook',id:'relic_hunter'}),
  text:'The royal treasury kept one prize off every ledger.'
 }),
 broken_crown_altar:freeze({
  id:'broken_crown_altar',mapId:'throne',kind:'conditional',repeat:'account',hidden:true,
  placement:'crown_altar',conditions:freeze({maxEquipment:3,requiresKingDefeat:true}),
  reward:freeze({type:'future-character-hook',id:'oathless'}),
  text:'The broken crown answers an oath that was never sworn.'
 })
});

export function mapEvent(id){return MAP_EVENTS[id]||null;}
export function mapEventsFor(mapId){return Object.values(MAP_EVENTS).filter(e=>e.mapId===mapId);}
export function discoveredEventIds(profile){return new Set(Array.isArray(profile?.discoveries)?profile.discoveries:[]);}
export function eventDiscovered(id,profile){return discoveredEventIds(profile).has(id);}

function inventoryCount(inv={}){return Object.keys(inv).filter(id=>(inv[id]||0)>0).length;}
export function eventConditionsMet(eventOrId,context={}){
 const event=typeof eventOrId==='string'?mapEvent(eventOrId):eventOrId;
 if(!event)return false;
 const c=event.conditions||{};
 if(c.maxEquipment!==undefined&&inventoryCount(context.inventory)>c.maxEquipment)return false;
 if(c.minElapsed!==undefined&&(context.elapsed||0)<c.minElapsed)return false;
 if(c.requiresKingDefeat&&!context.kingDefeated)return false;
 if(c.requiredItems&&!c.requiredItems.every(id=>(context.inventory?.[id]||0)>0))return false;
 if(c.requiredFlags&&!c.requiredFlags.every(id=>context.flags?.[id]))return false;
 return true;
}

export function mapEventState(eventOrId,context={}){
 const event=typeof eventOrId==='string'?mapEvent(eventOrId):eventOrId;
 if(!event)return 'missing';
 if(event.repeat==='account'&&eventDiscovered(event.id,context.profile))return 'discovered';
 if(!eventConditionsMet(event,context))return 'locked';
 return 'available';
}

export function visibleMapEvents(mapId,context={}){
 return mapEventsFor(mapId).filter(event=>{
  const state=mapEventState(event,context);
  if(state==='discovered')return !!context.showDiscovered;
  if(state!=='available')return false;
  return !event.hidden||!!context.revealSecrets;
 });
}

export function completeMapEvent(eventOrId,context={}){
 const event=typeof eventOrId==='string'?mapEvent(eventOrId):eventOrId;
 if(!event)throw new Error('Unknown map event');
 if(event.mapId!==context.mapId)throw new Error('Map event belongs to another map');
 if(mapEventState(event,context)!=='available')throw new Error('Map event is not available');
 return {eventId:event.id,mapId:event.mapId,reward:event.reward||null,text:event.text||''};
}

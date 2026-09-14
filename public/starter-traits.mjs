// Shared per-run trait state; simulation time only (never setTimeout).
export const createStarterTraits=()=>({shieldHits:0,wandVolleys:0,flaskVolleys:0,pulseCooldown:0,echoes:[]});
export function advanceStarterTraits(state,dt,emit,allowEcho=true){state.pulseCooldown=Math.max(0,state.pulseCooldown-dt);if(!allowEcho){state.echoes=[];return;}const waiting=[];for(const echo of state.echoes){echo.delay-=dt;if(echo.delay<=1e-8)emit(echo.shot);else waiting.push(echo);}state.echoes=waiting;}
export function castWand(state,arcanist,shot,emit){emit(shot);if(arcanist&&++state.wandVolleys%4===0&&state.echoes.length<8)state.echoes.push({delay:.3,shot:{...shot,damage:shot.damage*.5}});}
export function catalystPattern(state,alchemist,pattern){if(!alchemist)return pattern;return ++state.flaskVolleys%3===0?{...pattern,poolRadius:pattern.poolRadius*1.25,catalyst:true}:pattern;}
export function shieldPulse(state,sentinel){if(!sentinel)return false;state.shieldHits++;if(state.shieldHits%4||state.pulseCooldown>0)return false;state.pulseCooldown=2;return true;}
export function repulseVector(origin,target,radius,factor=1){const dx=target.x-origin.x,dy=target.y-origin.y,d=Math.hypot(dx,dy);if(d>radius||d<.001||factor<=0)return null;const force=48*Math.min(1,factor);return {x:dx/d*force,y:dy/d*force};}
export function sanctuaryActive(inv,position,enemies,point,dead,radius,clear){return !!inv.censer&&enemies.some(e=>!dead(e)&&e.tier!=='breakable'&&!e.breakable&&Math.hypot(point(e).x-position.x,point(e).y-position.y)<=radius&&clear(position,point(e)));}
export function sanctuaryHeal(hp,maxHp,dt){return hp<=0?hp:Math.min(maxHp,hp+dt);}

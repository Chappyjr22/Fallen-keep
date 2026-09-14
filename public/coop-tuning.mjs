export const coopZoom=height=>Math.max(.9,Math.min(1.25,height/800));
export function witchAllowed(time,enemies,rng=Math.random){const chance=time<240?0:time<480?.05:time<600?.10:.16,cap=time<480?2:time<600?8:16;return rng()<chance&&enemies.filter(e=>!e.dead&&e.type===2&&!e.boss&&e.tier!=='boss'&&!e.breakable&&e.tier!=='breakable').length<cap;}
export function coopEnemyType(time,enemies,rng=Math.random){return witchAllowed(time,enemies,rng)?2:rng()<.65?0:1;}
export function soloEnemyType(time,enemies,rng=Math.random){return witchAllowed(time,enemies,rng)?2:time>60&&rng()<.3?1:0;}
export function eliteDue(time,next,enemies){return time>=next&&enemies.filter(e=>!e.dead&&(e.elite||e.tier==='elite')).length<(time<600?1:2);}

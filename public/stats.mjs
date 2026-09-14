export const BASE_PICKUP=100;
export const passivePower=level=>level>=8?10:level||0;
export const weaponMastery=level=>level>=8?1.25:1;
export function calculateStats(character,inv={},permanent={}){const base=character.stats||{},pct=(key)=>1+(permanent[key]||0)/100;return {
 health:character.health*pct('health')+passivePower(inv.vitality)*20,
 speed:character.speed*pct('speed')*(1+passivePower(inv.haste)*.06),
 damage:(base.damage||1)*pct('damage')*(1+passivePower(inv.might)*.1),
 pickup:BASE_PICKUP*pct('pickup')*(1+passivePower(inv.magnet)*.3),
 armor:base.armor||0,recovery:base.recovery||0,projectileSpeed:(base.projectileSpeed||1)*(1+passivePower(inv.echo)*.04),
 duration:character.curseDuration||1,area:base.area||1,cooldown:Math.max(.2,(base.cooldown||1)*(1-passivePower(inv.hourglass)*.08)),
 amount:(base.amount||0)+(inv.echo>=8?6:Math.ceil((inv.echo||0)/2)),luck:base.luck||0,growth:base.growth||1,greed:base.greed||1,
 slow:Math.min(.75,passivePower(inv.frost)*.075)
};}
export function spendCharge(charges,type){if(!(charges[type]>0))return false;charges[type]--;return true;}

export const wandProjectileCount=(level,stats)=>1+Math.floor(level/3)+(level===8?1:0)+stats.amount;

export const UPGRADES={
 speed:{name:'Fleet Foot',description:'Movement speed',glyph:'»',cap:10},
 health:{name:'Vital Resolve',description:'Maximum health',glyph:'♥',cap:10},
 damage:{name:'Tempered Steel',description:'All weapon damage',glyph:'◆',cap:10},
 pickup:{name:'Far Reach',description:'Experience pickup range',glyph:'◇',cap:10}
};
export const upgradePrice=rank=>30*(rank+1);
export function profileBonuses(p){return Object.fromEntries(Object.keys(UPGRADES).map(k=>[k,Number(p?.[k]||0)]));}
export function boosted(base,rank=0){return base*(1+rank/100);}

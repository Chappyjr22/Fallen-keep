export const veteranChance=minute=>minute<3?0:Math.min(.22,.08+(minute-3)*.007);
export function tierStats(base,minute,tier='normal'){
 const veteran=tier==='veteran',elite=tier==='elite',boss=tier==='boss';
 return {hp:boss?6000*(1+minute*.65):base.hp*(1+minute*.24)*(elite?120:veteran?4:1),
 damage:base.damage*(1+minute*.025)*(boss?3.5:elite?3:veteran?1.25:1),
 speed:boss?Math.max(base.speed*1.6,115+minute*2.5):elite?Math.max(base.speed*1.5,90+minute*2):base.speed*(1+minute*.012)*(veteran?1.1:1),
 size:boss?160:elite?98:veteran?82:64,radius:boss?34:elite?23:veteran?18:13,
 tint:boss?0x96e7e6:elite?0xe7c785:veteran?0xc4a0ea:null,
 slowCap:boss?.1:elite?.2:.75,knockFactor:boss?.05:elite?.15:veteran?.7:1,
 xp:boss?90:elite?25:(base.row===3?4:2)*(veteran?3:1),dropsChest:elite||boss};
}

export function guardianStats(seal,elapsed){return {hp:seal.hp*8*(1+elapsed/1200),damage:(22+seal.bit*2)*1.75,speed:125+seal.bit*5,slowCap:.1,knockFactor:.02};}

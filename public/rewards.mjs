import {ITEMS} from './rules.mjs';
export function bonusPassive(inv,banned=[],rng=Math.random){const pool=Object.keys(ITEMS).filter(id=>ITEMS[id].kind==='passive'&&!banned.includes(id)&&(inv[id]||0)<ITEMS[id].max);return pool.length?pool[Math.floor(rng()*pool.length)]:null;}
export function breakableLoot(luck=0,rng=Math.random){const roll=rng(),heartChance=.18+Math.min(.12,luck/1000);return roll<heartChance?{kind:'heart',amount:25}:roll<.5?{kind:'xp',amount:12}:{kind:'gold',amount:5+Math.floor(rng()*8)};}
export function flaskPattern(level,amount=0,evolved=false){return {count:(evolved?8:level>=8?6:1+Math.floor((level-1)/2))+amount,ring:evolved||level>=6,radius:evolved?145:125,poolRadius:evolved?82:(40+level*5)*(level===8?1.25:1),duration:evolved?6:3+level*.3,cooldown:evolved?4:3.8,damage:evolved?48:(8+level*3)*(level===8?1.25:1)};}
export function censerStats(level){return {radius:50+level*7+(level===8?18:0),damage:(5+level*3)*(level===8?1.5:1),cooldown:.7};}

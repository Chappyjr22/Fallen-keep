import {heroMilestoneMetrics} from './starter-milestones.mjs';
import {CHARACTERS} from './characters.mjs';
import {savedSeals,sealCount} from './seals.mjs';
export const ACHIEVEMENTS=[
 {id:'ranger',name:'First Expedition',description:'Survive 8 minutes in one run.',metric:'bestTime',target:480,time:true,reward:'Unlocks The Ranger + Thornwood Bow'},
 {id:'alchemist',name:'A Purse of Reagents',description:'Earn 250 coins across your runs. Spending them does not remove progress.',metric:'earnedCoins',target:250,reward:'Unlocks The Alchemist + Hex Flask'},
 {id:'treasury',name:'The Bell Tolls',description:'Defeat 250 enemies across your runs.',metric:'totalKills',target:250,reward:'Unlocks The Bellkeeper + Storm Bell'},
 {id:'chaplain',name:'A Steady Hand',description:'Defeat 300 enemies in one run.',metric:'bestKills',target:300,reward:'Unlocks The Chaplain + Hallowed Censer'},

 {id:'unbroken_watch',name:'Unbroken Watch',description:'Finish a run after mastering Spectral Shield and surviving 12 minutes.',metric:'sentinelUnlocked',target:1,reward:'The Sentinel + Spectral Shield'},
 {id:'lesson_in_power',name:'A Lesson in Power',description:'Finish a run after mastering Arcane Wand and defeating 750 enemies.',metric:'arcanistUnlocked',target:1,reward:'The Arcanist + Arcane Wand'},
 {id:'out_of_depths',name:'Out of the Depths',description:'Break all three dungeon seals across your runs.',metric:'sealsBroken',target:3,reward:'First floor + 750 coins (one time) + The Cinder Scholar + Cinder Tome'},
 {id:'last_bell',name:'The Last Bell',description:'Survive 30 minutes in the courtyard, then finish the run.',metric:'bestCourtyardTime',target:1800,time:true,reward:'Keep Key + 500 coins (one time) + The Castellan + Royal Halberd'},

 {id:'crown_broken',name:'A Crown Unbound',description:'Defeat the Corrupted King in the Throne Room.',metric:'kingDefeats',target:1,reward:'The Crownless + Crownshards'},
 {id:'royal_claims',name:'An Audience Earned',description:'Complete all three royal claims in one first-floor run.',metric:'royalClaims',target:1,reward:'Throne Room + 1,000 coins (one time)'},
 {id:'first_watch',name:'First Watch',description:'Defeat 100 enemies across your runs.',metric:'totalKills',target:100},
];
export function achievementState(metrics={}){const normalized=Object.fromEntries(['sentinelUnlocked','arcanistUnlocked','alchemistUnlocked','chaplainUnlocked','kingDefeats','royalClaims','sealsBroken','totalKills','bestKills','bestTime','bestCourtyardTime','earnedCoins'].map(k=>[k,Math.max(0,Number(metrics[k])||0)]));return {metrics:normalized,completed:ACHIEVEMENTS.filter(a=>normalized[a.metric]>=a.target).map(a=>a.id)};}
export function characterUnlocked(id,progress){const c=CHARACTERS[id];return !!c&&(!c.unlockMetric||(progress?.metrics?.[c.unlockMetric]||0)>=c.unlockTarget);}
export function runMetrics(runs){const values=Object.values(runs);return achievementState({...heroMilestoneMetrics(runs),kingDefeats:values.filter(r=>r.mapId==='throne'&&r.kingDefeated).length,royalClaims:values.some(r=>r.mapId==='firstfloor'&&r.claims)?1:0,sealsBroken:sealCount(savedSeals(runs)),bestCourtyardTime:Math.max(0,...values.filter(r=>(r.mapId||'courtyard')==='courtyard'&&r.closed).map(r=>r.elapsed||0)),totalKills:values.reduce((n,r)=>n+(r.kills||0),0),bestKills:Math.max(0,...values.map(r=>r.kills||0)),bestTime:Math.max(0,...values.map(r=>r.elapsed||0)),earnedCoins:values.reduce((n,r)=>n+(r.gold||0),0)});}

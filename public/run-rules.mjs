// Shared section pacing. Objective encounters are never part of this schedule.
export const BOSS_TIMES=[600,1080,1500];
export const scheduledBossTime=(mapId,index)=>mapId==='courtyard'?(BOSS_TIMES[index]??Infinity):Infinity;
export const endingAt=(mapId,time)=>time<1800?null:mapId==='courtyard'?'oathbreaker':mapId==='basement'?'victory':null;
export const OATHBREAKER={name:'The Oathbreaker',hp:10000000,maxHp:10000000,damage:1000000,speed:480,slowCap:0,knockFactor:0};

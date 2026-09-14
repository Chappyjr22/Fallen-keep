// Stable saved bits. Never reorder or reuse them when adding future milestones.
export const MASTERY_BITS={shield:1,wand:2,censer:4,flask:8};
export const TRANSFORM_BITS={sabbath:1};
export function recordMastery(run){for(const [id,bit] of Object.entries(MASTERY_BITS))if((run.inv?.[id]||0)>=8)run.mastery=(run.mastery||0)|bit;}
export function recordTransformation(run,id){run.transforms=(run.transforms||0)|(TRANSFORM_BITS[id]||0);}
export function validMilestones(mastery,transforms){return Number.isInteger(mastery)&&mastery>=0&&mastery<=15&&Number.isInteger(transforms)&&transforms>=0&&transforms<=1&&(!(transforms&1)||!!(mastery&8));}
export function heroMilestoneMetrics(runs){const done=Object.values(runs).filter(r=>r.closed);return {sentinelUnlocked:Number(done.some(r=>(r.mastery&1)&&r.elapsed>=720)),arcanistUnlocked:Number(done.some(r=>(r.mastery&2)&&r.kills>=750)),alchemistUnlocked:Number(done.some(r=>r.transforms&1)),chaplainUnlocked:Number(done.some(r=>(r.mastery&4)&&r.elapsed>=900))};}

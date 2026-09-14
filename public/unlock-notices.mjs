import {ACHIEVEMENTS} from './achievements.mjs';
const pending=new Map();
export function captureUnlocks(before,after){if(!before||!after)return;const old=new Set(before.completed||[]);for(const a of ACHIEVEMENTS)if(after.completed?.includes(a.id)&&!old.has(a.id))pending.set(a.id,a);}
export const pendingUnlocks=()=>[...pending.values()];
export const clearUnlockNotices=()=>pending.clear();
export function unlockCards(list=pendingUnlocks()){return list.length?'<section class="unlock-awards"><p class="eyebrow">NEWLY EARNED</p>'+list.map(a=>`<article class="achievement-reward"><h3>${a.name}</h3><p>${a.reward||'Achievement completed'}</p><small>${a.description}</small></article>`).join('')+'</section>':'';}

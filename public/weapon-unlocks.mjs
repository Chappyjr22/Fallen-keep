import {CHARACTERS} from './characters.mjs';
import {characterUnlocked} from './achievements.mjs';
// Starter equipment is independent of hero unlocks. Expansion weapons follow their hero.
export const STARTER_WEAPONS=Object.freeze(['sword','shield','wand','flask','lantern','bow','censer','halberd']);
export const unlockedCharacters=progress=>Object.keys(CHARACTERS).filter(id=>characterUnlocked(id,progress));
export function lockedSignatureWeapons(heroes=[]){const available=new Set(heroes);return [...new Set(Object.entries(CHARACTERS).filter(([id,c])=>c.unlockMetric&&!STARTER_WEAPONS.includes(c.weapon)&&!available.has(id)).map(([,c])=>c.weapon))];}

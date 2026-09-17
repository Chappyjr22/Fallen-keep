import {CHARACTERS} from './characters.mjs';
import {characterUnlocked} from './achievements.mjs';
// Only the two starter heroes contribute weapons before any progression.
export const STARTER_WEAPONS=Object.freeze(['sword','lantern']);
export const unlockedCharacters=progress=>Object.keys(CHARACTERS).filter(id=>characterUnlocked(id,progress));
export function lockedSignatureWeapons(heroes=[]){const available=new Set(heroes);return [...new Set(Object.entries(CHARACTERS).filter(([id,c])=>!available.has(id)&&!STARTER_WEAPONS.includes(c.weapon)).map(([,c])=>c.weapon))];}
export function unlockedSignatureWeapons(progress){return [...new Set(unlockedCharacters(progress).map(id=>CHARACTERS[id].weapon))];}

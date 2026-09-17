import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CHARACTERS,CHARACTER_TIERS} from '../public/characters.mjs';
import {achievementState,characterUnlocked} from '../public/achievements.mjs';
import {STARTER_WEAPONS,unlockedCharacters,lockedSignatureWeapons} from '../public/weapon-unlocks.mjs';

test('character roster follows the approved four-tier progression structure',()=>{
 const tiers=Object.fromEntries(Object.keys(CHARACTER_TIERS).map(t=>[t,Object.entries(CHARACTERS).filter(([,c])=>c.tier===Number(t)).map(([id])=>id)]));
 assert.deepEqual(tiers['0'],['knight','witch']);
 assert.deepEqual(new Set(tiers['1']),new Set(['ranger','alchemist','bellkeeper','chaplain']));
 assert.deepEqual(new Set(tiers['2']),new Set(['sentinel','arcanist','scholar','castellan']));
 assert.deepEqual(tiers['3'],['crownless']);
});

test('fresh accounts only expose Knight and Witch signature weapons',()=>{
 const fresh=achievementState({});
 assert.deepEqual(unlockedCharacters(fresh),['knight','witch']);
 assert.deepEqual(STARTER_WEAPONS,['sword','lantern']);
 const locked=new Set(lockedSignatureWeapons(unlockedCharacters(fresh)));
 for(const [id,c] of Object.entries(CHARACTERS)){
  if(id==='knight'||id==='witch')assert.equal(locked.has(c.weapon),false,id);
  else assert.equal(locked.has(c.weapon),true,id);
 }
});

test('unlocking a character releases that character and their signature weapon together',()=>{
 const progress=achievementState({bestTime:480});
 assert.equal(characterUnlocked('ranger',progress),true);
 const heroes=unlockedCharacters(progress);
 assert(heroes.includes('ranger'));
 const locked=new Set(lockedSignatureWeapons(heroes));
 assert.equal(locked.has(CHARACTERS.ranger.weapon),false);
 assert.equal(locked.has(CHARACTERS.alchemist.weapon),true);
});

test('locked roster presentation uses silhouettes and hides trait and weapon details',async()=>{
 const source=await readFile(new URL('../public/start-menu.mjs',import.meta.url),'utf8');
 assert.match(source,/hero-choice .*locked/);
 assert.match(source,/Locked character silhouette/);
 assert.match(source,/starting weapon are revealed when unlocked/);
 assert.match(source,/<strong>\?\?\?<\/strong>/);
});

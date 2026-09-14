import test from 'node:test';
import assert from 'node:assert/strict';
import {CHARACTERS,lanternStats} from '../public/characters.mjs';
import {chestRewards,eligibleItems,recipeProgress,eligibleRecipes} from '../public/rules.mjs';
import {boosted} from '../public/progression-rules.mjs';
test('Witch starts with her own weapon and lower health; permanent bonuses use her base',()=>{assert.equal(CHARACTERS.witch.weapon,'lantern');assert.equal(CHARACTERS.witch.health,90);assert.equal(boosted(CHARACTERS.witch.health,10),99.00000000000001);assert.equal(CHARACTERS.witch.curseDuration,1.4);assert.equal(CHARACTERS.knight.health,120);});
test('Wild Hunt requires max lantern and Seeker Stone, consumes only lantern',()=>{assert.equal(eligibleRecipes({lantern:7,magnet:5}).length,0);const r=chestRewards({lantern:8,magnet:1},()=>.1);assert.deepEqual(r.inventory,{hunt:1,magnet:1});assert.equal(r.rewards[0].id,'hunt');assert.ok(!eligibleItems(r.inventory).includes('lantern'));});
test('independent evolution recipe stays visible after a sword transformation',()=>{assert.equal(recipeProgress({winter:1,lantern:7,magnet:1},'lantern')[0].readyAfter,true);assert.equal(recipeProgress({hunt:1,sword:7,frost:1},'sword')[0].readyAfter,true);assert.equal(recipeProgress({winter:1},'shield').length,0);});
test('lantern levels increase damage and projectiles; evolution pierces and adds riders',()=>{const first=lanternStats(1),max=lanternStats(8),hunt=lanternStats(8,true);assert.ok(max.damage>first.damage);assert.ok(max.count>first.count);assert.ok(max.cooldown<first.cooldown);assert.equal(hunt.count,5);assert.equal(hunt.pierce,99);});

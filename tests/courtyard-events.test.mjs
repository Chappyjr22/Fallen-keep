import test from 'node:test';
import assert from 'node:assert/strict';
import {FORGOTTEN_GRAVE,COURTYARD_BELLS,forgottenGraveAvailable,nextBellTower,bellEncounterStats} from '../public/courtyard-events.mjs';

test('courtyard bell schedule is ordered and non-repeating',()=>{
 assert.equal(COURTYARD_BELLS.length,3);
 assert.equal(nextBellTower(179,[]),null);
 assert.equal(nextBellTower(180,[]).id,'west_bell');
 assert.equal(nextBellTower(500,['west_bell']).id,'east_bell');
 assert.equal(nextBellTower(900,['west_bell','east_bell']).id,'south_bell');
 assert.equal(nextBellTower(900,['west_bell','east_bell','south_bell']),null);
 assert.equal(nextBellTower(900,[],'west_bell'),null);
});

test('forgotten grave is an early secret for Soul Lantern users only',()=>{
 assert.equal(forgottenGraveAvailable({mapId:'courtyard',discoveries:[],inventory:{lantern:1}}),true);
 assert.equal(forgottenGraveAvailable({mapId:'courtyard',discoveries:[],inventory:{sword:1}}),false);
 assert.equal(forgottenGraveAvailable({mapId:'basement',discoveries:[],inventory:{lantern:1}}),false);
 assert.equal(forgottenGraveAvailable({mapId:'courtyard',discoveries:['forgotten_grave'],inventory:{lantern:1}}),false);
 assert.ok(FORGOTTEN_GRAVE.x>0&&FORGOTTEN_GRAVE.y>0);
});

test('bell encounter scales without changing its identity',()=>{
 const early=bellEncounterStats(180),late=bellEncounterStats(900);
 assert.ok(early.hp>0&&early.damage>0&&early.speed>0&&early.horde>=8);
 assert.ok(late.hp>early.hp);
 assert.ok(late.damage>=early.damage);
 assert.ok(late.speed>=early.speed);
 assert.ok(late.horde>=early.horde);
});

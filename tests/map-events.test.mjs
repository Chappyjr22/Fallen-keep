import test from 'node:test';
import assert from 'node:assert/strict';
import {MAP_EVENTS,mapEvent,mapEventsFor,eventDiscovered,eventConditionsMet,mapEventState,visibleMapEvents,completeMapEvent} from '../public/map-events.mjs';

test('map events are stable and map-scoped',()=>{
 assert.equal(mapEvent('hungry_chest').mapId,'basement');
 assert.deepEqual(mapEventsFor('basement').map(e=>e.id),['hungry_chest']);
 assert.equal(mapEvent('missing'),null);
 assert.equal(Object.keys(MAP_EVENTS).length,4);
});

test('account discoveries hide one-time events after completion',()=>{
 const profile={discoveries:['hungry_chest']};
 assert.equal(eventDiscovered('hungry_chest',profile),true);
 assert.equal(mapEventState('hungry_chest',{profile}),'discovered');
 assert.equal(visibleMapEvents('basement',{profile,revealSecrets:true}).length,0);
 assert.deepEqual(visibleMapEvents('basement',{profile,revealSecrets:true,showDiscovered:true}).map(e=>e.id),['hungry_chest']);
});

test('hidden secrets stay off the map until secret reveal is enabled',()=>{
 assert.deepEqual(visibleMapEvents('courtyard',{}),[]);
 assert.deepEqual(visibleMapEvents('courtyard',{revealSecrets:true}).map(e=>e.id),['forgotten_grave']);
});

test('conditional throne secret enforces equipment and king requirements',()=>{
 const event=mapEvent('broken_crown_altar');
 assert.equal(eventConditionsMet(event,{inventory:{sword:1,shield:1},kingDefeated:false}),false);
 assert.equal(eventConditionsMet(event,{inventory:{sword:1,shield:1,wand:1,flask:1},kingDefeated:true}),false);
 assert.equal(eventConditionsMet(event,{inventory:{sword:1,shield:1,wand:1},kingDefeated:true}),true);
});

test('completion validates map and availability without granting a character directly',()=>{
 assert.throws(()=>completeMapEvent('hungry_chest',{mapId:'courtyard'}),/another map/);
 const result=completeMapEvent('hungry_chest',{mapId:'basement'});
 assert.equal(result.eventId,'hungry_chest');
 assert.deepEqual(result.reward,{type:'future-character-hook',id:'mimic'});
 assert.match(result.text,/chest opens/i);
});

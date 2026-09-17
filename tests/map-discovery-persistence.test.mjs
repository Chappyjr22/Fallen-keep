import test from 'node:test';
import assert from 'node:assert/strict';
import {guestRequest} from '../public/guest.mjs';

test('guest map discoveries persist once per account and stay map-scoped',()=>{
 const oldStorage=globalThis.localStorage;
 const store={value:JSON.stringify({profile:{coins:0,speed:0,health:0,damage:0,pickup:0,discoveries:[]},runs:{}}),getItem(){return this.value;},setItem(_k,v){this.value=v;}};
 globalThis.localStorage=store;
 try{
  guestRequest('run/start',{runId:'dungeon-run',character:'knight',mapId:'courtyard'});
  assert.throws(()=>guestRequest('discovery',{runId:'dungeon-run',eventId:'hungry_chest'}),/another map/);
  guestRequest('run/start',{runId:'basement-run',character:'knight',mapId:'courtyard'});
  const state=JSON.parse(store.value);state.runs['basement-run'].mapId='basement';store.value=JSON.stringify(state);
  const first=guestRequest('discovery',{runId:'basement-run',eventId:'hungry_chest'});
  assert.deepEqual(first.profile.discoveries,['hungry_chest']);
  const second=guestRequest('discovery',{runId:'basement-run',eventId:'hungry_chest'});
  assert.deepEqual(second.profile.discoveries,['hungry_chest']);
  assert.deepEqual(guestRequest('profile').discoveries,['hungry_chest']);
 }finally{globalThis.localStorage=oldStorage;}
});

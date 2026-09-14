import test from 'node:test';
import assert from 'node:assert/strict';
import {createStarterTraits,advanceStarterTraits,castWand,catalystPattern,shieldPulse,repulseVector} from '../public/starter-traits.mjs';
import {recordMastery,recordTransformation,validMilestones,heroMilestoneMetrics} from '../public/starter-milestones.mjs';
import {CoopWorld} from '../public/coop-model.mjs';
import {validSnapshot} from '../public/coop-network.mjs';
import {guestRequest} from '../public/guest.mjs';
import {characterUnlocked} from '../public/achievements.mjs';
const world=(hero)=>new CoopWorld('courtyard',[{character:hero,bonuses:{}},{character:'knight',bonuses:{}}],()=>.2);
test('mastery survives fusion/discard and unlocks require a finalized qualifying run',()=>{
 const r={inv:{shield:8,wand:8,flask:8,censer:8},elapsed:900,kills:750};recordMastery(r);r.inv={sabbath:1};recordTransformation(r,'sabbath');assert.equal(r.mastery,15);assert(validMilestones(r.mastery,r.transforms));assert(Object.values(heroMilestoneMetrics([r])).every(n=>n===0));r.closed=true;assert(Object.values(heroMilestoneMetrics([r])).every(n=>n===1));assert.equal(heroMilestoneMetrics([{closed:true,mastery:1,elapsed:719}]).sentinelUnlocked,0);assert.equal(heroMilestoneMetrics([{closed:true,mastery:2,kills:749}]).arcanistUnlocked,0);assert.equal(heroMilestoneMetrics([{closed:true,mastery:4,elapsed:899}]).chaplainUnlocked,0);
 for(const pair of [[16,0],[-1,0],[1.5,0],[0,1],[8,2],['8',1]])assert(!validMilestones(...pair));
});
test('Arcane Echo waits for simulation time, halves damage, never recurses, and cancels without wand',()=>{
 const s=createStarterTraits(),shots=[];for(let i=0;i<4;i++)castWand(s,true,{damage:60,count:3},q=>shots.push(q));assert.equal(shots.length,4);advanceStarterTraits(s,.29,q=>shots.push(q));assert.equal(shots.length,4);advanceStarterTraits(s,.01,q=>shots.push(q));assert.equal(shots[4].damage,30);assert.equal(shots[4].count,3);advanceStarterTraits(s,10,q=>shots.push(q));assert.equal(shots.length,5);for(let i=0;i<4;i++)castWand(s,true,{damage:60},()=>{});advanceStarterTraits(s,.3,()=>assert.fail('discarded wand fired'),false);
});
test('Repulse needs four hits, respects cooldown and boss knockback resistance',()=>{
 const s=createStarterTraits();assert.deepEqual([1,2,3,4].map(()=>shieldPulse(s,true)),[false,false,false,true]);assert([1,2,3,4].every(()=>!shieldPulse(s,true)));advanceStarterTraits(s,2,()=>{});assert.deepEqual([1,2,3,4].map(()=>shieldPulse(s,true)),[false,false,false,true]);assert.deepEqual(repulseVector({x:0,y:0},{x:100,y:0},150,.2),{x:9.600000000000001,y:0});assert.equal(repulseVector({x:0,y:0},{x:100,y:0},150,0),null);assert.equal(repulseVector({x:0,y:0},{x:200,y:0},150),null);
});
test('Catalyst empowers exactly every third volley without mutating other flask users',()=>{
 const s=createStarterTraits(),q={poolRadius:80,count:5};assert.equal(catalystPattern(s,false,q),q);assert.deepEqual([1,2,3,4,5,6].map(()=>catalystPattern(s,true,q).poolRadius),[80,80,100,80,80,100]);assert.equal(q.poolRadius,80);
});
test('co-op Sanctuary heals self and nearby living ally only while a hostile occupies aura',()=>{
 const w=world('chaplain'),[p,q]=w.players;w.enemies=[];p.hp=50;q.hp=50;q.x=p.x+20;q.y=p.y;w.tickStarterTraits(p,1);assert.equal(p.hp,50);w.enemies=[{x:p.x+30,y:p.y,dead:false,tier:'normal'}];w.tickStarterTraits(p,1);assert.equal(p.hp,51);assert.equal(q.hp,51);q.hp=0;w.tickStarterTraits(p,1);assert.equal(q.hp,0);q.hp=50;q.x=p.x+1000;w.tickStarterTraits(p,1);assert.equal(q.hp,50);w.enemies[0].tier='breakable';const hp=p.hp;w.tickStarterTraits(p,1);assert.equal(p.hp,hp);
});
test('co-op tracks mastery per owner and new heroes serialize with fresh trait state',()=>{
 for(const hero of ['sentinel','arcanist','alchemist','chaplain']){const w=world(hero),[p,q]=w.players;p.inv={shield:8,wand:8};w.refresh();assert.equal(p.mastery,3);assert.equal(q.mastery,0);assert(validSnapshot(JSON.parse(JSON.stringify(w.snapshot()))));const next=world(hero);assert.equal(next.players[0].mastery,0);assert.equal(next.players[0].starterTraits.echoes.length,0);}
});
test('guest milestones are monotonic across retries and unlock only after finishing',()=>{
 const old=globalThis.localStorage;let value=null;globalThis.localStorage={getItem:()=>value,setItem:(k,v)=>value=v};try{guestRequest('run/start',{runId:'hero',character:'knight'});const base={runId:'hero',gold:0,kills:750,elapsed:900};guestRequest('run/checkpoint',{...base,mastery:15,transforms:1});assert(!characterUnlocked('sentinel',guestRequest('profile').achievements));guestRequest('run/checkpoint',{...base,mastery:0,transforms:0,finished:true});for(const id of ['sentinel','arcanist','alchemist','chaplain'])assert(characterUnlocked(id,guestRequest('profile').achievements));guestRequest('run/checkpoint',{...base,finished:true});assert.equal(JSON.parse(value).runs.hero.mastery,15);assert.throws(()=>guestRequest('run/checkpoint',{...base,mastery:16}),/Invalid/);}finally{globalThis.localStorage=old;}
});

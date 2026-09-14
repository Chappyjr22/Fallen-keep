import test from 'node:test';import assert from 'node:assert/strict';
import {coopEnemyType,coopZoom,soloEnemyType,eliteDue} from '../public/coop-tuning.mjs';
import {CoopWorld} from '../public/coop-model.mjs';
test('opening wave has no witches and early waves respect their cap',()=>{const w=new CoopWorld('courtyard',[{character:'knight',bonuses:{}},{character:'witch',bonuses:{}}],()=>.01);assert(!w.enemies.some(e=>e.tier!=='breakable'&&e.type===2));assert.notEqual(coopEnemyType(239,[],()=>0),2);assert.equal(coopEnemyType(240,[],()=>0),2);assert.notEqual(coopEnemyType(300,[{type:2},{type:2}],()=>0),2);assert.equal(coopEnemyType(480,[{type:2},{type:2}],()=>0),2);});
test('witch probability ramps from five to sixteen percent',()=>{for(const [time,rate] of [[300,.05],[500,.1],[800,.16]]){let count=0;for(let i=0;i<1000;i++)if(coopEnemyType(time,[],()=>i/1000)===2)count++;assert.equal(count,rate*1000);}});
test('short multiplayer screens keep at least ninety percent scale',()=>{assert.equal(coopZoom(394),.9);assert.equal(coopZoom(800),1);assert.equal(coopZoom(1200),1.25);});

test('solo and co-op share witch gate and cap including elite witches',()=>{for(const choose of [soloEnemyType,coopEnemyType]){assert.notEqual(choose(239,[],()=>0),2);assert.equal(choose(240,[],()=>0),2);assert.notEqual(choose(479,[{type:2,elite:true},{type:2}],()=>0),2);}});
test('elite schedule delays at cap without a catch-up burst',()=>{assert(!eliteDue(179,180,[]));assert(eliteDue(180,180,[]));assert(!eliteDue(300,300,[{elite:true}]));assert(eliteDue(301,300,[{elite:true,dead:true}]));assert(!eliteDue(420,421,[]));assert(eliteDue(600,421,[{tier:'elite'}]));assert(!eliteDue(600,421,[{tier:'elite'},{tier:'elite'}]));});

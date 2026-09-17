import test from 'node:test';
import assert from 'node:assert/strict';
import {hungryChestPosition,hungryChestAvailable,mimicBossStats,MIMIC_EVENT_ID} from '../public/mimic-event.mjs';

test('Hungry Chest places inside The Cells on the basement map',()=>{
 const map={id:'basement',zones:[{name:'The Cells',x:1440,y:3120,r:720}]};
 const at=hungryChestPosition(map);
 assert(at);
 assert(at.x>1440);
 assert(at.y<3120);
 assert.equal(hungryChestPosition({id:'courtyard',zones:map.zones}),null);
});

test('Hungry Chest only appears for undiscovered basement runs',()=>{
 assert.equal(hungryChestAvailable({mapId:'basement',runId:'run-1',discoveries:[]}),true);
 assert.equal(hungryChestAvailable({mapId:'basement',runId:'run-1',discoveries:[MIMIC_EVENT_ID]}),false);
 assert.equal(hungryChestAvailable({mapId:'courtyard',runId:'run-1',discoveries:[]}),false);
 assert.equal(hungryChestAvailable({mapId:'basement',discoveries:[]}),false);
});

test('Mimic remains lethal while scaling predictably with run time',()=>{
 const early=mimicBossStats(0),late=mimicBossStats(1200);
 assert(early.maxHp>=900);
 assert(early.damage>=18);
 assert(late.maxHp>early.maxHp);
 assert(late.damage>early.damage);
 assert(late.speed>=early.speed);
 assert(late.lungeSpeed>late.speed);
 assert(late.lungeDuration>0&&late.lungeEvery>late.lungeDuration);
});

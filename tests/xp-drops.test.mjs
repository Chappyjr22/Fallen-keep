import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CoopWorld} from '../public/coop-model.mjs';
const source=readFileSync(new URL('../public/game.js',import.meta.url),'utf8');
// Execute the actual solo drop method without booting Phaser or account UI.
const dropGem=Function('return ({'+source.match(/ dropGem\(x,y,value\)\{[^\n]+/)[0]+'}).dropGem')();
function sprite(x,y){return {x,y,setPosition(x,y){this.x=x;this.y=y;return this;},setDepth(){return this;}};}
const world=()=>new CoopWorld('courtyard',[{character:'knight',bonuses:{}},{character:'witch',bonuses:{}}],()=>.2);
test('solo cap preserves XP and makes the new kill location collectible',()=>{const s={gems:Array.from({length:260},(_,i)=>({s:sprite(i,0),value:1,pulling:true}))};dropGem.call(s,5000,5000,100);assert.equal(s.gems.length,260);assert.equal(s.gems.reduce((n,g)=>n+g.value,0),360);assert(s.gems.some(g=>g.s.x===5000&&g.s.y===5000&&!g.pulling));});
test('co-op cap keeps merged XP visible at the new kill',()=>{const w=world();w.loot=Array.from({length:330},(_,i)=>({id:i,kind:'xp',x:i,y:0,amount:1}));w.drop('xp',5000,5000,100);assert.equal(w.loot.length,330);assert.equal(w.loot.reduce((n,l)=>n+l.amount,0),430);assert(w.loot.some(l=>l.x===5000&&l.y===5000));});
test('boss chest and relic cannot erase XP while making room at the cap',()=>{const w=world();w.loot=Array.from({length:330},(_,i)=>({id:i,kind:'xp',x:0,y:0,amount:1}));const before=w.players[0].xp;w.drop('xp',200,200,100);w.drop('chest',200,200,1);w.drop('passive',245,200,1);const remaining=w.loot.filter(l=>l.kind==='xp').reduce((n,l)=>n+l.amount,0),credited=(w.players[0].xp-before)/w.players[0].stats.growth;assert.equal(remaining+credited,430);assert(w.loot.some(l=>l.kind==='chest'));assert(w.loot.some(l=>l.kind==='passive'));});

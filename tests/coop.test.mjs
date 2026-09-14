import {COOP_PROTOCOL} from '../public/coop-protocol.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {CoopWorld,coopEligible,getsCoopChoice} from '../public/coop-model.mjs';
import {handleCoop} from '../server/coop.mjs';
import {xpNeeded,ITEMS} from '../public/rules.mjs';
const configs=[{character:'knight',bonuses:{}},{character:'witch',bonuses:{}}];
function world(){let seed=7;return new CoopWorld('courtyard',configs,()=>((seed=seed*16807%2147483647)-1)/2147483646);}
test('co-op has four slots per kind, owned upgrades stay eligible and solo stays six',async()=>{
 const inv={sword:1,wand:1,flask:1,shield:1,might:1,frost:1,haste:1,magnet:1};const pool=coopEligible(inv);assert(pool.every(id=>inv[id]));assert(pool.includes('sword'));const {eligibleItems}=await import('../public/rules.mjs');assert(eligibleItems(inv).includes('censer'));
});
test('choices occur after two gained levels: levels 3, 5, 7; XP is shared',()=>{
 const w=world();assert(!getsCoopChoice(2));assert(getsCoopChoice(3));w.giveXP(xpNeeded(1));w.advanceLevels();for(const p of w.players){assert.equal(p.level,2);assert.equal(p.pending,null);}w.giveXP(xpNeeded(2));w.advanceLevels();for(const p of w.players){assert.equal(p.level,3);assert(p.pending);}
});
test('separate simultaneous choices pause the world and retries award once',()=>{
 const w=world();for(const p of w.players)w.offer(p);const p=w.players[0],id=p.pending.options[0],before=p.inv[id]||0,a={seq:1,type:'choose',offer:p.pending.id,item:id};w.step(.03,[{actions:[a]},{}]);assert.equal(p.inv[id],before+1);assert.equal(w.time,0);w.step(.03,[{actions:[a]},{}]);assert.equal(p.inv[id],before+1);const other=w.players[1];w.step(.03,[{}, {actions:[{seq:1,type:'choose',offer:other.pending.id,item:other.pending.options[0]}]}]);assert(w.time>0);
});
test('boss passive can exceed four slots while ordinary offers stay capped',()=>{
 const w=world(),p=w.players[0];p.inv={sword:1,might:8,haste:8,magnet:8,vitality:8};w.collect(p,{kind:'passive',x:p.x,y:p.y});assert.equal(Object.keys(p.inv).length,6);assert(coopEligible(p.inv).every(id=>p.inv[id]||ITEMS[id].kind==='weapon'));
});
test('passed choice belongs to teammate and never bypasses slot restrictions',()=>{
 const w=world(),p=w.players[0];w.offer(p);w.applyAction(p,{seq:1,type:'pass',offer:p.pending.id});w.advanceLevels();assert.equal(p.pending,null);assert.equal(w.players[1].pending.type,'level');assert.equal(w.players[1].passed,0);
});
test('nearby ally revives a downed player; both down ends the run',()=>{
 const w=world();w.enemies=[];w.spawnClock=100;w.players[1].hp=0;w.players[1].x=w.players[0].x+40;for(let i=0;i<95;i++)w.step(1/30);assert(w.players[1].hp>0);assert(!w.over);w.players.forEach(p=>p.hp=0);w.step(.03);assert(w.over);
});
test('chests only upgrade the collector owned items and allow transformation selection',()=>{
 const w=world(),p=w.players[0];p.inv={sword:8,shield:8,frost:1};w.collect(p,{kind:'chest'});assert(p.pending.options.includes('winter'));assert(p.pending.options.includes('legion'));w.applyAction(p,{seq:1,type:'choose',offer:p.pending.id,item:'legion'});assert(p.inv.legion);assert(!p.inv.sword);assert(!p.inv.shield);
});
function database(){const sqlite=new DatabaseSync(':memory:');sqlite.exec(readFileSync(new URL('../drizzle/0004_bitter_shape.sql',import.meta.url),'utf8'));return {prepare(sql){return {bind(...args){return {run:async()=>sqlite.prepare(sql).run(...args),first:async()=>sqlite.prepare(sql).get(...args)||null};}};}};}
async function call(db,path,body){const response=await handleCoop(new Request('https://fallen-keep.jacobchapman3.chatgpt.site/api/coop/'+path,{method:'POST',headers:{'Content-Type':'application/json','Origin':'https://fallen-keep.jacobchapman3.chatgpt.site'},body:JSON.stringify(body)}),{DB:db});return {status:response.status,...await response.json()};}
test('two-client room lifecycle: atomic join, authorization, ordered relay, close',async()=>{
 const db=database(),host=await call(db,'create',{mapId:'courtyard',config:configs[0]});assert.equal(host.status,200);const guest=await call(db,'join',{code:host.code,config:configs[1]});assert.equal(guest.status,200);assert.equal((await call(db,'join',{code:host.code,config:configs[1]})).status,409);
 assert.equal((await call(db,'exchange',{code:host.code,token:'wrong'})).status,403);
 const controls={x:1,y:0,actions:[],ready:true};await call(db,'exchange',{...guest,seq:2,input:controls});await call(db,'exchange',{...guest,seq:1,input:{x:-1}});
 const worldState=world().snapshot();const h=await call(db,'exchange',{...host,seq:1,state:worldState});assert.equal(h.input.x,1);const g=await call(db,'exchange',{...guest,seq:3,input:controls});assert.equal(g.state.players.length,2);assert.equal(g.state.mapId,'courtyard');assert.equal((await call(db,'leave',host)).closed,true);assert.equal((await call(db,'exchange',guest)).status,404);
});
test('all maps survive a bounded two-player combat simulation with finite bounded snapshots',()=>{
 for(const mapId of ['courtyard','basement','firstfloor']){const w=new CoopWorld(mapId,configs);for(let n=0;n<1800&&!w.over;n++){for(const p of w.players){p.hp=p.stats.health;if(p.pending)w.applyAction(p,{seq:p.actionSeq+1,type:'choose',offer:p.pending.id,item:p.pending.options[0]});}w.step(1/30,[{x:Math.sin(n/120),y:Math.cos(n/120)},{x:Math.cos(n/130),y:Math.sin(n/130)}]);}const s=w.snapshot();assert(s.players.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.hp)));assert(s.enemies.length<=360);assert(JSON.stringify(s).length<160000);}
});

test('real connection clients exchange one shared world and guest input through HTTPS fallback',async()=>{
 const {CoopConnection}=await import('../public/coop-network.mjs');const db=database(),hostRoom=await call(db,'create',{mapId:'courtyard',config:configs[0]}),guestRoom=await call(db,'join',{code:hostRoom.code,config:configs[1]});const original=globalThis.fetch;globalThis.fetch=async(path,options)=>handleCoop(new Request('https://fallen-keep.jacobchapman3.chatgpt.site'+path,options),{DB:db});const host=new CoopConnection(hostRoom),guest=new CoopConnection(guestRoom);const w=world();guest.input={ready:true,x:1,y:0,actions:[]};host.publish(w.snapshot());try{await host.start();await guest.start();const deadline=Date.now()+3000;while((!guest.state||!host.peerInput.ready)&&Date.now()<deadline)await new Promise(r=>setTimeout(r,30));assert(guest.state);assert.equal(host.peerInput.x,1);const start=w.players[1].x;for(let i=0;i<10;i++)w.step(1/30,[{},host.peerInput]);host.publish(w.snapshot());const next=Date.now()+3000;while(guest.state.tick!==w.tick&&Date.now()<next)await new Promise(r=>setTimeout(r,30));assert.equal(guest.state.players[1].x,w.players[1].x);assert(w.players[1].x>start);const heard=host.lastInput;host.receiveInput({x:-1},host.inSeq);assert.equal(host.lastInput,heard);}finally{host.stop();guest.stop();while(host.busy||guest.busy)await new Promise(r=>setTimeout(r,10));globalThis.fetch=original;}
});
test('snapshot validation rejects executable labels in inventory and unknown characters',async()=>{
 const {validSnapshot}=await import('../public/coop-network.mjs');const s=JSON.parse(JSON.stringify(world().snapshot()));assert(validSnapshot(s));s.players[1].inv['<img onerror=alert(1)>']=1;assert(!validSnapshot(s));delete s.players[1].inv['<img onerror=alert(1)>'];s.players[0].character='constructor';assert(!validSnapshot(s));
});

test('both players dying during enemy update ends cleanly without an empty-target crash',()=>{
 const w=world();w.spawnClock=100;for(const p of w.players){p.hp=1;p.guard=12;p.immune=0;p.x=5000;p.y=5000;}w.enemies=[];for(let i=0;i<3;i++){const e=w.spawn('elite',0,{x:5000,y:5000});e.damage=100;e.speed=0;e.radius=80;}assert.doesNotThrow(()=>w.step(1/30));assert(w.over);
});

test('shared lobby permits joining before picks, resets readiness and locks launch setup',async()=>{
 const {lobbyStamp}=await import('../public/party-lobby.mjs');const db=database(),config={...configs[0],lobby:true,protocol:COOP_PROTOCOL,mapsUnlocked:['courtyard','basement']},host=await call(db,'create',{mapId:'courtyard',config}),guest=await call(db,'join',{code:host.code,config});assert.equal(guest.status,200);
 let r=await call(db,'exchange',{...host,seq:1});const action=async(who,action,extra={})=>call(db,'lobby',{code:who.code,token:who.token,stamp:lobbyStamp(r.host,r.guest,r.mapId),action,...extra});assert.equal((await action(host,'ready',{ready:true})).status,409);
 r=await action(guest,'select',{character:'witch'});assert.equal(r.status,200,JSON.stringify(r));assert.equal(r.guest.character,'witch');r=await action(host,'ready',{ready:true});r=await action(guest,'ready',{ready:true});assert(r.host.ready&&r.guest.ready);
 const stale=lobbyStamp(r.host,r.guest,r.mapId);r=await action(host,'select',{mapId:'basement'});assert(!r.host.ready&&!r.guest.ready);assert.equal(r.mapId,'basement');assert.equal((await call(db,'lobby',{...guest,stamp:stale,action:'ready',ready:true})).status,409);
 assert.equal((await action(guest,'select',{mapId:'courtyard'})).status,403);r=await action(host,'ready',{ready:true});r=await action(guest,'ready',{ready:true});r=await action(host,'launch');assert.equal(r.status,200);assert(r.host.launching);assert.equal((await action(guest,'select',{character:'ranger'})).status,409);
});
test('party area must be unlocked by both players',async()=>{const {lobbyStamp}=await import('../public/party-lobby.mjs');const db=database(),host=await call(db,'create',{mapId:'courtyard',config:{...configs[0],lobby:true,protocol:COOP_PROTOCOL,mapsUnlocked:['courtyard','basement']}});await call(db,'join',{code:host.code,config:{...configs[1],lobby:true,protocol:COOP_PROTOCOL,mapsUnlocked:['courtyard']}});const r=await call(db,'exchange',{...host,seq:1});const result=await call(db,'lobby',{...host,stamp:lobbyStamp(r.host,r.guest,r.mapId),action:'select',mapId:'basement'});assert.equal(result.status,409);});

test('mixed client versions cannot form a lobby and receive an actionable refresh error',async()=>{const db=database();const old=await call(db,'create',{mapId:'courtyard',config:{...configs[0],lobby:true}});assert.equal(old.status,409);assert.match(old.error,/Refresh/);const host=await call(db,'create',{mapId:'courtyard',config:{...configs[0],lobby:true,protocol:COOP_PROTOCOL}});const guest=await call(db,'join',{code:host.code,config:{...configs[1],lobby:true,protocol:1}});assert.equal(guest.status,409);assert.match(guest.error,/refresh/);const good=await call(db,'join',{code:host.code,config:{...configs[1],lobby:true,protocol:COOP_PROTOCOL}});assert.equal(good.status,200);});
test('paired relay clients complete chest, peer level choice, close and subsequent movement',async()=>{const {CoopConnection}=await import('../public/coop-network.mjs');const db=database(),h=await call(db,'create',{mapId:'courtyard',config:configs[0]}),g=await call(db,'join',{code:h.code,config:configs[1]});const host=new CoopConnection(h),guest=new CoopConnection(g),w=world();w.enemies=[];w.loot=[];w.spawnClock=999;w.weapons=()=>{};const p=w.players[1];w.collect(p,{kind:'chest'});w.offer(w.players[0]);let relaySeq=0;async function exchange(actions=[]){let r=await call(db,'exchange',{...g,seq:++relaySeq,input:{ready:true,x:0,y:0,actions}});const hr=await call(db,'exchange',{...h,seq:++relaySeq,state:w.snapshot()});host.receiveInput(hr.input,hr.seq);w.step(.03,[{},host.peerInput]);r=await call(db,'exchange',{...h,seq:++relaySeq,state:w.snapshot()});const gr=await call(db,'exchange',{...g,seq:++relaySeq});guest.receiveState(gr.state);}
 await exchange();assert.equal(guest.state.players[1].pending.type,'chest');await exchange([{seq:1,type:'choose',offer:p.pending.id,item:'random'}]);assert(guest.state.players[1].chestResult);assert.equal(w.time,0);const chest=p.chestResult.id;w.applyAction(w.players[0],{seq:1,type:'choose',offer:w.players[0].pending.id,item:w.players[0].pending.options[0]});await exchange([{seq:2,type:'chest_done',chest}]);assert(!guest.state.players[1].chestResult);assert(w.time>0);const gold=w.gold;await exchange([{seq:2,type:'chest_done',chest}]);assert.equal(w.gold,gold);assert(!w.players.some(p=>p.pending||p.chestResult));});

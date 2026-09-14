import test from 'node:test';
import assert from 'node:assert/strict';
import {AudioDirector,normalizeAudioSettings,effectiveGain,chooseVariant,varyPitch} from '../public/audio-manager.mjs';

function storage(seed={}){const m=new Map(Object.entries(seed));return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),dump:()=>m};}

test('audio settings clamp and calculate independent bus gain',()=>{
 const s=normalizeAudioSettings({master:2,music:-1,sfx:.5,ambience:.25});
 assert.deepEqual(s,{master:1,music:0,sfx:.5,ambience:.25,muted:false});
 assert.equal(effectiveGain(s,'sfx',.8),.4);
 assert.equal(effectiveGain({...s,muted:true},'sfx',1),0);
});

test('variant and pitch selection are deterministic with injected random',()=>{
 assert.equal(chooseVariant(['a','b','c'],()=>.5),'b');
 assert.ok(Math.abs(varyPitch([.9,1.1],()=>.25)-.95)<1e-9);
});

test('legacy sound preference migrates to the new mixer',()=>{
 const a=new AudioDirector({storage:storage({'fallen-keep-sound':'off'}),AudioContextCtor:null});
 assert.equal(a.settings.muted,true);
});

test('event cooldown and concurrency protect survivor-game mixes',()=>{
 let now=1000;const a=new AudioDirector({storage:storage(),AudioContextCtor:null,now:()=>now});
 a.register('test',{bus:'sfx',cooldown:100,maxVoices:1,gain:1,variants:['x']});
 assert(a.canPlay('test'));a.lastPlayed.set('test',now);assert(!a.canPlay('test'));now+=101;assert(a.canPlay('test'));a.voices.set('test',1);assert(!a.canPlay('test'));
});

test('volume and mute changes persist',()=>{
 const s=storage(),a=new AudioDirector({storage:s,AudioContextCtor:null});
 a.setVolume('music',.33);a.setMuted(true);const b=new AudioDirector({storage:s,AudioContextCtor:null});
 assert.equal(b.settings.music,.33);assert.equal(b.settings.muted,true);
});

test('approved assets never fall back when throttled or unavailable',async()=>{
 const a=new AudioDirector({storage:storage(),AudioContextCtor:null});let fallback=0;
 a.legacyTone=()=>{fallback++;return true;};a.register('approved',{variants:['approved.ogg']});
 a.play=async()=>false;assert.equal(await a.cue('approved',[440]),false);
 a.play=async()=>{throw Error('decode failed');};assert.equal(await a.cue('approved',[440]),false);
 assert.equal(fallback,0);assert.equal(await a.cue('ui.confirm',[440]),true);assert.equal(fallback,1);
 a.setMuted(true);await a.cue('ui.confirm',[440]);assert.equal(fallback,1);
});

test('simultaneous playback respects voice cap after context unlock',async()=>{
 let starts=0;const node=()=>({gain:{value:0},connect(){}});
 class Context{constructor(){this.state='running';this.destination={};}createGain(){return node();}createBufferSource(){return{playbackRate:{value:1},connect(){},start(){starts++;}};}}
 const a=new AudioDirector({storage:storage(),AudioContextCtor:Context});a.register('once',{variants:['cached'],cooldown:0,maxVoices:1});a.buffers.set('cached',{});
 await Promise.all([a.play('once'),a.play('once')]);assert.equal(starts,1);
});

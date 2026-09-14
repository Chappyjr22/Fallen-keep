const STORAGE_KEY='fallen-keep-audio-v1';
export const AUDIO_BUSES=['master','music','sfx','ambience'];
export const DEFAULT_AUDIO_SETTINGS=Object.freeze({master:.9,music:.72,sfx:.88,ambience:.72,muted:false});

export const AUDIO_EVENTS=Object.freeze({
 'ui.confirm':{bus:'sfx',cooldown:40,maxVoices:2,gain:.55},
 'ui.back':{bus:'sfx',cooldown:40,maxVoices:2,gain:.45},
 'run.start':{bus:'sfx',cooldown:400,maxVoices:1,gain:.7},
 'player.hit':{bus:'sfx',cooldown:100,maxVoices:2,gain:.82},
 'player.block':{bus:'sfx',cooldown:120,maxVoices:1,gain:.75},
 'weapon.sword.swing':{bus:'sfx',cooldown:80,maxVoices:3,gain:.58,pitch:[.96,1.035]},
 'weapon.sword.impact':{bus:'sfx',cooldown:75,maxVoices:3,gain:.66,pitch:[.96,1.025]},
 'weapon.winter.cast':{bus:'sfx',cooldown:120,maxVoices:2,gain:.72,pitch:[.98,1.02]},
 'pickup.xp':{bus:'sfx',cooldown:38,maxVoices:3,gain:.24,pitch:[.96,1.06]},
 'pickup.coin':{bus:'sfx',cooldown:65,maxVoices:2,gain:.42,pitch:[.98,1.04]},
 'level.up':{bus:'sfx',cooldown:450,maxVoices:1,gain:.78},
 'chest.open':{bus:'sfx',cooldown:400,maxVoices:1,gain:.86},
 'chest.reveal':{bus:'sfx',cooldown:90,maxVoices:2,gain:.55,pitch:[.98,1.03]},
 'transform.reveal':{bus:'sfx',cooldown:800,maxVoices:1,gain:.95},
 'elite.arrival':{bus:'sfx',cooldown:1200,maxVoices:1,gain:.82},
 'boss.arrival':{bus:'sfx',cooldown:1800,maxVoices:1,gain:1},
 'unlock.earned':{bus:'sfx',cooldown:700,maxVoices:1,gain:.85},
});

const clamp01=n=>Math.max(0,Math.min(1,Number.isFinite(Number(n))?Number(n):0));
export function normalizeAudioSettings(value={}){return {
 master:clamp01(value.master??DEFAULT_AUDIO_SETTINGS.master),
 music:clamp01(value.music??DEFAULT_AUDIO_SETTINGS.music),
 sfx:clamp01(value.sfx??DEFAULT_AUDIO_SETTINGS.sfx),
 ambience:clamp01(value.ambience??DEFAULT_AUDIO_SETTINGS.ambience),
 muted:!!value.muted,
};}
export function effectiveGain(settings,bus,eventGain=1){settings=normalizeAudioSettings(settings);if(settings.muted)return 0;const lane=bus==='master'?1:settings[bus]??1;return clamp01(settings.master*lane*eventGain);}
export function chooseVariant(variants=[],random=Math.random){if(!variants.length)return null;return variants[Math.min(variants.length-1,Math.floor(random()*variants.length))];}
export function varyPitch(range,random=Math.random){if(!range)return 1;const [a,b]=range;return a+(b-a)*random();}

export class AudioDirector{
 constructor({storage=globalThis.localStorage,AudioContextCtor=globalThis.AudioContext||globalThis.webkitAudioContext,fetchFn=globalThis.fetch?.bind(globalThis),random=Math.random,now=()=>Date.now()}={}){
  this.storage=storage;this.AudioContextCtor=AudioContextCtor;this.fetchFn=fetchFn;this.random=random;this.now=now;this.context=null;this.masterNode=null;this.busNodes={};this.buffers=new Map();this.loading=new Map();this.lastPlayed=new Map();this.voices=new Map();this.manifest=new Map(Object.entries(AUDIO_EVENTS).map(([id,def])=>[id,{...def,variants:[]}])) ;this.settings=this.readSettings();
 }
 readSettings(){let parsed={};try{parsed=JSON.parse(this.storage?.getItem?.(STORAGE_KEY)||'{}')||{};const old=this.storage?.getItem?.('fallen-keep-sound');if(old==='off'&&parsed.muted===undefined)parsed.muted=true;}catch{}return normalizeAudioSettings(parsed);}
 saveSettings(){try{this.storage?.setItem?.(STORAGE_KEY,JSON.stringify(this.settings));this.storage?.setItem?.('fallen-keep-sound',this.settings.muted?'off':'on');}catch{}}
 configure(manifest={}){for(const [id,patch] of Object.entries(manifest)){const base=this.manifest.get(id)||{bus:'sfx',cooldown:0,maxVoices:3,gain:1,variants:[]};this.manifest.set(id,{...base,...patch,variants:[...(patch.variants??base.variants??[])]});}return this;}
 ensureContext(){if(this.context||!this.AudioContextCtor)return this.context;try{this.context=new this.AudioContextCtor();this.masterNode=this.context.createGain();this.masterNode.connect(this.context.destination);for(const bus of ['music','sfx','ambience']){const node=this.context.createGain();node.connect(this.masterNode);this.busNodes[bus]=node;}this.applyMix();}catch{return null;}return this.context;}
 async unlock(){const ctx=this.ensureContext();if(ctx?.state==='suspended')try{await ctx.resume();}catch{}return !!ctx;}
 applyMix(){if(!this.masterNode)return;const muted=this.settings.muted?0:1;this.masterNode.gain.value=this.settings.master*muted;for(const bus of ['music','sfx','ambience'])if(this.busNodes[bus])this.busNodes[bus].gain.value=this.settings[bus];}
 setVolume(bus,value){if(!AUDIO_BUSES.includes(bus))throw new Error('Unknown audio bus: '+bus);this.settings={...this.settings,[bus]:clamp01(value)};this.applyMix();this.saveSettings();return this.settings;}
 setMuted(value){this.settings={...this.settings,muted:!!value};this.applyMix();this.saveSettings();return this.settings.muted;}
 toggleMuted(){return this.setMuted(!this.settings.muted);}
 snapshot(){return {...this.settings};}
 register(id,definition){return this.configure({[id]:definition});}
 canPlay(id,definition=this.manifest.get(id)){if(!definition||this.settings.muted)return false;const t=this.now(),last=this.lastPlayed.get(id)??-Infinity;if(t-last<(definition.cooldown||0))return false;const count=this.voices.get(id)||0;if(count>=(definition.maxVoices??3))return false;return true;}
 async load(url){if(this.buffers.has(url))return this.buffers.get(url);if(this.loading.has(url))return this.loading.get(url);const ctx=this.ensureContext();if(!ctx||!this.fetchFn)return null;const pending=(async()=>{try{const response=await this.fetchFn(url);if(!response.ok)throw new Error('audio '+response.status);const data=await response.arrayBuffer();const buffer=await ctx.decodeAudioData(data.slice(0));this.buffers.set(url,buffer);return buffer;}catch{return null;}finally{this.loading.delete(url);}})();this.loading.set(url,pending);return pending;}
 async preload(ids=[]){const tasks=[];for(const id of ids){const def=this.manifest.get(id);for(const url of def?.variants||[])tasks.push(this.load(url));}await Promise.all(tasks);}
 async play(id,{gain=1,rate=1}={}){const def=this.manifest.get(id);if(!this.canPlay(id,def))return false;const url=chooseVariant(def.variants,this.random);if(!url)return false;const buffer=await this.load(url);if(!buffer||!this.canPlay(id,def))return false;const ctx=this.ensureContext();if(!ctx)return false;await this.unlock();const source=ctx.createBufferSource(),node=ctx.createGain();source.buffer=buffer;source.playbackRate.value=rate*varyPitch(def.pitch,this.random);node.gain.value=clamp01((def.gain??1)*gain);source.connect(node);node.connect(this.busNodes[def.bus]||this.busNodes.sfx||this.masterNode);this.lastPlayed.set(id,this.now());this.voices.set(id,(this.voices.get(id)||0)+1);source.onended=()=>this.voices.set(id,Math.max(0,(this.voices.get(id)||1)-1));source.start();return true;}
 // Temporary bridge for the snapshot's oscillator cues. This is deliberately
 // isolated so production assets can replace it event-by-event without changing gameplay code.
 legacyTone(freq=350,dur=.06,type='sine',vol=.03){if(this.settings.muted)return false;const ctx=this.ensureContext();if(!ctx)return false;this.unlock();try{const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(20,freq*.65),ctx.currentTime+dur);g.gain.setValueAtTime(vol*this.settings.sfx,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+dur);o.connect(g);g.connect(this.masterNode);o.start();o.stop(ctx.currentTime+dur);return true;}catch{return false;}}
}

export const gameAudio=new AudioDirector();

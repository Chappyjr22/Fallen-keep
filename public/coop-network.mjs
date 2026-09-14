import {viewSize} from './boss-return.mjs';
import {validMilestones} from './starter-milestones.mjs';
import {ITEMS} from './rules.mjs';
import {CHARACTERS} from './characters.mjs';
import {MAPS} from './maps.mjs';
export async function roomRequest(path,body){const response=await fetch('/api/coop/'+path,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify(body),signal:AbortSignal.timeout(7000)});let data;try{data=await response.json();}catch{throw new Error('Could not reach the co-op room. Try again.');}if(!response.ok){const error=new Error(data.error||'Room connection interrupted');error.status=response.status;throw error;}return data;}
// Room tokens are capabilities kept in memory only. HTTPS relay is always available
// when a direct WebRTC connection is blocked by a firewall or NAT.
export class CoopConnection{
 constructor(room){Object.assign(this,room);this.seq=0;this.inSeq=0;this.outSeq=0;this.lastPeer=Date.now();this.peerInput={};this.state=null;this.running=false;this.closed=false;this.error='';this.signal=null;this.sentSignal=null;this.lastRelay=0;this.lastDirect=0;this.ready=false;this.input={ready:false,x:0,y:0,actions:[]};this.onState=()=>{};this.onRoom=()=>{};}
 async start(){this.running=true;this.setupRTC().catch(()=>{});this.loop();}
 channelReady(){return this.channel?.readyState==='open'&&this.channel.bufferedAmount<120000;}
 direct(){return this.channelReady()&&Date.now()-this.lastDirect<1800;}
 async setupRTC(){if(!globalThis.RTCPeerConnection)return;this.pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.cloudflare.com:3478'}]});this.pc.ondatachannel=e=>this.attach(e.channel);if(this.role==='host'){this.attach(this.pc.createDataChannel('keep',{ordered:false,maxRetransmits:0}));await this.pc.setLocalDescription(await this.pc.createOffer());await this.gather();this.signal=JSON.stringify(this.pc.localDescription);}}
 attach(channel){this.channel=channel;channel.binaryType='arraybuffer';channel.onmessage=async e=>{try{const raw=typeof e.data==='string'?e.data:await new Response(new Blob([e.data]).stream().pipeThrough(new DecompressionStream('gzip'))).text();const m=JSON.parse(raw);if(m.type==='state'&&this.role==='guest')this.receiveState(m.value);else if(m.type==='input'&&this.role==='host')this.receiveInput(m.value,m.seq);this.lastDirect=Date.now();this.lastPeer=Date.now();}catch{}};}
 gather(){return new Promise(resolve=>{if(this.pc.iceGatheringState==='complete')return resolve();const finish=()=>{clearTimeout(timer);this.pc?.removeEventListener('icegatheringstatechange',check);resolve();};const check=()=>{if(this.pc.iceGatheringState==='complete')finish();};const timer=setTimeout(finish,5000);this.pc.addEventListener('icegatheringstatechange',check);});}
 async remoteSignal(value){if(!this.pc||!value||this.remoteSet)return;this.remoteSet=true;try{await this.pc.setRemoteDescription(JSON.parse(value));if(this.role==='guest'){await this.pc.setLocalDescription(await this.pc.createAnswer());await this.gather();this.signal=JSON.stringify(this.pc.localDescription);}}catch{this.remoteSet=false;}}
 receiveState(s){if(!validSnapshot(s)||s.tick<(this.state?.tick??-1))return;const newer=s.tick>(this.state?.tick??-1);this.state=s;if(newer)this.lastPeer=Date.now();this.onState(s);}
 receiveInput(input,seq){if(!input||seq<=this.inSeq)return;this.inSeq=seq;this.peerInput={view:viewSize(input.view),x:Math.max(-1,Math.min(1,Number(input.x)||0)),y:Math.max(-1,Math.min(1,Number(input.y)||0)),ready:!!input.ready,actions:Array.isArray(input.actions)?input.actions.slice(0,12).filter(a=>a&&typeof a==='object'&&Number.isSafeInteger(a.seq)):[]};this.lastInput=Date.now();this.lastPeer=Date.now();}
 publish(state){this.outgoing=state;}
 async sendDirect(){if(!this.channelReady()||this.encoding)return;const value=this.role==='host'?this.outgoing:this.input;if(!value)return;this.encoding=true;try{const data=JSON.stringify({type:this.role==='host'?'state':'input',value,seq:++this.seq});let payload=data;if(data.length>2000&&globalThis.CompressionStream)payload=await new Response(new Blob([data]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer();if(this.channelReady())this.channel.send(payload);}catch{this.channel?.close();}finally{this.encoding=false;}}
 async loop(){while(this.running){const began=Date.now();this.sendDirect();const direct=this.direct();if(!this.busy&&began-this.lastRelay>(direct?1200:this.outgoing||this.role==='guest'?140:700)){this.busy=true;this.lastRelay=began;const body={code:this.code,token:this.token,seq:++this.seq};if(this.signal!==this.sentSignal)body.signal=this.signal;const relay=!direct||!this.outgoing;if(this.role==='host'&&this.outgoing&&relay)body.state=this.outgoing;if(this.role==='guest'&&(relay||!this.ready))body.input=this.input;
  roomRequest('exchange',body).then(r=>{if(!this.running)return;this.error='';if(body.signal)this.sentSignal=body.signal;this.host=r.host;this.guest=r.guest;if(!this.outgoing&&!this.state&&r.mapId)this.mapId=r.mapId;this.closed=r.closed;if(r.peerSeen&&Date.now()-r.peerSeen<5000)this.lastPeer=Date.now();if(r.signal)this.remoteSignal(r.signal);if(r.input)this.receiveInput(r.input,r.seq);if(r.state)this.receiveState(r.state);this.onRoom(r);}).catch(e=>{if(!this.running)return;this.error=e.message;if(e.status===404)this.closed=true;}).finally(()=>{this.busy=false;});}
 await new Promise(resolve=>setTimeout(resolve,60));}}
 async leave(){this.stop();try{await roomRequest('leave',{code:this.code,token:this.token});}catch{}}
 stop(){this.running=false;this.channel?.close();this.pc?.close();}
}

export function validSnapshot(s){
 if(s?.layoutVersion!==undefined&&(!Number.isSafeInteger(s.layoutVersion)||s.layoutVersion<0))return false;
 const number=n=>typeof n==='number'&&Number.isFinite(n)&&Math.abs(n)<=1e9;
 if(!s||!Object.hasOwn(MAPS,s.mapId)||!number(s.tick)||!number(s.time)||!number(s.gold)||!number(s.kills)||!number(s.seals)||typeof s.message!=='string'||s.message.length>3000||!Array.isArray(s.pauses)||s.pauses.length!==2||!Array.isArray(s.players)||s.players.length!==2)return false;
 if(s.ending&&(!Array.isArray(s.ending.ready)||s.ending.ready.length!==2||s.ending.ready.some(v=>typeof v!=='boolean')))return false;
 if(s.transition){const t=s.transition;if(!Object.hasOwn(MAPS,t.target)||!['confirm','comic','prepare'].includes(t.phase)||!Number.isInteger(t.id)||!Number.isInteger(t.panel)||t.panel<0||t.panel>4||!['ready','prepared','skipped'].every(k=>Array.isArray(t[k])&&t[k].length===2&&t[k].every(v=>typeof v==='boolean')))return false;}
 for(const [i,p] of s.players.entries()){
  if(!validMilestones(p.mastery??0,p.transforms??0))return false;
  if(p.id!==i||!Object.hasOwn(CHARACTERS,p.character)||!['x','y','hp','level','xp','revive','facing','actionSeq','offerSeq'].every(k=>number(p[k]))||!p.inv||Object.entries(p.inv).some(([id,n])=>!Object.hasOwn(ITEMS,id)||!Number.isInteger(n)||n<1||n>ITEMS[id].max)||!p.stats||!Object.values(p.stats).every(number)||!p.charges||!['skip','reroll','banish'].every(k=>number(p.charges[k])))return false;
  if(p.chestResult&&(!number(p.chestResult.id)||!Array.isArray(p.chestResult.rewards)||p.chestResult.rewards.length>5||p.chestResult.rewards.some(r=>!['gold','item','evolution'].includes(r.type)||(r.type==='gold'?!number(r.amount):!Object.hasOwn(ITEMS,r.id)))))return false;
  if(p.pending&&(!['level','chest'].includes(p.pending.type)||!number(p.pending.id)||!Array.isArray(p.pending.options)||p.pending.options.length>6||p.pending.options.some(id=>!['gold','heal','random'].includes(id)&&!Object.hasOwn(ITEMS,id))))return false;
 }
 for(const [key,cap] of [['enemies',360],['loot',340],['bolts',240],['pools',60],['effects',40]])if(!Array.isArray(s[key])||s[key].length>cap||s[key].some(v=>!number(v.x)||!number(v.y)))return false;
 if(s.feedback&&(!Array.isArray(s.feedback)||s.feedback.length>80||s.feedback.some(f=>!number(f.id)||!number(f.x)||!number(f.y)||!number(f.t)||typeof f.text!=='string'||f.text.length>80||!/^#[0-9a-f]{6}$/i.test(f.color))))return false;
 if(s.enemies.some(e=>!number(e.id)||!number(e.hp)||!number(e.maxHp)||!number(e.size)||![0,1,2].includes(e.type)||!['normal','elite','boss','veteran','breakable'].includes(e.tier)))return false;
 return true;
}

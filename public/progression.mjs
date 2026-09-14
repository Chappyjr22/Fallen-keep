import {captureUnlocks} from './unlock-notices.mjs';
import {guestRequest} from './guest.mjs';
export let guestMode=false;
import {UPGRADES,upgradePrice} from './progression-rules.mjs';
export {UPGRADES,upgradePrice};
export let account=null;
const runModes=new Map();
let hadAccountSession=false;
const PLAYER_KEY='fallen-keep-player-id';
function playerId(){try{let id=localStorage.getItem(PLAYER_KEY);if(id&&/^[a-f0-9-]{36}$/i.test(id))return id;id=crypto.randomUUID();localStorage.setItem(PLAYER_KEY,id);return id;}catch{return crypto.randomUUID();}}
async function serverApi(path,body,keepalive=false){const headers={'X-Fallen-Keep-Player':playerId(),...(body?{'Content-Type':'application/json'}:{})};const response=await fetch('/api/'+path,{method:body?'POST':'GET',credentials:'same-origin',headers,...(body?{body:JSON.stringify(body)}:{}),keepalive:keepalive||path==='run/checkpoint',signal:AbortSignal.timeout(15000)});let data;try{data=await response.json();}catch{throw new Error('Could not reach your saved progress. Please retry.');}if(!response.ok){const error=new Error(data.error||'Could not save. Please retry.');error.status=response.status;throw error;}return data;}
export async function api(path,body,keepalive=false){
 const local=path==='run/checkpoint'&&runModes.has(body?.runId)?runModes.get(body.runId):guestMode;
 const data=local?guestRequest(path,body):await serverApi(path,body,keepalive);
 if(path==='run/start'&&data.runId)runModes.set(data.runId,local);
 if(data.profile&&local===guestMode){if(path==='run/checkpoint')captureUnlocks(account?.achievements,data.profile.achievements);account=data.profile;}
 return data;
}
export async function loadAccount(){
 try{const profile=await serverApi('profile');guestMode=false;hadAccountSession=true;account=profile;}
 catch(e){if(e.status!==401)throw e;if(hadAccountSession){const error=new Error('Your account session was interrupted. Sign in again, then refresh your progress.');error.status=401;throw error;}guestMode=true;account=guestRequest('profile');}
 if(!guestMode)await retryPending();return account;
}
// Device-local delivery queue only. The server remains authoritative for balances.
const PREFIX='fallen-keep-pending:';
function retain(snapshot){try{localStorage.setItem(PREFIX+snapshot.runId,JSON.stringify(snapshot));return true;}catch{return false;}}
function forget(snapshot){try{if(localStorage.getItem(PREFIX+snapshot.runId)===JSON.stringify(snapshot))localStorage.removeItem(PREFIX+snapshot.runId);}catch{}}
export async function retryPending(){let snapshots=[];try{snapshots=Object.keys(localStorage).filter(k=>k.startsWith(PREFIX)).map(k=>JSON.parse(localStorage.getItem(k)));}catch{}for(const snapshot of snapshots){try{await serverApi('run/checkpoint',snapshot);forget(snapshot);}catch{}}}
export class RunSave{
 constructor(id,onStatus){this.guest=runModes.get(id)??guestMode;runModes.set(id,this.guest);this.id=id;this.onStatus=onStatus;this.queue=Promise.resolve();this.closed=false;}
 save(stats,finished=false){if(this.closed)return Promise.resolve();const snapshot={mastery:stats.mastery||0,transforms:stats.transforms||0,runId:this.id,gold:stats.gold,elapsed:Math.floor(stats.elapsed),kills:stats.kills,kingDefeated:!!stats.kingDefeated,claims:!!stats.claimsComplete,seals:stats.runSeals||0,charted:!!stats.exploration?.revealed,finished};if(this.latest){for(const k of ['gold','elapsed','kills'])snapshot[k]=Math.max(snapshot[k],this.latest[k]);snapshot.kingDefeated||=this.latest.kingDefeated;snapshot.claims||=this.latest.claims;snapshot.mastery|=this.latest.mastery||0;snapshot.transforms|=this.latest.transforms||0;snapshot.seals|=this.latest.seals;snapshot.charted||=this.latest.charted;snapshot.finished||=this.latest.finished;}this.latest=snapshot;const retained=this.guest?false:retain(snapshot);const task=this.queue.catch(()=>{}).then(async()=>{if(this.closed)return;this.onStatus('Saving coins…');let error;for(let attempt=0;attempt<3;attempt++){try{await api('run/checkpoint',snapshot);error=null;break;}catch(e){error=e;if(e.status&&e.status<500)break;if(attempt<2)await new Promise(resolve=>setTimeout(resolve,1000*(attempt+1)));}}if(error)throw error;forget(snapshot);this.closed=snapshot.finished;this.onStatus(this.guest?'Coins saved in this browser.':'Coins saved to your account.');});this.queue=task;task.catch(e=>this.onStatus((retained?'Pending save kept on this device. ':'Keep this screen open. ')+(e.message||'Connection interrupted.')+' Tap Retry save.'));return task;}
}

import {api,account} from './progression.mjs';
import {eventDiscovered} from './map-events.mjs';
import {FORGOTTEN_GRAVE_ID,FORGOTTEN_GRAVE,COURTYARD_BELLS,forgottenGraveAvailable,nextBellTower,bellEncounterStats} from './courtyard-events.mjs';
import * as Game from './game.js';

const state={scene:null,runId:null,grave:null,hinted:false,completed:[],active:null,pulse:null,saving:false};

function toast(text){const el=document.querySelector('#toast');if(!el)return;el.textContent=text;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),3200);}
function destroy(obj){try{obj?.destroy?.();}catch{}}
function reset(runId){destroy(state.grave);destroy(state.pulse);state.runId=runId;state.grave=null;state.hinted=false;state.completed=[];state.active=null;state.pulse=null;state.saving=false;}
function activeArena(){return Game.scene||null;}

function ensureGrave(scene){
 if(state.grave||eventDiscovered(FORGOTTEN_GRAVE_ID,account))return;
 state.grave=scene.add.image(FORGOTTEN_GRAVE.x,FORGOTTEN_GRAVE.y,'castle','cell6').setDisplaySize(72,88).setOrigin(.5,.88).setDepth(FORGOTTEN_GRAVE.y).setTint(0x747b84);
}

async function discoverGrave(scene){
 if(state.saving||eventDiscovered(FORGOTTEN_GRAVE_ID,account))return;
 state.saving=true;
 try{
  await api('discovery',{runId:scene.runSave?.id,eventId:FORGOTTEN_GRAVE_ID});
  toast('SECRET DISCOVERED · The lantern stirs beside a forgotten grave.');
  destroy(state.grave);state.grave=null;
 }catch(error){toast('Secret discovered, but saving failed. '+(error?.message||'Try again later.'));}
 finally{state.saving=false;}
}

function beginBell(scene,bell){
 const q=bellEncounterStats(scene.elapsed),elite=scene.spawnEnemy(0,true,false,false,true);
 elite.name='Bellbound Warden';elite.maxHp=q.hp;elite.hp=q.hp;elite.damage=q.damage;elite.speed=q.speed;elite.bellEvent=bell.id;elite.dropsChest=false;
 elite.s.setPosition(bell.x,bell.y).setTint(0xcdb879);
 for(let i=0;i<q.horde;i++){
  const e=scene.spawnEnemy(i%3,false,false,false,i%4===0),a=i*Math.PI*2/q.horde,r=120+(i%3)*45;
  e.s.setPosition(bell.x+Math.cos(a)*r,bell.y+Math.sin(a)*r);
 }
 state.active={...bell,elite};
 toast(bell.name.toUpperCase()+' TOLLS · Something answers.');
 if(!state.pulse)state.pulse=scene.add.graphics().setDepth(40005);
}

function finishBell(scene){
 const a=state.active;if(!a)return;
 const x=a.elite?.s?.x||a.x,y=a.elite?.s?.y||a.y;
 const s=scene.add.image(x,y,'props','cell7').setDisplaySize(52,52).setOrigin(.5,.7).setDepth(y);
 scene.chests.push({s});
 state.completed.push(a.id);state.active=null;
 toast('THE BELL FALLS SILENT · A reward remains.');
}

function drawPulse(scene){
 if(!state.pulse)return;
 state.pulse.clear();
 if(!state.active)return;
 const wave=(Math.sin((scene.elapsed||0)*5)+1)/2,r=70+wave*22;
 state.pulse.lineStyle(3,0xd9bd73,.55).strokeCircle(state.active.x,state.active.y,r);
 state.pulse.lineStyle(1,0xffe3a1,.7).strokeCircle(state.active.x,state.active.y,r+12);
}

function tick(scene){
 const runId=scene.runSave?.id||null;if(runId!==state.runId)reset(runId);
 if(!runId||scene.map?.id!=='courtyard'||scene.mode==='over'){destroy(state.grave);state.grave=null;if(state.pulse)state.pulse.clear();return;}
 ensureGrave(scene);
 if(state.grave&&scene.player){
  const d=Math.hypot(scene.player.x-FORGOTTEN_GRAVE.x,scene.player.y-FORGOTTEN_GRAVE.y);
  if(d<FORGOTTEN_GRAVE.radius){
   if(forgottenGraveAvailable({mapId:'courtyard',discoveries:account?.discoveries,inventory:scene.inv}))discoverGrave(scene);
   else if(!state.hinted){state.hinted=true;toast('A forgotten name is carved here. Something in the dark might remember it.');}
  }
 }
 const bell=nextBellTower(scene.elapsed,state.completed,state.active?.id);
 if(bell)beginBell(scene,bell);
 if(state.active?.elite?.dead)finishBell(scene);
 drawPulse(scene);
}

function attach(scene){if(state.scene===scene)return;state.scene=scene;scene.events?.on?.('update',()=>tick(scene));}
const timer=setInterval(()=>{const scene=activeArena();if(scene){attach(scene);clearInterval(timer);}},250);

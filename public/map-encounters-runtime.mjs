import {api,account} from './progression.mjs';
import {eventDiscovered} from './map-events.mjs';
import {MIMIC_EVENT_ID,hungryChestPosition,hungryChestAvailable,mimicBossStats} from './mimic-event.mjs';
import * as Game from './game.js';

const state={scene:null,runId:null,chest:null,mimic:null,finished:false,lungeAt:0,lungeEnd:0};

function toast(text){const el=document.querySelector('#toast');if(!el)return;el.textContent=text;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),3200);}
function destroyChest(){if(state.chest){state.chest.destroy();state.chest=null;}}
function resetForRun(runId){destroyChest();state.runId=runId;state.mimic=null;state.finished=false;state.lungeAt=0;state.lungeEnd=0;}
function activeArena(){return Game.scene||null;}

function createHungryChest(scene){const at=hungryChestPosition(scene.map);if(!at)return;const image=scene.add.image(at.x,at.y,'props','cell7').setDisplaySize(66,66).setOrigin(.5,.72).setDepth(at.y).setTint(0xb5a0c9);image.setData('hungryChest',true);state.chest=image;}

function awaken(scene){if(!state.chest||state.mimic)return;const x=state.chest.x,y=state.chest.y;destroyChest();scene.camera?.shake?.(260,.006);toast('The chest moves. It was waiting for you.');const mimic=scene.spawnEnemy(2,false,true,false,true),q=mimicBossStats(scene.elapsed);mimic.name='The Hungry Chest';mimic.mimic=true;mimic.dropsChest=false;mimic.maxHp=q.maxHp;mimic.hp=q.maxHp;mimic.speed=q.speed;mimic.damage=q.damage;mimic.r=q.radius;mimic.s.stop();mimic.s.setTexture('props','cell7').setDisplaySize(102,102).setOrigin(.5,.72).setPosition(x,y).setTint(0xd7b9e8);state.mimic=mimic;state.lungeAt=(scene.elapsed||0)+q.lungeEvery;}

async function complete(scene){if(state.finished)return;state.finished=true;const runId=scene.runSave?.id;if(!runId)return;try{await api('discovery',{runId,eventId:MIMIC_EVENT_ID});toast('SECRET DISCOVERED · The chest was hungrier than you were.');const s=scene.add.image(state.mimic?.s?.x||scene.player.x,state.mimic?.s?.y||scene.player.y,'props','cell7').setDisplaySize(52,52).setOrigin(.5,.7);scene.chests.push({s});}catch(error){state.finished=false;toast('Secret discovered, but saving failed. '+(error?.message||'Try again later.'));}}

function tick(scene){const runId=scene.runSave?.id||null;if(runId!==state.runId)resetForRun(runId);if(!runId||scene.map?.id!=='basement'||scene.mode==='over'){destroyChest();return;}
 if(eventDiscovered(MIMIC_EVENT_ID,account)){destroyChest();state.finished=true;return;}
 if(!hungryChestAvailable({mapId:scene.map.id,discoveries:account?.discoveries,runId}))return;
 if(!state.chest&&!state.mimic&&!state.finished)createHungryChest(scene);
 if(state.chest&&scene.player&&Math.hypot(scene.player.x-state.chest.x,scene.player.y-state.chest.y)<78)awaken(scene);
 const mimic=state.mimic;if(!mimic)return;
 if(mimic.dead){complete(scene);return;}
 const q=mimicBossStats(scene.elapsed),now=scene.elapsed||0;
 if(now>=state.lungeAt){state.lungeAt=now+q.lungeEvery;state.lungeEnd=now+q.lungeDuration;mimic.s?.setTint?.(0xff8f8f);}
 if(now<state.lungeEnd)mimic.speed=q.lungeSpeed;else{mimic.speed=q.speed;mimic.s?.setTint?.(0xd7b9e8);}
}

function attach(scene){if(state.scene===scene)return;state.scene=scene;scene.events?.on?.('update',()=>tick(scene));}

const timer=setInterval(()=>{const scene=activeArena();if(scene){attach(scene);clearInterval(timer);}},250);

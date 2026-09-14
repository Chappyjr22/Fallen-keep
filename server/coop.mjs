import {COOP_PROTOCOL,compatibleParty} from '../public/coop-protocol.mjs';
import {lobbyStamp} from '../public/party-lobby.mjs';
import {CHARACTERS} from '../public/characters.mjs';
import {MAPS} from '../public/maps.mjs';
const json=(v,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
export function cleanConfig(c){if(!c||!Object.hasOwn(CHARACTERS,c.character))return null;const bonuses={};for(const k of ['health','speed','damage','pickup'])bonuses[k]=Math.max(0,Math.min(10,Number(c.bonuses?.[k])||0));return {unlockedCharacters:Array.isArray(c.unlockedCharacters)?c.unlockedCharacters.filter(id=>Object.hasOwn(CHARACTERS,id)):[],layoutVersion:Number.isSafeInteger(c.layoutVersion)&&c.layoutVersion>=0?c.layoutVersion:0,protocol:Number.isSafeInteger(c.protocol)?c.protocol:0,lobby:!!c.lobby,ready:false,lobbyRevision:0,mapsUnlocked:Array.isArray(c.mapsUnlocked)?c.mapsUnlocked.filter(id=>Object.hasOwn(MAPS,id)):['courtyard'],character:c.character,bonuses,keepKey:!!c.keepKey,crownUnlocked:!!c.crownUnlocked,bowUnlocked:!!c.bowUnlocked,chartedMaps:Array.isArray(c.chartedMaps)?c.chartedMaps.filter(id=>Object.hasOwn(MAPS,id)):[]};}
export async function handleCoop(request,env){
 const url=new URL(request.url);if(request.method!=='POST')return json({error:'Not found'},404);
 if(request.headers.get('sec-fetch-site')==='cross-site'||(request.headers.get('origin')&&request.headers.get('origin')!==url.origin))return json({error:'Open multiplayer from the game.'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Expected JSON'},415);
 if(Number(request.headers.get('content-length')||0)>196608)return json({error:'Room update too large'},413);
 const raw=await request.text();if(raw.length>196608)return json({error:'Room update too large'},413);
 let b;try{b=JSON.parse(raw);}catch{return json({error:'Invalid room request'},400);}if(!b||typeof b!=='object')return json({error:'Invalid room request'},400);
 const db=env.DB,now=Date.now(),path=url.pathname.split('/').pop();
 if(path==='create'){
  const config=cleanConfig(b.config);if(config?.lobby&&config.protocol!==COOP_PROTOCOL)return json({error:'A co-op update is available. Refresh the game before hosting.'},409);if(!config||!Object.hasOwn(MAPS,b.mapId))return json({error:'Choose a character and map.'},400);
  const code=Array.from(crypto.getRandomValues(new Uint8Array(10)),n=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[n%32]).join(''),token=crypto.randomUUID();
  await db.prepare('DELETE FROM coop_rooms WHERE expires_at<?').bind(now).run();
  await db.prepare('INSERT INTO coop_rooms(code,host_token,map_id,host_config,host_seen,expires_at) VALUES(?,?,?,?,?,?)').bind(code,token,b.mapId,JSON.stringify(config),now,now+7200000).run();return json({code,token,role:'host',mapId:b.mapId});
 }
 if(typeof b.code!=='string'||!/^[A-Z2-9]{10}$/.test(b.code))return json({error:'Enter the 10-character room code.'},400);
 let room=await db.prepare('SELECT * FROM coop_rooms WHERE code=? AND expires_at>? AND closed=0').bind(b.code,now).first();if(!room)return json({error:'Room expired or closed. Ask your friend for a new code.'},404);
 if(path==='join'){
  const config=cleanConfig(b.config);if(!config)return json({error:'Choose a character.'},400);if((config.lobby||JSON.parse(room.host_config).lobby)&&!compatibleParty(JSON.parse(room.host_config),config))return json({error:'Both players must refresh the game, then create a new party. This room uses a different co-op version.'},409);if(now-room.host_seen>60000)return json({error:'The host is disconnected. Ask them to create a new room.'},409);
  if(!JSON.parse(room.host_config).lobby&&CHARACTERS[config.character].weapon===CHARACTERS[JSON.parse(room.host_config).character].weapon)return json({error:'Your friend already has that starting weapon. Choose a different character on the main menu.'},409);const token=crypto.randomUUID();const joined=await db.prepare('UPDATE coop_rooms SET guest_token=?,guest_config=?,guest_seen=? WHERE code=? AND guest_token IS NULL AND closed=0 RETURNING code').bind(token,JSON.stringify(config),now,b.code).first();if(!joined)return json({error:'This room already has two players.'},409);return json({code:b.code,token,role:'guest',mapId:room.map_id,host:JSON.parse(room.host_config)});
 }
 const role=b.token===room.host_token?'host':b.token&&b.token===room.guest_token?'guest':null;if(!role)return json({error:'Room access expired.'},403);
 if(path==='leave'){await db.prepare('UPDATE coop_rooms SET closed=1 WHERE code=?').bind(b.code).run();return json({closed:true});}
 if(path==='lobby'){
  const host=JSON.parse(room.host_config),guest=room.guest_config?JSON.parse(room.guest_config):null;
  if(!host.lobby||room.state||host.launching)return json({error:'The run has already started.'},409);
  if(b.stamp!==lobbyStamp(host,guest,room.map_id))return json({error:'The party setup changed. Check the new choices and ready up again.'},409);
  let mapId=room.map_id;const own=role==='host'?host:guest;
  if(b.action==='select'){
   if(b.character!==undefined){if(!Object.hasOwn(CHARACTERS,b.character))return json({error:'Unknown character.'},400);own.character=b.character;}
   if(b.mapId!==undefined){if(role!=='host')return json({error:'Only the host can choose the area.'},403);if(!Object.hasOwn(MAPS,b.mapId)||!host.mapsUnlocked.includes(b.mapId)||(guest&&!guest.mapsUnlocked.includes(b.mapId)))return json({error:'Both players must unlock this area.'},409);mapId=b.mapId;}
   host.ready=false;if(guest)guest.ready=false;host.lobbyRevision=(host.lobbyRevision||0)+1;
  }else if(b.action==='ready'){
   if(!guest||CHARACTERS[host.character].weapon===CHARACTERS[guest.character].weapon)return json({error:'Choose different characters before readying up.'},409);
   if(!host.mapsUnlocked.includes(mapId)||!guest.mapsUnlocked.includes(mapId))return json({error:'Both players must unlock this area.'},409);
   own.ready=!!b.ready;
  }else if(b.action==='launch'){
   if(role!=='host'||!guest||!host.ready||!guest.ready||now-room.guest_seen>5000)return json({error:'Both players must be connected and ready.'},409);
   host.launching=true;
  }else return json({error:'Unknown lobby action.'},400);
  const updated=await db.prepare('UPDATE coop_rooms SET host_config=?,guest_config=?,map_id=? WHERE code=? AND host_config=? AND guest_config IS ? AND state IS NULL AND closed=0 RETURNING code').bind(JSON.stringify(host),guest?JSON.stringify(guest):null,mapId,b.code,room.host_config,room.guest_config).first();
  if(!updated)return json({error:'Your teammate updated the lobby. Please try again.'},409);
  return json({host,guest,mapId});
 }
 if(path!=='exchange')return json({error:'Not found'},404);
 const seq=Number.isSafeInteger(b.seq)&&b.seq>0?b.seq:0;
 if(b.signal!==undefined&&(typeof b.signal!=='string'||b.signal.length>32000))return json({error:'Invalid connection data'},400);
 if(role==='host'){
  if(b.state!==undefined&&(typeof b.state!=='object'||JSON.stringify(b.state).length>160000))return json({error:'Invalid world update'},400);
  await db.prepare('UPDATE coop_rooms SET host_seen=?,host_signal=COALESCE(?,host_signal),state=CASE WHEN ?>host_seq AND ? IS NOT NULL THEN ? ELSE state END,host_seq=MAX(host_seq,?) WHERE code=?').bind(now,b.signal??null,seq,b.state?1:null,b.state?JSON.stringify(b.state):null,seq,b.code).run();
 }else{
  if(b.input!==undefined&&(typeof b.input!=='object'||JSON.stringify(b.input).length>4096))return json({error:'Invalid controls'},400);
  await db.prepare('UPDATE coop_rooms SET guest_seen=?,guest_signal=COALESCE(?,guest_signal),input=CASE WHEN ?>guest_seq AND ? IS NOT NULL THEN ? ELSE input END,guest_seq=MAX(guest_seq,?) WHERE code=?').bind(now,b.signal??null,seq,b.input?1:null,b.input?JSON.stringify(b.input):null,seq,b.code).run();
 }
 room=await db.prepare('SELECT map_id,host_config,guest_config,host_seen,guest_seen,host_signal,guest_signal,state,input,host_seq,guest_seq,closed FROM coop_rooms WHERE code=?').bind(b.code).first();
 return json({mapId:room.map_id,host:JSON.parse(room.host_config),guest:room.guest_config?JSON.parse(room.guest_config):null,peerSeen:role==='host'?room.guest_seen:room.host_seen,signal:role==='host'?room.guest_signal:room.host_signal,closed:!!room.closed,...(role==='host'?{input:room.input?JSON.parse(room.input):null,seq:room.guest_seq}:{state:room.state?JSON.parse(room.state):null,seq:room.host_seq})});
}

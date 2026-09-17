import {validMilestones} from '../public/starter-milestones.mjs';
import {validSeals,sealCount} from '../public/seals.mjs';
import {mapUnlocked,mapUnlockMessage} from '../public/maps.mjs';
import {mapEvent} from '../public/map-events.mjs';
import {achievementState,characterUnlocked} from '../public/achievements.mjs';
import {resolveIdentity} from './identity.mjs';
import {database} from './db.mjs';
import {UPGRADES,upgradePrice,profileBonuses} from '../public/progression-rules.mjs';
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
const validId=x=>typeof x==='string'&&/^[a-f0-9-]{36}$/.test(x);
const integer=(x,max)=>Number.isInteger(x)&&x>=0&&x<=max;
export async function profile(db,user){await db.prepare('INSERT INTO profiles (user_id,created_at) VALUES (?,?) ON CONFLICT(user_id) DO NOTHING').bind(user,Date.now()).run();await db.prepare("UPDATE profiles SET coins=coins+500,keep_key=1 WHERE user_id=? AND keep_key=0 AND EXISTS (SELECT 1 FROM runs WHERE user_id=? AND map_id='courtyard' AND elapsed>=1800 AND closed=1)").bind(user,user).run();const sealRow=await db.prepare('SELECT COALESCE(MAX(seals & 1),0) | COALESCE(MAX(seals & 2),0) | COALESCE(MAX(seals & 4),0) AS sealMask FROM runs WHERE user_id=? AND map_id=\'basement\'').bind(user).first();const sealMask=sealRow.sealMask;if(sealMask===7)await db.prepare('UPDATE profiles SET coins=coins+750,first_floor=1 WHERE user_id=? AND first_floor=0').bind(user).run();await db.prepare("UPDATE profiles SET coins=coins+1000,throne_room=1 WHERE user_id=? AND throne_room=0 AND EXISTS (SELECT 1 FROM runs WHERE user_id=? AND map_id='firstfloor' AND claims=1)").bind(user,user).run();const p=await db.prepare('SELECT throne_room AS throneRoom,coins,speed,health,damage,pickup,keep_key AS keepKey,first_floor AS firstFloor FROM profiles WHERE user_id=?').bind(user).first();const metrics=await db.prepare('SELECT COALESCE(MAX(CASE WHEN closed=1 AND (mastery & 1)!=0 AND elapsed>=720 THEN 1 ELSE 0 END),0) AS sentinelUnlocked,COALESCE(MAX(CASE WHEN closed=1 AND (mastery & 2)!=0 AND kills>=750 THEN 1 ELSE 0 END),0) AS arcanistUnlocked,COALESCE(MAX(CASE WHEN closed=1 AND (transforms & 1)!=0 THEN 1 ELSE 0 END),0) AS alchemistUnlocked,COALESCE(MAX(CASE WHEN closed=1 AND (mastery & 4)!=0 AND elapsed>=900 THEN 1 ELSE 0 END),0) AS chaplainUnlocked,COALESCE(SUM(king_defeated),0) AS kingDefeats,COALESCE(SUM(kills),0) AS totalKills,COALESCE(MAX(kills),0) AS bestKills,COALESCE(MAX(elapsed),0) AS bestTime,COALESCE(MAX(CASE WHEN map_id=\'courtyard\' AND closed=1 THEN elapsed ELSE 0 END),0) AS bestCourtyardTime,COALESCE(SUM(gold),0) AS earnedCoins FROM runs WHERE user_id=?').bind(user).first();const charts=await db.prepare("SELECT MAX(CASE WHEN map_id='courtyard' THEN charted ELSE 0 END) AS courtyard,MAX(CASE WHEN map_id='basement' THEN charted ELSE 0 END) AS basement,MAX(CASE WHEN map_id='firstfloor' THEN charted ELSE 0 END) AS firstfloor,MAX(CASE WHEN map_id='throne' THEN charted ELSE 0 END) AS throne FROM runs WHERE user_id=?").bind(user).first();const discoveriesResult=await db.prepare('SELECT event_id AS eventId FROM map_discoveries WHERE user_id=? ORDER BY discovered_at,event_id').bind(user).all();const discoveries=(discoveriesResult.results||[]).map(r=>r.eventId);return {...p,discoveries,sealMask,chartedMaps:Object.keys(charts).filter(k=>charts[k]===1),achievements:achievementState({...metrics,royalClaims:p.throneRoom,sealsBroken:sealCount(sealMask)})};}
export async function handleApi(request,env){const identity=await resolveIdentity(request.headers,env);if(!identity)return json({error:'Sign in to load your progress.'},401);const user=identity.key,withIdentity=p=>identity.label?{...p,identityEmail:identity.label}:p;const db=database(env),url=new URL(request.url);
 if(request.method==='GET'&&url.pathname==='/api/profile')return json(withIdentity(await profile(db,user)));
 if(request.method!=='POST')return json({error:'Not found'},404);
 if(request.headers.get('sec-fetch-site')==='cross-site')return json({error:'This request must come from the game.'},403);
 const origin=request.headers.get('origin');if(origin&&origin!=='https://fallen-keep.jacobchapman3.chatgpt.site'&&origin!==url.origin)return json({error:'Invalid origin'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Expected JSON'},415);
 if(Number(request.headers.get('content-length')||0)>4096)return json({error:'Request too large'},413);
 const raw=await request.text();if(raw.length>4096)return json({error:'Request too large'},413);let body;try{body=JSON.parse(raw);}catch{return json({error:'Invalid request'},400);}if(!body||typeof body!=='object'||Array.isArray(body))return json({error:'Invalid request'},400);
 if(url.pathname==='/api/purchase'){
  if(!Object.hasOwn(UPGRADES,body.upgrade)||!integer(body.rank,9))return json({error:'Invalid upgrade'},400);
  await profile(db,user);const key=body.upgrade,price=upgradePrice(body.rank);
  // The column comes exclusively from UPGRADES, never from unchecked input.
  const changed=await db.prepare(`UPDATE profiles SET coins=coins-?, ${key}=${key}+1 WHERE user_id=? AND ${key}=? AND ${key}<? AND coins>=? RETURNING coins,speed,health,damage,pickup`).bind(price,user,body.rank,UPGRADES[key].cap,price).first();
  if(!changed)return json({error:'Your balance or upgrade changed. Please try again.',profile:withIdentity(await profile(db,user))},409);
  return json({profile:withIdentity(await profile(db,user))});
 }
 if(url.pathname==='/api/run/start'){
  if(!validId(body.runId))return json({error:'Invalid run'},400);const p=await profile(db,user),now=Date.now(),mapId=body.mapId||'courtyard';if(!mapUnlocked(mapId,p))return json({error:mapUnlockMessage(mapId)},403);if(!characterUnlocked(body.character||'knight',p.achievements))return json({error:'Complete this character’s unlock objective in Achievements.'},403);
  await db.prepare('INSERT INTO runs (id,user_id,bonuses,started_at,updated_at,map_id) VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(body.runId,user,JSON.stringify(profileBonuses(p)),now,now,mapId).run();
  const run=await db.prepare('SELECT id,bonuses,closed,map_id AS mapId FROM runs WHERE id=? AND user_id=?').bind(body.runId,user).first();if(!run||run.closed||run.mapId!==mapId)return json({error:'Run unavailable'},409);
  return json({runId:run.id,mapId:run.mapId,bonuses:JSON.parse(run.bonuses),profile:withIdentity(p)});
 }
 if(url.pathname==='/api/discovery'){
  if(!validId(body.runId)||typeof body.eventId!=='string')return json({error:'Invalid discovery'},400);const event=mapEvent(body.eventId);if(!event)return json({error:'Unknown map discovery'},400);const run=await db.prepare('SELECT map_id AS mapId FROM runs WHERE id=? AND user_id=?').bind(body.runId,user).first();if(!run)return json({error:'Run not found'},404);if(run.mapId!==event.mapId)return json({error:'Map discovery belongs to another map'},400);await db.prepare('INSERT INTO map_discoveries (user_id,event_id,discovered_at) VALUES (?,?,?) ON CONFLICT(user_id,event_id) DO NOTHING').bind(user,event.id,Date.now()).run();return json({saved:true,eventId:event.id,profile:withIdentity(await profile(db,user))});
 }
 if(url.pathname==='/api/run/checkpoint'){
  if(!validId(body.runId)||!integer(body.gold,100000)||!integer(body.elapsed,7200)||!integer(body.kills,1000000)||typeof body.finished!=='boolean')return json({error:'Invalid run progress'},400);
  const run=await db.prepare('SELECT started_at,closed,map_id AS mapId FROM runs WHERE id=? AND user_id=?').bind(body.runId,user).first();if(!run)return json({error:'Run not found'},404);const mastery=body.mastery??0,transforms=body.transforms??0;if(!validMilestones(mastery,transforms))return json({error:'Invalid weapon milestone progress'},400);const charted=body.charted??false;if(typeof charted!=='boolean')return json({error:'Invalid map progress'},400);const seals=body.seals??0;if(!validSeals(seals)||(seals&&run.mapId!=='basement')||sealCount(seals)>body.kills)return json({error:'Invalid seal progress'},400);
  const kingDefeated=body.kingDefeated??false;if(typeof kingDefeated!=='boolean'||(kingDefeated&&(run.mapId!=='throne'||!body.finished||body.kills<1)))return json({error:'Invalid king defeat progress'},400);const claims=body.claims??false;if(typeof claims!=='boolean'||(claims&&(run.mapId!=='firstfloor'||body.kills<6||body.elapsed<60)))return json({error:'Invalid royal objective progress'},400);if(body.elapsed>Math.floor((Date.now()-run.started_at)/1000)+30||body.gold>200+body.elapsed*8)return json({error:'Run progress is inconsistent. Please retry.'},400);
  // D1 batch is atomic. Repeated or out-of-order cumulative totals cannot double-credit coins.
  await db.batch([
   db.prepare('UPDATE profiles SET coins=coins+COALESCE((SELECT MAX(0,?-gold) FROM runs WHERE id=? AND user_id=? AND closed=0),0) WHERE user_id=?').bind(body.gold,body.runId,user,user),
   db.prepare('UPDATE runs SET mastery=mastery | ?,transforms=transforms | ?,king_defeated=MAX(king_defeated,?),claims=MAX(claims,?),charted=MAX(charted,?),seals=seals | ?,gold=MAX(gold,?),elapsed=MAX(elapsed,?),kills=MAX(kills,?),closed=MAX(closed,?),victory=MAX(victory,?),updated_at=? WHERE id=? AND user_id=? AND closed=0').bind(mastery,transforms,kingDefeated?1:0,claims?1:0,charted?1:0,seals,body.gold,body.elapsed,body.kills,body.finished?1:0,body.elapsed>=1800?1:0,Date.now(),body.runId,user)
  ]);
  return json({profile:withIdentity(await profile(db,user)),saved:true});
 }
 return json({error:'Not found'},404);
}

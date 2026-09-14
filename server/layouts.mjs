import {database} from './db.mjs';
import {MAPS} from '../public/maps.mjs';
import {validateLayout} from '../public/layouts.mjs';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
// Sites dispatch strips caller-supplied identity headers and supplies this verified claim.
export const isLayoutOwner=request=>request.headers.get('oai-authenticated-user-email')?.trim().toLowerCase()==='jacobchapman3@gmail.com';
export async function handleLayouts(request,env){const url=new URL(request.url),owner=isLayoutOwner(request);
 if(url.pathname==='/api/layouts/access')return json({owner});
 if(url.pathname!=='/api/layouts'&&!owner){const signedIn=!!(request.headers.get('oai-authenticated-user-email')||request.headers.get('oai-authenticated-user-id'));return json({error:signedIn?'Sign in with the owner account to save this layout.':'Your sign-in session is unavailable. Keep this editor open, sign in again in another tab, then retry Save draft.'},signedIn?403:401);}
 const db=database(env);
 if(request.method==='GET'&&url.pathname==='/api/layouts'){const v=url.searchParams.get('version');if(v!==null&&!/^\d{1,12}$/.test(v))return json({error:'Invalid version'},400);if(v==='0')return json({version:0,bundle:{}});const row=v===null?await db.prepare('SELECT id,bundle FROM layout_versions ORDER BY id DESC LIMIT 1').first():await db.prepare('SELECT id,bundle FROM layout_versions WHERE id=?').bind(Number(v)).first();if(!row&&v!==null)return json({error:'Layout version unavailable'},404);return json({version:row?.id||0,bundle:JSON.parse(row?.bundle||'{}')});}
 if(!owner)return json({error:'Owner access required'},403);
 const mapId=url.searchParams.get('map');if(!Object.hasOwn(MAPS,mapId))return json({error:'Unknown map'},400);
 if(request.method==='GET'&&url.pathname==='/api/layouts/draft'){const row=await db.prepare('SELECT revision,patches FROM layout_drafts WHERE map_id=?').bind(mapId).first();return json({revision:row?.revision||0,patches:JSON.parse(row?.patches||'[]')});}
 if(request.method!=='POST')return json({error:'Not found'},404);
 if(request.headers.get('sec-fetch-site')==='cross-site'||request.headers.get('origin')&&request.headers.get('origin')!==url.origin)return json({error:'Invalid origin'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Expected JSON'},415);
 const raw=await request.text();if(raw.length>60000)return json({error:'Too many edits'},413);let body;try{body=JSON.parse(raw);}catch{return json({error:'Invalid JSON'},400);}if(!Number.isSafeInteger(body?.revision)||body.revision<0)return json({error:'Invalid revision'},400);
 if(url.pathname==='/api/layouts/draft'){let patches;try{patches=validateLayout(mapId,body.patches);}catch(e){return json({error:e.message},400);}await db.prepare('INSERT INTO layout_drafts (map_id,revision,patches,updated_at) VALUES (?,0,\'[]\',?) ON CONFLICT(map_id) DO NOTHING').bind(mapId,Date.now()).run();const row=await db.prepare('UPDATE layout_drafts SET patches=?,revision=revision+1,updated_at=? WHERE map_id=? AND revision=? RETURNING revision').bind(JSON.stringify(patches),Date.now(),mapId,body.revision).first();if(row)return json({...row,patches});const current=await db.prepare('SELECT revision,patches FROM layout_drafts WHERE map_id=?').bind(mapId).first();if(current?.patches===JSON.stringify(patches))return json({revision:current.revision,patches});return json({error:'The saved draft changed in another tab. Your local placements are preserved. Export a backup before reloading.'},409);}
 if(url.pathname==='/api/layouts/publish'){const row=await db.prepare("INSERT INTO layout_versions (bundle,created_at) SELECT json_set(COALESCE((SELECT bundle FROM layout_versions ORDER BY id DESC LIMIT 1),'{}'), ?, json(patches)), ? FROM layout_drafts WHERE map_id=? AND revision=? RETURNING id").bind('$.'+mapId,Date.now(),mapId,body.revision).first();return row?json({version:row.id}):json({error:'The saved draft changed. Reload it before publishing.'},409);}
 return json({error:'Not found'},404);
}

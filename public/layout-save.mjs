import {retainLayout,clearRecovery} from './layout-recovery.mjs';
// A response acknowledges only the submitted snapshot. It never replaces live edits.
export async function saveLayoutSnapshot(editor,request,publish=false){
 const map=editor.map.id,patches=structuredClone(editor.history.value),revision=editor.revision;
 const retained=retainLayout(map,revision,patches,editor.recoverySession);
 editor.busy=true;let succeeded=false;
 try{
  const d=await request('draft?map='+map,{revision,patches});
  editor.revision=d.revision;editor.saved=JSON.stringify(d.patches);
  clearRecovery(map,patches,editor.recoverySession);
  const newer=JSON.stringify(editor.history.value)!==JSON.stringify(patches);
  if(newer)retainLayout(map,d.revision,editor.history.value,editor.recoverySession);
  if(editor.closed)return;
  if(publish&&newer)throw new Error('Newer edits arrived while saving. They are preserved. Review them before publishing again.');
  if(publish){const r=await request('publish?map='+map,{revision:d.revision});editor.status('Published layout '+r.version+' · new games use this arrangement.');}
  else editor.status(newer?'Earlier edits saved. Saving your latest placements next…':'Draft saved · revision '+d.revision);
  succeeded=true;
 }catch(e){if(!editor.closed)editor.status(e.message+(retained?' A recovery copy is saved on this device.':' Keep this tab open; a device recovery copy could not be saved.'),true);}
 finally{editor.busy=false;if(succeeded&&!editor.closed&&editor.dirty())editor.scheduleSave();}
}

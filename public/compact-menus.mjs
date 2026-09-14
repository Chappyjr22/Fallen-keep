// Move existing nodes, never clone controls or recreate their event handlers.
export function frameMenu(panel){
 const doc=panel.ownerDocument;
 const header=panel.querySelector(':scope > .setup-header, :scope > .reference-header');
 const heading=panel.querySelector(':scope > h2, :scope > h1');
 const eyebrow=panel.querySelector(':scope > .eyebrow');
 const actions=[...panel.querySelectorAll(':scope > .actions')].at(-1);
 const footer=panel.querySelector('.setup-launch, .setup-next')||actions||panel.querySelector(':scope > #back, :scope > #map-close, :scope > #coop-close-map, :scope > #reveal-all, :scope > #chest-next, :scope > #map-found-close, :scope > #relic-continue, :scope > #coop-exit');
 const top=header?[header]:[eyebrow,heading].filter(Boolean);
 const body=doc.createElement('div'),head=doc.createElement('div'),foot=doc.createElement('div');
 body.className='compact-scroll';head.className='compact-header';foot.className='compact-footer';
 body.append(...panel.childNodes);
 const moved=[];
 for(const [nodes,target] of [[top,head],[[footer].filter(Boolean),foot]])for(const node of nodes){const marker=doc.createComment('menu position');node.before(marker);moved.push([node,marker]);target.append(node);}
 panel.classList.add('compact-frame');panel.append(head,body,foot);
 return ()=>{for(const [node,marker] of moved)marker.replaceWith(node);panel.replaceChildren(...body.childNodes);panel.classList.remove('compact-frame');};
}
export function installCompactMenus(root){
 const media=matchMedia('(pointer:coarse), (max-width:600px)'),frames=new Map();
 const sync=()=>{
  for(const [panel,restore] of frames)if(!root.contains(panel)){frames.delete(panel);}
  const wantsFrame=panel=>media.matches||!panel.matches('.title-screen');
  for(const [panel,restore] of frames)if(!wantsFrame(panel)){restore();frames.delete(panel);}
  for(const panel of root.querySelectorAll('.panel'))if(!frames.has(panel)){
   if(!panel.matches('.start-shell,.coop-lobby-shell')){
    panel.classList.add('game-dialog');
    if(panel.querySelector('[data-choice],[data-evolution]'))panel.classList.add('power-dialog');
    if(panel.querySelector('.build-sections'))panel.classList.add('pause-dialog');
    if(panel.querySelector('.stats'))panel.classList.add('result-dialog');
    if(panel.querySelector('#chest-rewards'))panel.classList.add('treasure-dialog');
    if(panel.querySelector('.comic-art'))panel.classList.add('story-dialog');
    if(panel.querySelector('#full-map'))panel.classList.add('atlas-dialog');
    const own=panel.querySelector(':scope > .cards'),peer=panel.querySelector(':scope > .peer-offers');
    if(own&&peer){const grid=panel.ownerDocument.createElement('div');grid.className='party-choice-grid';own.before(grid);grid.append(own,peer);panel.classList.add('party-power-dialog');}
   }
   if(wantsFrame(panel))frames.set(panel,frameMenu(panel));
  }
 };
 const observer=new MutationObserver(sync);observer.observe(root,{childList:true,subtree:true});media.addEventListener('change',sync);sync();
 return ()=>{observer.disconnect();media.removeEventListener('change',sync);for(const restore of frames.values())restore();frames.clear();};
}

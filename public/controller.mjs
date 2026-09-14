// Standard browser gamepad mapping. No synthetic keyboard events or network actions.
export const controller={x:0,y:0};
export function axes(p){const b=i=>!!p.buttons?.[i]?.pressed;let x=(b(15)?1:0)-(b(14)?1:0),y=(b(13)?1:0)-(b(12)?1:0);if(!x&&!y){x=p.axes?.[0]||0;y=p.axes?.[1]||0;const n=Math.hypot(x,y);if(n<.22)return {x:0,y:0};const scale=Math.min(1,(n-.22)/.78)/n;x*=scale;y*=scale;}const n=Math.max(1,Math.hypot(x,y));return {x:x/n,y:y/n};}
export function installController({pause,map}){
 const style=document.createElement('style');style.textContent='body.pad-active .pad-focus{outline:3px solid #f5d887!important;outline-offset:3px;box-shadow:0 0 16px #e0ac5366!important}#pad-help{position:fixed;bottom:4px;left:50%;transform:translateX(-50%);z-index:100001;background:#111c19e8;color:#f2dfb0;padding:4px 10px;font:12px sans-serif;pointer-events:none;white-space:nowrap}';document.head.append(style);
 const hint=document.createElement('div');hint.id='pad-help';hint.hidden=true;document.body.append(hint);
 let previous=[],index=null,focus=null,signature='',direction='',repeat=0,using=false;
 const visible=e=>!!e&&e.getClientRects().length>0&&!e.closest('[hidden]')&&getComputedStyle(e).visibility!=='hidden';
 const choose=e=>{focus?.classList.remove('pad-focus');focus=e;if(e){e.classList.add('pad-focus');e.focus({preventScroll:true});e.scrollIntoView({block:'nearest',inline:'nearest'});}};
 const leave=()=>{using=false;document.body.classList.remove('pad-active');hint.hidden=true;};window.addEventListener('pointerdown',leave);window.addEventListener('keydown',leave);
 const zero=()=>{controller.x=controller.y=0;};window.addEventListener('blur',()=>{zero();pause();});
 function frame(now){requestAnimationFrame(frame);let pads=[];try{pads=Array.from(navigator.getGamepads?.()||[]);}catch{}const p=pads.find(p=>p?.connected&&p.mapping==='standard');if(!p||document.hidden||!document.hasFocus()){zero();if(index!==null){pause();hint.textContent='Controller disconnected or inactive · Keyboard and mouse available';hint.hidden=false;}index=null;previous=[];return;}
 const buttons=p.buttons.map(b=>b.pressed),a=axes(p);if(index!==p.index){index=p.index;previous=buttons;zero();return;}const pressed=i=>buttons[i]&&!previous[i];if(Math.hypot(a.x,a.y)>.1||buttons.some((b,i)=>b&&!previous[i])){using=true;document.body.classList.add('pad-active');hint.hidden=false;}
 const overlay=document.querySelector('#overlay'),menu=visible(overlay)&&overlay.children.length>0;
 Object.assign(controller,menu?{x:0,y:0}:a);
 if(using){hint.textContent=menu?'D-pad / stick: Navigate · A / ✕: Select · B / ○: Back':'Left stick / D-pad: Move · A / ✕: Interact · View: Map · Start: Pause';}
 const items=menu?Array.from(overlay.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled)')).filter(visible):[];
 const sig=items.map(e=>e.id+'|'+e.textContent).join('~');if(menu&&using&&(!items.includes(focus)||signature!==sig)){const oldId=focus?.id;choose(items.find(e=>oldId&&e.id===oldId)||items[0]);}signature=sig;
 const d=Math.abs(a.x)>Math.abs(a.y)?(a.x>.5?'right':a.x<-.5?'left':''):(a.y>.5?'down':a.y<-.5?'up':'');
 if(menu&&d&&(d!==direction||now>=repeat)){repeat=now+(d!==direction?350:150);const step=d==='left'||d==='up'?-1:1;if(focus?.tagName==='SELECT'){focus.selectedIndex=Math.max(0,Math.min(focus.options.length-1,focus.selectedIndex+step));focus.dispatchEvent(new Event('change',{bubbles:true}));}else if(focus?.type==='range'){focus.stepUp(step);focus.dispatchEvent(new Event('input',{bubbles:true}));focus.dispatchEvent(new Event('change',{bubbles:true}));}else if(items.length){const r=focus?.getBoundingClientRect();let best=null,score=Infinity;for(const e of items){if(e===focus||!r)continue;const q=e.getBoundingClientRect(),dx=q.x+q.width/2-r.x-r.width/2,dy=q.y+q.height/2-r.y-r.height/2,along=d==='left'?-dx:d==='right'?dx:d==='up'?-dy:dy,cross=d==='left'||d==='right'?Math.abs(dy):Math.abs(dx);if(along>4&&along+cross*3<score){score=along+cross*3;best=e;}}choose(best||items[(items.indexOf(focus)+step+items.length)%items.length]);}}
 direction=d;
 if(menu&&(pressed(4)||pressed(5))&&items.length)choose(items[(items.indexOf(focus)+(pressed(4)?-1:1)+items.length)%items.length]);
 if(pressed(0)){if(menu){if(focus?.tagName==='INPUT'&&!['checkbox','range','button'].includes(focus.type)){focus.focus();}else focus?.click();}else{const action=Array.from(document.querySelectorAll('button#dungeon-action,#dungeon-action button,#enter-keep')).find(e=>visible(e)&&!e.disabled);action?.click();}}
 if(pressed(1)&&menu){const back=items.find(e=>/^(back|cancel|return to battle|resume|stay here|not yet|keep it)/i.test(e.textContent.trim())||/(back|cancel|map-close)$/.test(e.id));back?.click();}
 if(pressed(9)){const resume=items.find(e=>['resume','coop-resume','map-close'].includes(e.id));if(resume)resume.click();else if(!menu)pause();}
 if(pressed(8)&&!menu)map();previous=buttons;
 }
 requestAnimationFrame(frame);
}

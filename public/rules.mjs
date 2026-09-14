import {ARSENAL_ITEMS,ARSENAL_RECIPES,ARSENAL_MASTERY} from './arsenal.mjs';
export const MAX_WEAPONS=6, MAX_PASSIVES=6, RUN_SECONDS=1800;
export const ITEMS={
 ...ARSENAL_ITEMS,
 bow:{name:'Thornwood Bow',kind:'weapon',max:8,rangerIcon:0,desc:'Fires swift arrows at nearby foes. Unlocked with The Ranger.',upgrade:'More arrows, greater damage and faster volleys.'},
 censer:{name:'Hallowed Censer',kind:'weapon',max:8,rewardIcon:0,desc:'Sacred incense pulses around you, damaging nearby enemies.',upgrade:'Wider incense aura and stronger damage pulses.'},
 echo:{name:'Echo Shard',kind:'passive',max:8,rewardIcon:1,desc:'Adds projectiles to all compatible weapons, including weapons acquired later.',upgrade:'Projectile milestones at levels 1, 3, 5, 7 and 8. Other ranks increase projectile speed.'},
 hourglass:{name:'Hourglass Charm',kind:'passive',max:8,rewardIcon:2,desc:'Reduces weapon cooldowns by 8% per level.',upgrade:'Faster automatic attacks. Evolves Hex Flask.'},
 sabbath:{name:'Witch’s Sabbath',kind:'weapon',max:1,rewardIcon:3,evolved:true,desc:'A ring of overlapping curses surrounds your position.'},
 lantern:{name:'Soul Lantern',kind:'weapon',max:8,witchIcon:2,desc:'Releases spirits that seek nearby enemies.',upgrade:'Stronger spirits, faster releases and more projectiles.'},
 hunt:{name:'The Wild Hunt',kind:'weapon',max:1,witchIcon:1,evolved:true,desc:'Ghostly riders charge through the horde, leaving slowing curses.'},
 sword:{name:'Longsword',kind:'weapon',max:8,icon:4,desc:'Sweeps toward a nearby foe.',upgrade:'More damage, wider reach, faster swings.'},
 shield:{name:'Spectral Shield',kind:'weapon',max:8,icon:6,desc:'Spectral shields orbit and strike enemies.',upgrade:'Stronger shields and a wider orbit.'},
 wand:{name:'Arcane Wand',kind:'weapon',max:8,glyph:'✦',desc:'Seeks nearby foes with arcane bolts.',upgrade:'More damage and additional bolts.'},
 flask:{name:'Hex Flask',kind:'weapon',max:8,rewardIcon:3,desc:'Curses the ground beneath a nearby enemy.',upgrade:'More flasks, larger pools and longer curses. Ring throws from level 6.'},
 frost:{name:'Frost Sigil',kind:'passive',max:8,icon:5,desc:'Slows enemies damaged by your attacks.',upgrade:'Stronger slowing effect. Evolves Longsword.'},
 might:{name:'Iron Oath',kind:'passive',max:8,glyph:'◆',desc:'+10% damage to all weapons per level.',upgrade:'+10% weapon damage.'},
 haste:{name:'Wayfarer Boots',kind:'passive',max:8,glyph:'»',desc:'+6% movement speed per level.',upgrade:'+6% movement speed.'},
 vitality:{name:'Crimson Heart',kind:'passive',max:8,glyph:'♥',desc:'+20 maximum health and restore 20 health.',upgrade:'+20 maximum health and restore 20 health.'},
 magnet:{name:'Seeker Stone',kind:'passive',max:8,glyph:'◇',desc:'+30% experience pickup radius per level.',upgrade:'+30% experience pickup radius.'},
 winter:{name:'Winter’s Judgment',kind:'weapon',max:1,icon:4,evolved:true,desc:'Freezing crescents pierce the horde; frozen foes shatter.'},
 legion:{name:'Oathbound Legion',kind:'weapon',max:1,icon:6,evolved:true,desc:'Spectral knights orbit you and charge through enemies.'}
};
export const RECIPES=[...ARSENAL_RECIPES,{id:'sabbath',requires:{flask:8,hourglass:1},consume:['flask'],label:'Hex Flask VIII + Hourglass Charm'},{id:'hunt',requires:{lantern:8,magnet:1},consume:['lantern'],label:'Soul Lantern VIII + Seeker Stone'},{id:'winter',requires:{sword:8,frost:1},consume:['sword'],label:'Longsword VIII + Frost Sigil'}, {id:'legion',requires:{sword:8,shield:8},consume:['sword','shield'],label:'Longsword VIII + Spectral Shield VIII'}];
export function eligibleRecipes(inv,banned=[]){return RECIPES.filter(r=>!banned.includes(r.id)&&!inv[r.id]&&Object.entries(r.requires).every(([k,n])=>(inv[k]||0)>=n));}
export function eligibleItems(inv,banned=[]){const counts={weapon:0,passive:0};for(const k of Object.keys(inv))if(ITEMS[k])counts[ITEMS[k].kind]++;return Object.keys(ITEMS).filter(k=>{const i=ITEMS[k];return !banned.includes(k)&&!i.evolved&&!RECIPES.some(r=>inv[r.id]&&r.consume.includes(k))&&(inv[k]||0)<i.max&&(inv[k]||counts[i.kind]<(i.kind==='weapon'?MAX_WEAPONS:MAX_PASSIVES));});}
export function choices(inv,rng=Math.random,banned=[],count=3,previous=[]){let pool=eligibleItems(inv,banned);const fresh=pool.filter(k=>!previous.includes(k));if(fresh.length>=Math.min(count,pool.length))pool=fresh;const out=[];while(out.length<count&&pool.length){const weights=pool.map(k=>inv[k]?1.65:1);let r=rng()*weights.reduce((a,b)=>a+b,0);let index=0;for(;index<pool.length-1;index++){r-=weights[index];if(r<0)break;}out.push(pool.splice(index,1)[0]);}return out;}
export function chestCount(r){return r<.4?1:r<.7?2:r<.88?3:r<.97?4:5;}
export function chestRewards(inv,rng=Math.random,banned=[],selectedRecipe=null){const next={...inv},out=[],n=chestCount(rng());const recipes=eligibleRecipes(next,banned);if(recipes.length){const rec=selectedRecipe?recipes.find(r=>r.id===selectedRecipe):recipes[Math.floor(rng()*recipes.length)];if(!rec)throw new Error('Transformation is not eligible');rec.consume.forEach(k=>delete next[k]);next[rec.id]=1;out.push({type:'evolution',id:rec.id});}
 while(out.length<n){const pool=eligibleItems(next,banned).filter(id=>(next[id]||0)>0);if(!pool.length||rng()<.3){out.push({type:'gold',amount:20+Math.floor(rng()*31)});}else{const id=pool[Math.floor(rng()*pool.length)];next[id]=(next[id]||0)+1;out.push({type:'item',id,level:next[id]});}}return {inventory:next,rewards:out};}
export function xpNeeded(level){return Math.round(8+level*4+Math.pow(level,1.38));}
export function speedFor(base,permanentPercent=0,runPercent=0){return base*(1+permanentPercent/100)*(1+runPercent/100);}
export function inArc(px,py,ex,ey,angle,range,halfAngle){const dx=ex-px,dy=ey-py;return dx*dx+dy*dy<=range*range&&Math.abs(Math.atan2(Math.sin(Math.atan2(dy,dx)-angle),Math.cos(Math.atan2(dy,dx)-angle)))<=halfAngle;}
export function recipeProgress(inv,candidate){return RECIPES.filter(r=>!inv[r.id]&&!r.consume.some(k=>RECIPES.some(other=>inv[other.id]&&other.consume.includes(k)))&&(!candidate||Object.hasOwn(r.requires,candidate))).map(r=>{const needs=Object.entries(r.requires).map(([id,target])=>({id,target,current:Math.min(inv[id]||0,target),next:Math.min((inv[id]||0)+(candidate===id?1:0),target)}));return {...r,needs,ready:needs.every(n=>n.current>=n.target),readyAfter:needs.every(n=>n.next>=n.target)};});}

export const FINAL_UPGRADES={...ARSENAL_MASTERY,bow:'Mastery: +25% arrow damage, one extra arrow and additional piercing.',censer:'Mastery: +50% pulse damage and 18 extra radius.',echo:'Mastery: six extra projectiles total, +40% projectile speed.',hourglass:'Mastery: total cooldown reduction reaches 80%.',lantern:'Mastery: +25% spirit damage and an extra spirit.',sword:'Mastery: +25% damage and 20 extra reach.',shield:'Mastery: +25% damage and an extra shield.',wand:'Mastery: +25% damage and an extra bolt.',flask:'Mastery: +25% damage and 25% wider pools.',frost:'Mastery: slowing reaches 75%.',might:'Mastery: total weapon damage bonus reaches +100%.',haste:'Mastery: total movement bonus reaches +60%.',vitality:'Mastery: total bonus health reaches +200; restore the 60 gained.',magnet:'Mastery: total pickup radius bonus reaches +300%.'};
export function canDiscard(inv,id){return !!inv[id]&&(ITEMS[id].kind!=='weapon'||Object.keys(inv).filter(k=>ITEMS[k].kind==='weapon').length>1);}
export function discardItem(inv,banned,id){if(!canDiscard(inv,id))return false;delete inv[id];if(!banned.includes(id))banned.push(id);return true;}

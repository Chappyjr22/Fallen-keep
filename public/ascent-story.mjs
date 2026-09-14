export const ASCENT_PAGES=[
 ['The last stair','The heavy door opens. Beyond the cellar lies cold marble, a crimson runner, and a hall that has forgotten the sun.'],
 ['The King’s welcome','“The Gaoler failed me. How disappointing.” His voice carries through the stone.'],
 ['The castle awakens','Candles kindle along the carpet. Empty helmets turn toward the doorway. “But do not mistake my cellar for my castle.”'],
 ['The challenge','Beyond the sealed royal stair, a familiar crown catches the light. “Come, then. Let my court receive you.”']
];
export function ascentSeen(){try{return localStorage.getItem('fallen-keep-ascent-seen')==='1';}catch{return false;}}
export function rememberAscent(){try{localStorage.setItem('fallen-keep-ascent-seen','1');}catch{}}

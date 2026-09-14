# Missing starter-weapon characters: approved implementation

Status: names, traits and unlocks approved on 2026-09-12. All four heroes are implemented in source, including solo/co-op traits, achievements and saved milestones. Artwork is integrated and approved for deployment.

## Locked foundation

The first eight weapons are immediately available: Longsword, Spectral Shield, Arcane Wand, Hex Flask, Soul Lantern, Thornwood Bow, Hallowed Censer and Royal Halberd. Knight and Witch remain the two starting characters. Ranger and Castellan retain their character achievements. Bellkeeper, Cinder Scholar and Crownless still unlock their expansion weapons. All future expansion weapons require an accompanying character and achievement.

These four new heroes attach to existing weapons. Unlocking them adds a starting loadout, stat profile and unique trait; it does not unlock or remove access to the starter weapon. No new weapon or transformation is necessary to fill the roster.

## Approved roster and initial balance

| Hero | Weapon | Role and silhouette | Starting stats | Trait | Achievement |
| --- | --- | --- | --- | --- | --- |
| The Sentinel | Spectral Shield | Defensive orbit fighter; silver plate, blue tabard, broad spectral shield | 145 HP, 130 speed, +3 armor, +10% area; charges 2 reroll / 7 banish / 2 skip | Repulse: every fourth orbiting shield hit emits a short knockback pulse, at most once per two seconds. Uses existing elite/boss resistance; persists with Oathbound Legion | Unbroken Watch: finish a run having reached Shield VIII and survived 12 minutes |
| The Arcanist | Arcane Wand | Ranged caster; violet robes, tall staff and floating runes, distinct from Witch/Scholar | 85 HP, 155 speed, +20% projectile speed; charges 5 / 3 / 3 | Arcane Echo: every fourth wand volley repeats after .3 seconds at 50% damage. Echo volleys cannot trigger another echo | A Lesson in Power: finish a run having reached Wand VIII and defeated 750 enemies |
| The Alchemist | Hex Flask | Area-control specialist; leather apron, green glass flasks and reagent satchel | 100 HP, 150 speed, +15% duration, +10 luck; charges 4 / 5 / 2 | Catalyst: every third flask volley leaves empowered pools with +25% radius. Applies to Witch’s Sabbath; no additional pool entities | Perfect Reaction: complete a run in which Hex Flask transformed into Witch’s Sabbath |
| The Chaplain | Hallowed Censer | Close-range support; ivory/crimson vestments, brass censer and hood | 115 HP, 140 speed, +1 armor, +10% area; charges 3 / 4 / 4 | Sanctuary: while at least one hostile enemy is in the aura, restore 1 HP/second to self and nearby living allies. Flat rate, no stacking per enemy, no reviving downed heroes | Light in the Dark: finish a run having reached Censer VIII and survived 15 minutes |

These are implemented initial balance values; device playtesting remains outstanding. None should match Crownless's 220 speed or endgame stat package. Trait effects stay personal unless explicitly stated: only Sanctuary is a party-support effect. Shared passive rules remain unchanged.

## Unlock evidence and persistence plan

Use run-local earned milestones, not only the ending inventory: fusion or discarding a mastered weapon must not erase earned evidence. Track a mastery bitmask and transformation bitmask using stable item IDs mapped to explicit bits. Combine these with existing elapsed/kills to evaluate the four proposed achievements on finalized runs. In co-op, mastery/transformation evidence belongs to the hero who earned it; shared kills/time follow the game's existing party totals.

Persist the new evidence with an appended migration, server checkpoint validation, monotonic OR updates, guest equivalents and retry tests. Old saves default to zero for unavailable weapon evidence; do not invent retroactive mastery. Existing achievements/characters remain unlocked. Document this limitation in the achievement descriptions if necessary.

## Implementation order

1. Review names, traits, unlock difficulty and silhouettes with the user. Do not begin unrelated features first.
2. Add shared milestone recording and save support, including co-op attribution and completed-run checks.
3. Build Sentinel and Arcanist first, then Alchemist and Chaplain. Reuse existing weapons; implement traits in both simulation paths through shared helpers where practical.
4. Create consistent pixel-art portraits and walk frames. Show character concepts before deployment for appearance review, following the user's earlier character-art preference.
5. Integrate character select, achievement cards, trait descriptions and Grimoire. Verify locked heroes cannot start, while all eight starter weapons remain available.
6. Test progression/retries, transformation and discard after mastery, both co-op inventory owners, trait timing at extreme cooldown, elite knockback resistance, pause/travel cleanup and healing without revival. Then playtest on two devices.

## Implementation handoff

Shared rules: `public/starter-traits.mjs` and `starter-milestones.mjs`. Adapters: `game.js` and `coop-model.mjs`. Protocol 8 adds owner-specific mastery/transformation evidence. Migration 0008 appends two integer columns with default zero. No existing save rows are removed.

Artwork: `public/assets/starter-heroes.png`, generated as four rows of four walk frames: Sentinel, Arcanist, Alchemist, Chaplain. `prepareRecruits` accepts explicit row boundaries and character IDs; it removes only exterior light neutral matte and registers normalized transparent frames once at scene load. Existing recruit boundaries remain unchanged. Visual appearance was approved by the user after the artwork preview.

Automated coverage: `starter-heroes.test.mjs` plus the account milestone regression in `progression.test.mjs`. Manual solo and two-device trait balance, walking animation quality, and interrupted account saves still need playtesting. Old runs cannot retroactively grant unrecorded mastery.

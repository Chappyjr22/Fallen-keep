# Characters, unlocks and permanent progression

Reviewed 2026-09-12. Sources: `public/characters.mjs`, `achievements.mjs`, `progression-rules.mjs`, `crownless.mjs`, plus `server/api.mjs` and `public/guest.mjs`.

## Current roster

| Character | Health / speed | Starting weapon | Unlock | Reroll / banish / skip |
| --- | --- | --- | --- | --- |
| Knight | 120 / 140 | Longsword | Available initially | 3 / 6 / 2 |
| Witch | 90 / 155 | Soul Lantern | Available initially | 5 / 3 / 3 |
| Ranger | 100 / 170 | Thornwood Bow | 1,000 kills in one run | 4 / 4 / 2 |
| Castellan | 155 / 125 | Royal Halberd | Survive 600 seconds | 2 / 8 / 2 |
| Bellkeeper | 85 / 150 | Storm Bell | Earn 500 run coins cumulatively | 6 / 3 / 3 |
| Cinder Scholar | 80 / 145 | Cinder Tome | All three historical dungeon seal bits | 5 / 5 / 1 |
| Crownless | 150 / 220 | Crownshards | Defeat the King | 6 / 6 / 3 |
| Sentinel | 145 / 130 | Spectral Shield | Finish a run with Shield VIII and 12 minutes survived | 2 / 7 / 2 |
| Arcanist | 85 / 155 | Arcane Wand | Finish a run with Wand VIII and 750 kills | 5 / 3 / 3 |
| Alchemist | 100 / 150 | Hex Flask | Finish a run after transforming Flask into Sabbath | 4 / 5 / 2 |
| Chaplain | 115 / 140 | Hallowed Censer | Finish a run with Censer VIII and 15 minutes survived | 3 / 4 / 4 |

Knight blocks a hit every 12 seconds, with +2 armor and 10% damage. Witch has +20 luck, 10% area and 40% longer curse/effect duration. Ranger has +10 luck and 15% projectile speed; every fourth bow volley pierces. Castellan has +4 armor and 20% area. Bellkeeper has 15% shorter cooldowns, +1 amount and +15 luck. Scholar has 30% area, 10% damage and 30% duration. Crownless has 20% damage, 15% shorter cooldowns, +1 amount, +25 luck and +2 armor. His movement accumulates 600 units for a burst and .65 seconds of immunity, with a six-second minimum interval. See [approved Crownless notes](../crownless.md).

Character unlock checks use achievement metrics, not the list of completed achievement IDs. `weapon-unlocks.mjs` explicitly lists eight starter weapons: Longsword, Spectral Shield, Arcane Wand, Hex Flask, Soul Lantern, Thornwood Bow, Hallowed Censer and Royal Halberd. These are available independently of character achievements. Storm Bell, Cinder Tome and Crownshards enter future offer pools with Bellkeeper, Scholar and Crownless. Co-op sends a sanitized unlocked-character list and refreshes it when starting a new section. Knight and Witch are the only initial characters. Ranger and Castellan keep their existing character achievements even though their weapons are starter equipment. Shield, Wand, Flask and Censer now have achievement-gated characters; see the [approved traits and implementation](../missing-characters-plan.md). Beyond the initial eight, each new base weapon must ship with a character and a defined achievement unlock; transformations remain recipes, not separate character requirements.

## Progress contracts

Achievements derive total kills, best run kills/time, best courtyard time, lifetime earned run gold, historical seal union, royal claims and King defeats. Spending coins does not reduce lifetime earnings. The First Watch achievement at 100 total kills has no listed item reward.

Finalizing a courtyard run after at least 1,800 seconds unlocks the Keep Key, Last Bell and 500 coins once. Periodic checkpoints do not award them. Historical completion of all three dungeon seals unlocks the first floor, Scholar and 750 coins once. Completing royal claims in one first-floor run unlocks the throne and 1,000 coins once. These profile awards are guarded against repeated credits. Historical dungeon unlocks do not pre-break seals in a new run.

Oathforge upgrades are speed, health, damage and pickup, ten ranks each. Each adds one percentage point of permanent bonus. Price for the next rank is `30 * (currentRank + 1)`. Purchases compare the submitted rank and balance atomically. Run start captures permanent bonuses; a later purchase does not rewrite an already-started run.

Saved runs store cumulative results and unlock evidence, not a resumable character/build snapshot. Guest results remain in that browser and do not automatically merge into account progress. See [saves and sessions](saves-and-sessions.md).

## Review and verification

Preserve monotonic achievement evidence, one-time rewards, server unlock enforcement and separate run versus lifetime state. New characters require definitions, art/animation registration, UI portraits, unlock metrics, offer gating where intended and solo/co-op trait support.

Tests: `achievements`, `recruits`, `crownless`, `progression`, `guest`, `rules`. Manual checks: earn then spend coins, unlock on both storage modes, select the newly available hero and verify its trait in both modes. Balance quality and visual identity require playtesting; source tables alone do not establish either.

## Starter hero milestone contract

Milestones are per-run and per-owner, captured before fusion consumes weapons and retained after discard. Stable mastery bits: shield=1, wand=2, censer=4, flask=8. Transformation bit: sabbath=1; it requires flask mastery evidence. The four new unlock metrics derive only from closed runs. Time and kills in co-op remain party totals, but another player’s mastery or transformation does not count. Initial characters remain Knight and Witch; all eight starter weapons remain available before character unlocks. See `starter-traits.mjs` for nonrecursive echoes, cooldown-limited Repulse, every-third Catalyst and non-reviving Sanctuary.

## Finale update, 2026-09-13

`unlock-notices.mjs` records newly completed achievements from successful checkpoint responses. Recaps show the queued unlock cards; returning to the title shows an acknowledgement popup before the menu. The queue survives section transitions within the current page session and deduplicates achievement IDs. It does not survive a full page reload. Reward grants remain server-controlled.

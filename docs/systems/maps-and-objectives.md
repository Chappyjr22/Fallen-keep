# Maps, objectives and section travel

Reviewed 2026-09-12. Sources under `public/`: `maps.mjs`, `dungeon.mjs`, `seals.mjs`, `royal-objectives.mjs`, `royal-interior.mjs`, `ascent-story.mjs`, `minimap.mjs`, `game.js` and `coop-model.mjs`.

## World structure

| Section ID | World dimensions | Entry and purpose |
| --- | --- | --- |
| courtyard | 12400 × 9600 | Open grounds; southern spawn, castle to the north |
| basement | 13440 × 10560 | Connected dungeon rooms; three seal guardians |
| firstfloor | 13440 × 10560 | Royal halls; three claims unlock the King's stair |
| throne | 4800 × 5760 | King arena; accessible directly after permanent unlock |

Use the evaluated `MAPS` exports. Several authored coordinates are scaled during module initialization, and dungeon dimensions come from the tile grid. Copying the initial object literals gives incorrect coordinates. `dungeon.mjs` supplies walkability, wall sliding, line-of-sight and navigation helpers. Furniture placement resolves through the pinned published layout version, separate from static floor topology.

## Unlocks versus current-run objectives

The Keep Key is awarded only after a courtyard run with at least 1,800 seconds is finalized. Periodic checkpoints do not award the key, Last Bell achievement or its 500 coins. Both modes require a previously earned key to enter the castle; co-op requires both heroes to have it. Return on a later run. Existing keys remain valid.

Basement runs always begin with zero broken seals. The Gaoler, Bone Steward and Drowned Warden correspond to bits 1, 2 and 4; only run mask 7 opens the stair. Historical union of those bits across saved runs unlocks direct first-floor starts. One guardian challenge is active at a time. Their art and combat stats have dedicated paths rather than ordinary giant-skeleton presentation.

The first floor resets claims each run:

1. Defeat both west shield captain and east crossbow commander.
2. Spend 60 accumulated seconds alive near the activated forbidden tome. Leaving its radius pauses reading; reinforcement waves occur during reading.
3. Activate and destroy three royal banners, then defeat the King's First Blade.

All three claims are required for the King's stair. Approaching it before both captains are defeated triggers periodic reinforcements. The fountain restores each hero once per run. Claim state tracks captain phases, ritual time, banner bitmask, champion phase and healed player IDs. `claimsComplete` is the gate predicate; UI counts must derive from it and related helpers.

## Travel and cinematics

Courtyard → basement plays the King's greeting and trap sequence. Basement → first floor uses four ascent panels in `ascent-story.mjs`; the seen flag is a local replay preference. Keep the King's likeness aligned with [art direction](../corrupted-king-art-direction.md).

Earlier section transitions create a fresh level-one build and timer. First floor → throne carries inventory, stats, HP, level/XP, charges and bans, with attack cooldowns reset. Direct throne entry gives preparatory level offers and chests: solo advances to level 25, co-op to 49 to compensate for its alternate-level choice cadence. Neither should be described simply as an ordinary unprepared level-one boss start.

Co-op requires both living heroes near the exit, no pending choice/chest, confirmation from both, synchronized comic progression and successful preparation before replacing the world. Layout version remains pinned across travel. See [multiplayer](multiplayer.md).

## Thirty-minute endings and boss scheduling

Both modes offer courtyard victory or facing the Oathbreaker at 30 minutes. He has 10,000,000 HP, 1,000,000 damage, speed 480 and ignores slowing/knockback. In co-op either player can claim the party victory; both must consent to face him. The finale is a synchronized pause with sequenced actions and validated snapshot state. No weakness unlock is implemented. Both modes finish basement survival at 30 minutes; first floor and throne continue toward their objective encounters.

Shared `public/run-rules.mjs` schedules ordinary bosses at 10, 18 and 25 minutes in the courtyard only. Dungeon, first floor and throne have no ordinary timed bosses. Guardian, captain, champion and King triggers remain separate. Elites remain on their existing schedules. `tests/run-alignment.test.mjs` covers scheduling and finale behavior.

## Exploration and review

Minimap cells are 120 units; exploration reveals around a 300-unit radius. The visited cells reset per run. Finding a chart persists full reveal for its section through saved run evidence. Revealed maps show active loot and threats, not a promise of future spawns. The host's chart ownership enables both players' initial reveal.

Tests: `maps`, `minimap`, `dungeon-renderer`, `royal-objectives`, `coop`, `coop-functional`. Manual: all exit conditions, interrupted travel preparation, direct starts, every claim marker before/after activation and mobile navigation around furniture. Outstanding source differences and visual checks are tracked in [review status](../review-status.md).

## First-floor ward presentation

The first-floor mission is now presented as three protections on the King's Stair: Oath (both captains), Lore (60 accumulated seconds defending the activated tome), and Crown (three banners followed by the First Blade). `wardSteps`, `claimsText`, `wardBrief`, `stairHint`, and `wardMessage` in `royal-objectives.mjs` own shared solo/co-op descriptions and completion feedback. Save fields and completion predicates retain their existing names and rules.

Map objectives use numbered, colored ward markers with labels on the full map and completion checks. They follow existing chart/discovery visibility. The tome uses the existing Cinder Tome book artwork instead of parchment; its fixed layout prop is protected. Barracks encounter racks/banners, library stacks/firelight and council guards frame objectives outside activation areas and carpet paths. Three colored stair barriers disappear individually as wards break.

Verification: 20 focused objective, map, layout and UI tests; desktop browser checks of the library, numbered map/briefing and completed stair state using temporary local scenario controls. No full natural run, live two-client session or mobile polish pass. Preview used Canvas rendering, so desktop WebGL tint/lighting was not visually verified. No temporary controls are shipped.

### Boss return policy
`public/boss-return.mjs` is shared by solo and co-op. Mobile bosses unseen for 2.5 seconds seek a walkable screen-edge landing at least 300 world units from every living player, clear of furniture. Invalid landings retry after 0.5 seconds. Health and rewards are preserved; movement and attacks pause for one second after returning. Static royal banners never relocate. The shield captain has normal pursuit and contact damage but no burst dash; champion and king charge mechanics remain.

### Shared early spawn pacing
Solo and co-op use `eliteDue` in `coop-tuning.mjs`: first elite at 180 seconds, then 120 seconds after each successful spawn. One living elite maximum before 600 seconds, two thereafter. A blocked spawn waits without accumulating catch-up spawns. Elite health and all tier strength multipliers remain unchanged. Both modes use `witchAllowed`: no ambient witches before 240 seconds; 5% chance and cap two until 480; 10% and cap eight until 600; then 16% and cap sixteen. Counts include elite/veteran witches but exclude bosses and breakables. Scripted boss encounters are independent. Ordinary melee mix and total wave cadence retain their existing mode-specific tuning.

## Finale update, 2026-09-13

The final ascent plays the four-page `king-story.mjs` entrance before the throne encounter. Solo preserves the existing carry flow; co-op waits for both players to finish/skip before preparation. King health is 380,000 solo and 627,000 for two players. Shared `kingSummons` begins at 12 seconds, summons six guards every 18 seconds, then ten every 12 seconds below half health, capped at 20 living minions. Minions grant normal XP, never chests. Victory plays a two-page defeat scene before recap; saving begins immediately, independently of the cinematic. Other boss/elite health is unchanged.

# Game-native UI prototype

Preview route: `/ui-preview.html`. Standalone HTML/CSS/ES module, with no imports of game startup, API, layout editing or co-op connection clients. Shared content and pure progression rules supply reference values. The existing game entry and styles remain unchanged.

Scope: main menu, all 11 character previews with source CHARACTERS/ITEMS/calculateStats data, a staged Phaser HUD scene with pointer/keyboard movement, solo/co-op presentation switch, sample rewards, sample map and local menu sound toggle. No actual combat, matchmaking, earned progress, account requests or save writes. Numbers on HUD are illustrative. All heroes are inspectable without unlocking them. The /04 suite now provides the secondary destinations described below.

Assets: ui-castle-backdrop.png is generated original night castle environment art for the approved iron/crimson/gold direction. All hero sprites and item atlases are existing assets. Recruits reuse the actual prepareRecruits matte and frame setup. The primary title logo is now original illustrated artwork in assets/fallen-keep-logo.png: stacked aged-gold FALLEN KEEP, central sword and torn crimson banner with real alpha transparency. No new portrait paintings are implemented; closer roster framing uses existing sprite artwork.

Design ownership: ui-preview.css is isolated from style.css/mobile.css. No prototype code is loaded by the live game. Preview changes may be published at the separate route for user review; do not roll the styling into gameplay screens until approved.

Verification: module syntax, import/asset existence and production build. Desktop browser interaction review completed on 2026-09-12 at 1363 x 936; see ui-prototype-browser-review-2026-09-12.md. All hero paths, real-device mobile navigation, actual combat and real multiplayer remain unverified.

Local browser QA: `npm run dev` uses Vite with public/ as its root. The supervised Sites preview can serve this static prototype. This does not emulate Worker APIs or authenticated gameplay.

## Logo pass

The /02 preview replaces the typographic placeholder with the transparent illustrated logo. Desktop/short-height/portrait size rules keep navigation below or beside it. The normal game title and favicon remain unchanged pending redesign approval. This is the primary game wordmark; a simplified small-size emblem is still future work.

## Focused refinement /03

Character artwork now trims transparent frame margins once during setup, produces consistently framed roster views, and anchors the full sprite to the platform. Larger supporting type and a tighter showcase use the available space. This reuses existing character identities; it does not introduce painted bust portraits.

Preview-only ui-preview-refinements.css controls character, equipment and reward layout. HUD slots are 43px on desktop and 32px in compact layouts, with readable rank labels. ui-items.png replaces the wand and passive glyphs in this preview only. Production inventory artwork is unchanged.

Rewards offer three owned upgrades from a four-item sample pool. Selection is explicit, supports arrow keys, and requires Claim. Claim updates only the sample HUD inventory; reroll and skip consume local sample charges. Entering the HUD anew resets the demonstration. Stat comparisons use calculateStats for passives and the existing sword scaling formula for base weapon values. No API, progression writes, live attacks or real co-op were added.

Focused verification: desktop 1363 x 936, short landscape 900 x 430 and portrait 390 x 780 (the latter two via a temporary same-origin iframe harness, removed before build). Checked Knight/Crownless framing and long details, solo and co-op HUD density, reward selection/claim/HUD update, reroll exhaustion, keyboard selection, and compact scrolling/action visibility. Corrected ambiguous crimson hover, hidden compact claim controls, and percentage precision during this loop. No full-game regression suite or actual multiplayer session was run because production gameplay was untouched.

Asset provenance: ui-items.png is a single built-in imagegen atlas, 1536 x 1024 RGBA, 3 columns x 2 rows. Top row: Iron Oath gauntlet, Wayfarer Boots, Crimson Heart. Bottom row: Seeker Stone, Arcane Wand, gold coin (unused). Prompt: transparent equally spaced medieval pixel-art item atlas with six named centered objects, strong silhouettes at 36px, aged metal/leather, muted warm gold and colored accents, no text, borders, scenery or crossing effects. Original alpha is preserved.

## Complete suite /04

`ui-preview-screens.mjs` owns isolated screen state and navigation; `ui-preview-screens.css` owns its styles. `ui-preview.mjs` supplies the existing hero/art/HUD bridge. The All screens gallery exposes 15 review destinations without requiring a full walkthrough.

Coverage: host invitation/waiting, code join/invalid code, connected host and guest lobbies, character/readiness/map selection, all four starting areas, Oathforge, searchable equipment/transformation Grimoire, achievement filters, audio/display/control preferences, party pause/loadouts, both players’ level-up offers, progressive chest reveal, party travel/cinematic, interrupted/disconnected/restored connection, results and retry.

Co-op is simulated: KEEP27 opens a sample room; ally controls simulate joining, character selection, readiness and rewards. Both players must be ready; duplicate starting weapons are excluded. Four weapons/four passive capacity is shown, with seven existing passive types divided across the sample party. Own choices support claim/reroll/banish/skip/pass, and pass requires an extra ally choice before resuming. Purchases, unlock previews and reward changes are memory-only. Chest rewards and run statistics are illustrative. No real matchmaking, save, reward or reconnect operations occur.

The HUD retains a staged courtyard scene even when another area is selected, explicitly marked STAGED HUD PREVIEW. Travel demonstrates confirmation and existing comic artwork; it is not actual scene loading or combat. Throne travel retains the sample build. Other fresh demonstrations seed representative equipment for UI inspection rather than simulate level-one combat.

`ui-sections.png`: original generated three-column location atlas, 2172 x 724, cells dungeon / first floor / empty throne chamber. Dark medieval environment illustrations with no characters or labels. Used only in map-select banners, with actual shared map topology available through View layout. Existing king artwork remains unchanged.

Verification and remaining integration scope: see `ui-suite-review.md`. Before live integration, bind these presentations to production lobby/progression/event state and test real two-client synchronization. Do not replace production UI solely because the preview has been published.

## Live integration status, 2026-09-12

User approved the complete preview. Title, solo setup and co-op setup/lobby are now integrated into the actual game. Remaining preview screens are not yet live. See [integration scope and checks](ui-live-integration.md).

The second integration batch applies the approved theme to the live HUD, rewards, party choices, pause, results, archives, forge, maps, travel and cinematics. The live Settings screen intentionally offers only implemented preferences; the prototype's display/audio sliders remain illustrative. See `ui-live-integration.md` for exact verification.

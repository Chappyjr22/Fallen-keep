# Multiplayer audit, September 11, 2026

Scope: compare the co-op model, renderer, lobby, progression, map travel, saving,
and transport with the existing solo implementation. Preserve co-op's four-slot
builds, shared passives/recipes, two-level choice cadence, and opening-wave tuning.

## Confirmed defects corrected

- Damage numbers were absent. Bounded, authoritative feedback now supplies damage,
  player injury, knight blocks, actual healing and greed-adjusted coin amounts to
  both renderers, including lethal hits after the enemy disappears.
- Enemy hit flashes and player injury flashes were missing. Damaged veterans now
  receive their purple health bars, alongside existing elite/boss bars.
- Wolf and witch sprites used skeleton foot origins. Origins now match solo;
  the three seal guardians retain their own atlas rows, names and larger size.
- Very short slashes/lightning could expire between relay updates. A bounded
  effect history and per-client ID tracking let guests play each observed effect
  once, without replaying duplicated packets. Attack and feedback caches reset
  between sections and expired display objects are destroyed.
- Chest directions were tiny world-space lines. The existing solo projection
  helper now supplies screen-edge arrows with separation for multiple chests.
  Beacons use the solo layered light, ground ring and rising spark treatment.
- Co-op chests immediately replaced their UI with a summary. Rewards now reveal
  sequentially with a reveal-all option; both players remain paused until the
  collector acknowledges. Rewards are applied once by the host.
- Loot dimensions/origins now match solo. XP no longer pollutes the mini-map with
  white markers; available gates and dungeon stairs are marked.
- Mobile joystick drawing now compensates for camera zoom. Enemy animations pause
  with the party. Extra boss passives wrap within the four-column inventory HUD.
- Frost slowed enemies forever; ice/hunt had no timed slowing application.
  Slows now expire, preserve longer curses, and respect enemy slow resistance.
- Expired or wall-blocked bolts could still damage something that frame.
  They now stop before collision damage. Homing excludes already-hit targets.
- Hex pools used to damage enemies before the flask arrived. Pool activation and
  rendering now wait for the throw to land.
- Seal guardians all used one fan pattern. Their three-, seven-, and ten-shot
  patterns (the last radial) now remain distinct in co-op.
- An ineligible player standing over a relic could prevent its eligible owner
  from collecting it. Selection now prefers an eligible nearby living player;
  unusable relics still convert to coins.
- Breakable respawns could exceed 360 entities, producing snapshots rejected by
  the guest. Respawns now enforce that same cap.

## Validation

119 automated tests pass, including 11 new audit regressions. Existing tests cover
room join/readiness, unique offers, shared upgrades and recipes, revives, saves,
section travel, progression persistence, XP caps, and a real pair of connection
clients against the HTTP relay handler backed by in-memory SQLite.

New renderer tests execute the actual CoopArena rendering methods for host and
JSON-round-tripped guest states with a recording display API. They check projectile
textures/frames/sizes, feedback text, enemy flash tint, and display-object cleanup.
These are render-call checks, not screenshots or GPU/browser validation.

A deterministic long-run simulation exercised each area with a different character
pair and advanced builds. Health was replenished to isolate simulation stability;
this is not a difficulty/balance assessment. Automated choices handled pauses.

| Area | Characters | Simulated seconds | Kills | Largest sampled snapshot |
| --- | --- | ---: | ---: | ---: |
| Courtyard | Knight, Witch | 1799.65 | 22026 | 111299 bytes |
| Basement | Ranger, Castellan | 1799.70 | 22034 | 108855 bytes |
| First floor | Bellkeeper, Scholar | 1799.80 | 22022 | 113721 bytes |

181 snapshots per area passed validation and stayed below the 160000-byte relay
limit. A separate maximum-entity test fills enemies, bolts, loot, feedback and
attack effects together. The production build passes. No schema or dependency
changes were required.

## Boundaries and remaining parity differences

The project's buildless Worker setup has no compatible managed browser preview.
No live two-browser gameplay, mobile screenshot or real-world WebRTC latency test
was performed. Network-loss rendering has deterministic coverage, but a friend's
actual connection and GPU still need a gameplay pass.

This is not a claim that every solo feature is identical in co-op. Solo's audio
cue controls and courtyard Oathbreaker finale are not implemented by the current
co-op flow. Co-op retains its existing 30-minute victory flag and continued travel
from courtyard/basement, with first-floor completion at 30 minutes. Those larger
feature differences were identified, not silently replaced during this repair.

# Two-player co-op

Reviewed 2026-09-12. Protocol version: `public/coop-protocol.mjs` (currently 9). Entry points: `coop-ui.mjs` for lifecycle, lobby and rendering; `coop-model.mjs` for simulation; `coop-network.mjs` for transport; `coop-party.mjs` for equipment rules; `server/coop.mjs` for room relay.

## Session and authority

Players host/join a room before choosing characters and starting section. The lobby exposes both selections. Different starting weapons are required, both players must have the selected area unlocked, and both must be ready. Host chooses the map. Selection changes invalidate readiness through a revision/stamp contract; stale lobby requests conflict instead of overwriting the other player.

The host simulates both heroes and world entities. Guest sends normalized movement and sequenced actions; it renders host snapshots. This is client-authoritative co-op, not server-authoritative combat. Room tokens authorize host/guest relay operations and remain separate from account-save identity. Client-supplied unlock/configuration metadata is sanitized but is not proof of earned progress. Do not advertise anti-cheat guarantees.

WebRTC uses an unordered data channel with zero retransmits and a STUN server. HTTP exchange provides fallback and signaling. Snapshots can be gzip-compressed where browser support exists. Action IDs, offer IDs, ticks and travel IDs reject stale/repeated operations. Snapshot validation and collection limits bound accepted data. Server relay limits state to 160,000 serialized characters, input to 4,096 and signals to 32,000; full requests have a 196,608 limit. Rooms expire after two hours. There is no implemented host migration or durable full-refresh rejoin contract.

## Party mechanics

Each hero owns up to four weapons and four passives; boss passive drops may overflow. Eight starter weapons are available before any character achievements, so a fresh Knight/Witch party can fill all eight combined weapon slots. Expansion weapons remain character-gated. Party ownership of equipment is unique. Other players' ownership and evolution ingredients affect eligibility. Passive effects merge across the party using maximum level per passive, not additive duplicate levels. Each character still contributes their own stats and permanent bonuses.

XP is awarded to both heroes, with their own growth multiplier. Item choices occur every two gained levels. The whole simulation pauses while a choice, chest presentation or explicit pause is pending. Teammate offers are visible. Pass queues a fresh choice for the living teammate; reroll, banish and skip use the acting character's charges.

Recipes may use a teammate's qualifying passive, which remains in its owner's inventory. Every required weapon must belong to the evolving hero at the required level. Two-weapon fusion consumes both weapons and creates one transformation, freeing a slot. Passives are never consumed in either mode. A chest upgrades the collector's owned inventory, with party-shared currency. Refreshing party stats after upgrades must retain a downed hero at zero HP rather than accidentally revive them.

A living ally within 95 units revives a downed hero after three uninterrupted seconds, restoring half health and three seconds of immunity. Section travel has a two-player handshake and preserves the pinned decor version. See [maps and objectives](maps-and-objectives.md).

## Presentation and load limits

`coop-presentation.mjs`, `combat-visuals.mjs`, `passive-icons.mjs`, `enemy-art.mjs` and `royal-visuals.mjs` carry art identity. Stable effect/feedback IDs allow short effects to survive sparse relay snapshots. Do not replace typed arrows, soul projectiles, XP gems or passive icons with generic fallback circles.

Simulation caps include 360 enemies, 240 bolts, 330 loot, 40 effects and 80 feedback records. At the loot cap, `loot-capacity.mjs` compacts matching kind/item pickups if no XP can be displaced. Chest/passive stacks retain individual rewards; other matching pickups retain summed value. Reward collection and stale chest acknowledgments are covered by `coop-safety.test.mjs`. Protocol 7 distinguishes these semantics from older hosts. Furniture obstacles already use foot-center coordinates, and collision no longer applies a second vertical offset. Co-op zoom is viewport-based, clamped .9–1.25; it is not a party-wide fit-to-both camera. Casters are suppressed for 90 seconds and gradually capped afterward; elites begin at 120 seconds. These are mode-specific tuning choices.

## Review and verification

Tests: `coop`, `coop-party`, `coop-functional`, `coop-audit`, `coop-tuning`, `layouts`. Test duplicate/stale actions, simultaneous offers, chest completion acknowledgments, shared passives, transitions and layout pinning. Real-device checks must exercise direct WebRTC and relay-only connections, delayed snapshots, disconnects, both orientations, projectile identity and overlapping chest/level events. Node tests do not certify network reliability or rendering on two phones.

## Starter roster update (2026-09-12)

Protocol 8: each player owns mastery/transforms milestone masks and fresh per-section starter trait state. Shared passives do not share traits or mastery. Sanctuary alone heals living nearby allies; echoes and Catalyst remain personal. Pending echo timers advance only with combat simulation; new sections clear queued echoes.

### Boss visibility input
Controls include optional world-space viewport width/height. `viewSize` sanitizes bounds; the host derives map-clamped views around living players. Boss return requires absence from every living player view and a safe landing away from all living players. The host owns relocation and its one-second grace period. No persistence schema change.

Verification: boss-return and royal-objective tests cover delay, safe landings, ally visibility, static banners, health preservation and removed shield dash. Co-op functional/safety/tuning/audit suites pass. A temporary local browser fixture confirmed blue orb rendering and boss re-entry; this was not a full natural run.

## Finale update, 2026-09-13

Protocol 9 adds the throne entrance comic phase to shared travel. Both players finish/skip before prepare. After King victory each client may advance/skip its own defeat comic; the encounter is already over and progress saves immediately. New evolutions use existing shared-passive requirements and same-owner weapon consumption.

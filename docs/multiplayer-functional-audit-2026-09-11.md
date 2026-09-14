# Co-op functional audit follow-up

The prior presentation pass did not exercise complete chest menu interactions.
This follow-up covers combined model, serialized guest state, menu handlers,
relay requests, and persistent progression. No live browser/GPU session was
available for this buildless Worker project; document adapters are not browser QA.

## Reproduced and repaired

1. Peer offer/inventory updates rebuilt an open chest menu and restarted its
   reveal. Chest presentation now has stable identity independent of peer choices.
2. Chest rewards occupied hidden rows before their reveal, leaking the count, and
   Continue could dismiss them before presentation completed. Rows are now added
   one at a time; Reveal all becomes Continue once contents are visible.
3. Chest completion had no result ID. Delayed acknowledgements could close a
   subsequent chest. Completion is now scoped to its unique result ID.
4. Collection lacked guards against duplicate/dead loot, downed collectors and
   existing choices. Repeated collection cannot overwrite an active choice or
   grant a second claim. Stacked chests remain queued in the world.
5. A party fusion blocked upgrades to an ingredient weapon still owned by the
   other hero. Existing owned ingredients remain upgradeable; reacquisition of
   consumed/unowned weapons stays blocked.
6. An open but silent direct connection suppressed relay state updates. Transport
   choice now checks incoming traffic freshness, falls back after 1.8 seconds,
   and continues direct probes so recovery remains possible.
7. Co-op versions were unchecked. Protocol 2 requires compatible clients before
   creating/joining a lobby, with refresh guidance. Script/style responses require
   cache revalidation. Existing live sessions are not forcibly migrated.
8. Older overlapping save calls could replace newer pending data. RunSave now
   preserves maximum coins/time/kills, merged seals, map reveal and finalization,
   and avoids writing pending records after a run has closed. Chest result receipt
   initiates checkpoints for both clients, in addition to periodic/final saves.
9. Hearts could be wasted by a closer full-health teammate. Injured living heroes
   are preferred; hearts remain when nobody needs healing.
10. One enemy projectile could damage both overlapping heroes despite single-hit
    behavior. It now stops at the first collision.
11. Delayed seal actions could summon while downed or during another choice.
    Summoning now requires a living player and unpaused party with no rewards.
12. Boss relic offset could place the pickup inside a dungeon wall. The drop now
    falls back to the boss's reachable position when the offset is blocked.

## Functional coverage

| Facet | Evidence |
| --- | --- |
| Lobby | Room ownership, capacity, readiness reset, character selection, shared area locks, incompatible version rejection |
| Chest pickup | Actual collision with XP and a chest in one tick; stacked chests; duplicate claims; delayed choice/completion packets |
| Rewards | All 1–5 counts; owned-only upgrades; mastery currency fallback; collector ownership; shared passives and coins |
| Chest UI | Actual host and guest menu methods, reveal-all/continue handlers, hidden reward count, stable DOM across peer actions |
| Level-ups | Two-level cadence, simultaneous choices, pass/reroll/banish/skip coverage, inventory exclusions and capacity |
| Transformations | Shared recipe ranks, borrowed weapon preservation/upgrades, competing recipes, stale ingredient invalidation |
| Combat | Existing presentation/weapon suite plus one-hit enemy bolts, healing ownership, downed summon guard |
| Revives and defeat | Existing downed/revive/both-dead regression coverage |
| Networking | Paired relay connection classes and real room API handler using SQLite; complete chest/peer-choice/ack/resume sequence; direct-channel freshness fallback |
| Map travel | Both-account API-backed courtyard → basement → first-floor progression, including save-before-travel and fresh builds |
| Persistence | Shared chest currency deposited to distinct accounts; repeated checkpoints do not duplicate gold or achievement rewards; keys/charts/seals persist |
| Save interruption | Failed/overlapping/older checkpoints preserve latest pending values and correctly finalize on retry |

The complete automated suite passes 134 tests. Existing broad simulation and
render-call tests remain in place. New tests focus on interactions and state
transitions rather than another isolated damage/rendering pass.

## Limits

The user's precise observed chest symptom was not accompanied by a recording in
this request. These are reproduced code-level failures, not a claim that a live
recording was reproduced. Real mobile layout, GPU behavior and NAT/WebRTC
conditions remain unverified here. Existing solo/co-op differences in audio cues
and the courtyard finale remain separate feature work, as recorded in the prior
audit. No new endgame rules were introduced during this repair.

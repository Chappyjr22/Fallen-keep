# Review status and remaining work

Source review: 2026-09-12. This is a documentation review of runtime baseline `d9b27b97eee6a7c9b539039c2d050deeb0008fbd`, not a new live-game audit certification. No gameplay fixes are included.

## Evidence levels

Source-confirmed means code paths were read. Automated means the named test actually ran with a recorded result. Manual verified means a browser/device scenario was exercised. A prior user report of success is useful context, not proof for unrelated paths or later builds.

## Open findings and decisions

| Priority | Finding | Evidence / next action |
| --- | --- | --- |
| High | Real phone and two-device regression coverage remains incomplete | Repeat editor save interruption/recovery, co-op relay fallback, travel and chest/level overlap on devices; record results |
| Ongoing | Late-run performance, balance and accessibility require measurement | Node/model assertions cannot establish frame rate, art quality, mobile memory or full accessible navigation |

## Previously addressed findings

The earlier mini-audit's save race, guest-mode recovery, local editor recovery overwrite and missing favicon were addressed in the runtime baseline. Their regression contracts are in [editor](systems/level-editor.md) and [saves](systems/saves-and-sessions.md). Keep manual session-loss verification outstanding until exercised on the target browser.

## Test routing

| Change area | Focused test files (tests/*.test.mjs) | Manual companion |
| --- | --- | --- |
| Combat/rewards | rules, arsenal, rewards, witch, build-control, enemy-tiers, xp-drops | Mastery, evolution branches, cap pressure |
| Progress/unlocks | progression, achievements, guest, recruits, crownless | Guest/account and newly unlocked selection |
| Saves/editor | audit-save-fixes, save-ordering, layout-recovery, layout-editor-startup, layouts | Slow save while editing, auth interruption, reload |
| Maps/visuals | maps, minimap, dungeon-renderer, chest-guides, royal-objectives | All routes/objective phases and visible art |
| Co-op | coop, coop-party, coop-functional, coop-audit, coop-tuning | Two devices, both transports, stale actions and travel |

The complete suite is the inventory under `tests/`. Tests using adapters or source assertions are not substitutes for executing the real browser flow. No new tests or runtime edits are part of this documentation pass.

## Execution evidence for this pass

`node --test tests/*.test.mjs` completed on 2026-09-12: 163 passed, zero failed/skipped. No production build, migration, deployment or device test was run for this documentation-only change.

## Rule alignment update, 2026-09-12

User decisions implemented: Keep Key/Last Bell after courtyard finalization; both modes require keys; shared courtyard bosses at 10/18/25 minutes only; aligned courtyard/dungeon endings; retained passives; same-owner weapon fusion; roster-derived signature-weapon unlocks. Protocol 6 adds the shared final-bell choice. See system pages and `tests/run-alignment.test.mjs`.

The collision-offset, loot-cap and generic locked-section message findings remain untouched while the user investigates them. Actual two-device finale UI remains a manual check. New base weapons require a character and achievement; four legacy unpaired weapons remain available pending later character design.

## Starter pool and co-op safety update, 2026-09-12

The collision discrepancy and full non-XP pool reward rejection were reproduced with focused tests before fixing them. Co-op now uses the same furniture foot center as solo. Saturated loot compacts matching pickups, retains chest/passive counts, and consumes one reward per collection. The new boss drop remains at its drop location. Already-mastered passive stacks convert all remaining rewards to currency. Account and guest locked-section messages now describe the correct objective.

Eight starter weapons are available independently of character unlocks, with two starting heroes. Expansion weapons remain character-gated. Same-owner co-op fusion remains intentional. Protocol 7 prevents mixing old host rules with the new semantics.

Verification: 176 Node tests passed, including actual solo/co-op collision comparisons, saturated chest/passive preservation, stack consumption/stale acknowledgments, fresh-party inventory capacity, expansion unlocks and section-specific errors. No real-device or browser verification was performed. See [missing character plan](missing-characters-plan.md) before any further character implementation.

## Finale update, 2026-09-13

Focused finale pass: 40 tests passed across king-finale, royal-objectives, arsenal, coop-audit, achievements and coop-safety. Local browser fixtures verified entrance art/dialogue, all three new effects together, diamond XP pickups, dark throne floor and menu unlock cards. Canvas ignored the initial tint approach; a bounded ground-only overlay corrected it. Fixtures were removed before build. This was not a natural full run or a two-device playthrough; King balance still needs player feedback.

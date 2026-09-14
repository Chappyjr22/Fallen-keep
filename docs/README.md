# Fallen Keep documentation

Start here, then read only the relevant system page and its source entry points. These pages describe reviewed code, not every earlier proposal. [Current state](current-state.md) records the runtime baseline and verification scope.

## System index

| Work area | Reference |
| --- | --- |
| Repository, API, database and release process | [Architecture and operations](systems/architecture-and-operations.md) |
| Attacks, stats, level choices, enemies and chests | [Combat and equipment](systems/combat-and-equipment.md) |
| Exact item descriptions and transformation requirements | [Equipment catalog](equipment-catalog.md) |
| Character stats, unlocks, achievements and upgrades | [Characters and progression](systems/characters-and-progression.md) |
| Dungeon seals, royal claims, maps and cinematics | [Maps and objectives](systems/maps-and-objectives.md) |
| Party rules, lobby, synchronization and transitions | [Multiplayer](systems/multiplayer.md) |
| Textures, effects, camera and performance | [Rendering and assets](systems/rendering-and-assets.md) |
| Menus, controls, dialogs and mobile layout | [UI and input](systems/ui-and-input.md) |
| Identity, run saves, retries and guest data | [Saves and sessions](systems/saves-and-sessions.md) |
| Decor editing, recovery and layout publication | [Level editor](systems/level-editor.md) |
| Findings, evidence and focused test routing | [Review status](review-status.md) |
| Efficient context loading and review handoffs | [Documentation workflow](review-workflow.md) |

## Next design work

The four [starter-weapon characters](missing-characters-plan.md) are implemented and published in v57. The [UI review](ui-review-2026-09-12.md) records confirmed presentation defects, layout risks and proposed improvement batches.

## Supporting references

[Owner workshop guide](layout-editor.md) explains authoring controls; the current editor system page supersedes its older persistence and test-count notes. [Royal claims](royal-claims.md), [Crownless](crownless.md) and [King art direction](corrupted-king-art-direction.md) retain detailed feature/art context. Check the system pages for current mechanics.

## Historical material

[Initial design baseline](design-baseline.md) contains superseded values and planned features. It is not the current specification. The [September 12 mini-audit](mini-audit-2026-09-12.md), [multiplayer audit](multiplayer-audit-2026-09-11.md) and [multiplayer functional audit](multiplayer-functional-audit-2026-09-11.md) are dated evidence, not blanket certification of later builds.

When changing behavior, update the owning system page with the patch. Keep exact numerical data in code and refresh snapshots when needed. Record unresolved questions in review status. Avoid loading the whole documentation set for a local change.

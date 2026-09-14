# Fallen Keep: current working context

Updated 2026-09-12: visual Grimoire and achievement improvements follow the v58 first UI pass. Check Sites for deployment status. This pass changes presentation and handlers only, with no schema, combat or protocol changes.

Phaser browser game with a custom Worker, D1 migrations and public Sites hosting. Project identity is in `.openai/hosting.json`. Preserve current account identity, saved progress, immutable layouts and audience. Source and documentation belong in the existing Git repository.

Implemented: eleven character definitions, eleven base weapons, eight transformations and seven passives; courtyard → basement → first floor → throne. Solo and two-player co-op protocol 8. Solo inventory 6+6; co-op 4+4 with choices every two gained levels. Boss passives can overflow. Party equipment ownership is unique, with shared passive effects and recipe requirements. Achievements, coins/upgrades, chart unlocks and King-unlocked Crownless persist.

Reviewed sections are indexed in [README](README.md): combat, progression, maps/objectives, multiplayer, rendering, UI/input, saves, editor and architecture/operations. [Equipment catalog](equipment-catalog.md) is generated from item/recipe exports. [Review status](review-status.md) separates source findings from unverified device behavior.

Rule-alignment verification: `node --test tests/*.test.mjs`, 193 passed, zero failures. Release build uses the existing Sites workflow. No browser, iPhone, two-device network, frame-time or memory test was performed. Earlier save fixes have automated coverage; actual interrupted-session recovery remains a manual check.

The collision offset, saturated loot loss and misleading section-unlock messages are fixed with regression coverage. Eight starter weapons are available immediately; expansion weapons unlock with characters. The [approved character plan](missing-characters-plan.md) is implemented, approved for publication; device playtesting remains outstanding. Do not treat historical design notes as implemented behavior. Read the relevant system page and current source, then run proportional tests. [Review workflow](review-workflow.md) defines the compact handoff and documentation update process.

The [UI review](ui-review-2026-09-12.md) now records the first implemented pass and remaining reference-screen/mobile verification work.

Visual equipment tabs/search, recipe cards and achievement filters/checklists are implemented for menus and solo/co-op pause. See reference-ui.mjs and the UI system page; no server/schema changes.

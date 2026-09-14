# Documentation and code-review workflow

## Start with the smallest useful context

Read [README](README.md) and [current state](current-state.md), then select only the relevant system page. Follow its source entry points and focused test list. Search symbols before reading code; use bounded excerpts for the compressed runtime modules. Do not load all historical audits or the conversation to answer a local implementation question.

For cross-system changes, explicitly name the boundaries: a new weapon commonly touches equipment, co-op presentation and unlocks; editor saving touches recovery, authorization and publication. Read those pages, not every subsystem. Expand the investigation only when evidence shows another dependency.

## New equipment contract

New base weapons must accompany a character with a defined achievement unlock. Update roster, offer gating, solo/co-op configuration, assets and tests together. Transformations follow recipes and do not require separate characters. The eight starter weapons in `STARTER_WEAPONS` are available independently of character unlocks. All eight now have heroes; the approved starter-roster plan documents the latest four. Additional weapons remain gated by their new character achievements.

## Before a patch

Record observed behavior, intended behavior, reproduction and evidence level. Distinguish confirmed bug, suspected bug, balance preference and undecided design. Check Git status and runtime baseline first. Preserve uncommitted user work. Consult [review status](review-status.md) for unresolved findings, but verify that an old item still exists before changing it.

## Update documentation with behavior changes

Each system page owns its contracts, invariants, source pointers, focused tests and manual checks. Update that page in the same commit as the behavior change. Update the index only when routing changes. Keep exact item definitions in exported source; refresh [equipment catalog](equipment-catalog.md) from the tables when items change. Roster tables are a reviewed snapshot and must be updated with `characters.mjs` changes.

Use dated audits for investigation evidence and outcomes, not a second evergreen specification. Mark superseded notes explicitly. Put undecided behavior in review status, not in an implemented-feature list. Keep release metadata in one current-state page and Git/Sites, not repeated across every system page.

## Review gates

1. Check the changed behavior and all affected modes. Shared helpers do not eliminate separate solo/co-op integration paths.
2. Run relevant tests once; expand only for an identified cross-system risk or release gate. Record command, result and scope.
3. Perform targeted browser/device checks where input, timing, rendering or network behavior matters. If unavailable, say unverified.
4. Check the diff for unrelated runtime/schema/asset changes and documentation drift. Deploy only when the task includes a release and its required checks are complete.

A useful review note contains: problem and reproduction, files changed, resulting behavior, tests actually run, manual coverage, remaining risks and source/deployment status. Do not claim deployed because a source commit succeeded.

## Token-efficient handoff

Keep the handoff short: current goal, baseline, modified files, test result, blockers and next source entry point. Link system pages instead of repeating their contents. Batch independent searches, limit noisy tool output and avoid repeated whole-file dumps. Reuse test evidence until a changed dependency invalidates it. Split oversized runtime functions when a relevant implementation task justifies it; documentation alone does not authorize a refactor.

Documentation is a navigation aid and reviewed contract, not a substitute for current source. This approach reduces repeated context loading while retaining enough detail to catch mode-specific regressions.

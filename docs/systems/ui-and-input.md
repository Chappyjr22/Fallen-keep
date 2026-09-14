# Menus, input and overlays

Reviewed 2026-09-12. Sources: `public/index.html`, `style.css`, `start-menu.mjs`, `game.js`, `coop-ui.mjs`, `layout-editor.mjs`.

## Current flows

Solo: title → mode → character → starting section → run. Co-op mode enters host/join setup before party character/map selection. Title links expose Oathforge, Grimoire and Achievements; Level Editor appears only after the owner-access endpoint confirms ownership. Character panels derive stats from current character definitions and permanent upgrades. Locked options show achievement requirements; loading/error states prevent an invalid start.

The footer identifies guest versus account progress and offers Refresh sign-in / progress. Errors must remain actionable without hiding the unsaved session. Account recovery and editor recovery are different stores and have separate rules; see [saves](saves-and-sessions.md) and [editor](level-editor.md).

## Input and pause boundaries

WASD/arrows move; touch drag uses a virtual movement direction. Attacks are automatic. Map and pause controls are available in the HUD, with M and Escape keyboard paths. Objective buttons act only near eligible challenges/gates. Input is released when overlays take control so a dismissed level-up or cinematic does not leave movement stuck.

Solo scene modes distinguish play, pause, level offers, chest reveal, evolution choice, map, travel/cinematic and run over. The update loop advances only in play mode. Co-op sends sequenced actions and pauses the authoritative world when either player's blocking interaction is open. A UI-only visual pause without stopping simulation would be a regression.

Level offers expose reroll, banish, skip and, in co-op, pass. Inventory discard is a separate pause interaction. Chests reveal rewards progressively instead of announcing the count immediately, then require completion before gameplay resumes. Multiple valid transformations have a choice step before rewards are resolved. Both players should see the other's offers during a party pause.

The enlarged minimap pauses play and has a return action. Comic panels support progression and skip, with two-player coordination in co-op. Run-end UI exposes save/retry state and must not imply that pending coins were already credited.

## Editor usability

The editor sidebar can hide/show, scroll and adapt to orientation. Map/room selection, drag, numeric position, rotation, duplication, deletion, undo/redo and walking preview are authoring controls. Error messages need to wrap and remain reachable above or within the sidebar. A placement warning is distinct from a server authorization or save failure. Successful draft acknowledgment must not reset newer live edits.

## Review and verification

Tests: `build-control`, `layout-editor-startup`, `layout-recovery`, `audit-save-fixes`, `coop-functional`. Much UI behavior is exercised through adapters or source assertions, not real DOM interaction. Manual matrix: keyboard-only setup; touch movement followed by every modal; portrait/landscape; long error messages; chest skip/reveal; disabled launch while loading; party waiting screen; exit after failed save.

Accessibility is only partially implemented: setup headings receive focus, selected choices have pressed state, navigation has labels and errors use status roles. Full focus trapping, screen-reader behavior, contrast and touch-target sizes have not been certified. Keep these as verification work rather than assuming existing attributes establish complete accessibility.

## Current review backlog

The [2026-09-12 UI review](../ui-review-2026-09-12.md) covers the v57 source and referenced artwork. It distinguishes confirmed content/event defects from unverified mobile layout risks. The approved first pass implements corrected section art/copy, working retry actions, independent connection/objective notices, co-op discard confirmation, shared build/stat/legend presentation, reward deltas and result parity. See the dated review for exact scope and remaining device verification.

Shared presentation helpers live in `public/ui-panels.mjs`. Ally-owned passives are informational and have no discard control. Discard confirmation queues an existing authoritative action; it never mutates co-op inventory locally. Modal Tab containment does not change pause/choice/travel state or make mandatory dialogs dismissible. Passive comparisons use calculateStats with the effective inventory; weapon cards retain source upgrade descriptions rather than guessed numerical deltas.

## Visual reference screens

`public/reference-ui.mjs` owns the Grimoire and Oath Records UI. Grimoire tabs show all base weapons, passives and transformations, with search across item and recipe ingredient names. Cards derive data from ITEMS, RECIPES, FINAL_UPGRADES and CHARACTERS. Active solo builds use eligibleRecipes; co-op uses partyRecipes so shared passives work without borrowing a fusion weapon. Menu browsing has no stale prior-run inventory.

Achievements filter by All / To earn / In progress / Completed and reward type. Four new hero challenges show explicit component checklists. Only current-run milestone evidence or a saved completed unlock checks those components; historical partial mastery is not inferred. Saved aggregate progress still drives other achievements. No new achievement rules, schema or server metrics are added.

Both screens can open from co-op pause. The party remains paused; Return/Escape returns to pause rather than resuming combat. Disconnection or a higher-priority reward/transition may replace the reference view, and late async account responses cannot overwrite the replacement. Solo reference views likewise remain paused and guard late loading responses.

Verification: tests/reference-ui.test.mjs covers complete catalog coverage/search, co-op recipe ownership, honest milestone checklists and stable search-input handling. Full suite: 193 passed. Build passed; actual browser/mobile visual verification remains outstanding.

## Mobile layout isolation

`public/mobile.css` loads after the desktop theme only for a coarse primary pointer or a viewport at most 600px wide. Landscape uses available height rather than assuming a wide phone is a desktop. The title uses two columns, panels scroll from the top, and fixed menu minimum heights are removed. Touch controls retain 44px targets. The HUD uses 22px equipment icons, omits empty slots, removes repeated instructions and secondary counters, and reduces the minimap to 80px. Full inventory remains in Pause. Solo/co-op objective and boss placement is handled separately for portrait and landscape. No camera zoom, combat, save or networking changes. Desktop fine-pointer layouts above 600px retain the original stylesheet.

Verification: production build and stylesheet/source checks. Physical iPhone navigation and touch gameplay still require user verification; the outer ChatGPT Share/Edit controls belong to the host app and are not changed by this stylesheet.

### Mobile menu frame follow-up

The first density pass still required scrolling past headings to reach primary actions. `compact-menus.mjs` now frames mobile overlays with a fixed header/action footer and a separately scrolling content area. It moves the existing controls, preserving event handlers, and stores comment positions to restore exact nesting when switching to the desktop media query. Setup continuation, map launch, solo/co-op pause and level-offer action rows use this shared mechanism. A MutationObserver handles newly rendered menus without changing game state. Search and live account updates continue targeting existing elements. Long card descriptions stay scrollable; pause cards omit repeated descriptions on mobile.

Tests cover action handler identity and original desktop order/nesting restoration. No actual iPhone/browser geometry verification is claimed. Desktop DOM is untouched while the mobile query does not match; resizing out restores its original structure.

## Approved live menu integration

The first live integration replaces title, solo setup and co-op setup/lobby presentation. See [scope and verification](../ui-live-integration.md). `game-menu.css` loads after mobile.css with scoped rules. The earlier statement that desktop DOM is untouched now excludes live setup panels: these also use the shared pinned menu frame on desktop. Other desktop dialogs retain their original structure. `menu-art.mjs` provides trimmed, cached portraits from actual loaded character sprites.

### Remaining live screen integration

`game-ui.css` now owns live HUD and non-setup dialogs. `compact-menus.mjs` frames all non-title overlays at desktop sizes, superseding earlier statements that other desktop dialogs remain unframed. Cards and peer cards are grouped without replacing their nodes; the last action row or known single Continue/Return button is pinned. `reference-ui.mjs` stores the selected catalog item and only redraws results when searching/selecting. Real equipment rules remain the source of descriptions and recipe readiness. See [second-batch evidence and limits](../ui-live-integration.md). No server or game-rule changes were required.

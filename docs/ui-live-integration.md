# Approved UI: live integration

## First batch, 2026-09-12

The approved preview is now the visual reference for the live title, solo setup, co-op host/join and connected lobby. Reuses the logo and castle backdrop. No new game rules or backend changes.

Ownership: `public/game-menu.css` is scoped to `.start-shell` and `.coop-lobby-shell`; `start-menu.mjs` retains live unlock and launch controls; `coop-ui.mjs` retains live room and readiness actions. `menu-art.mjs` extracts and caches trimmed portraits from loaded character sprites. `compact-menus.mjs` pins header/actions on these setup panels at desktop sizes as well as its existing mobile scope. Other desktop overlays retain their previous structure.

Settings exposes the existing saved sound toggle and actual control instructions. Escape and Return lead back to the title. No placeholder volume sliders. Failed co-op setup clears its busy state before re-rendering.

## Verification

- Actual local browser: title, mode, character details, locked character gating, locked area gating, courtyard launch and pause.
- Two browser clients using the real room handler with temporary in-memory storage: host, invitation code, join, synchronized character selections, duplicate-character readiness block, both ready, start and both courtyard HUDs. This verifies setup, not a full networked combat run or production authentication.
- Settings toggle remains changed after reopening; Return and Escape work.
- Visual review: desktop title/setup/lobby, compact 900x430 title/mode and 390x780 character selection in a local iframe. Physical iPhone testing remains outstanding.
- Existing targeted UI and co-op tests cover control identity, restoration and party safety.

The temporary API fixtures, HTTP-only UUID shim and iframe harness are removed before publication.

## Second batch, 2026-09-12

The approved treatment now extends to the solo/co-op HUD, level offers, ally offers and waiting state, chest reveal, transformations, relic/discovery messages, pause/build, results, full map, travel, cinematic frames, recovery/save dialogs, Oathforge and Oath Records. Grimoire now uses an item list plus a single detail pane while preserving search, tabs and current-run recipe ownership checks. Five formerly symbolic equipment icons use the approved `ui-items.png` artwork, including in the HUD and forge.

`public/game-ui.css` owns these live surfaces and loads after `game-menu.css`. `compact-menus.mjs` decorates non-setup panels and frames all non-title dialogs at desktop and compact sizes. It moves existing controls rather than cloning them; card and ally sections are grouped into `.party-choice-grid` before framing. Portrait stacks these sections; the actions remain pinned while either column can be reached by scrolling. It does not change offer generation, network state, saves or combat.

Settings still exposes only the real sound preference and control help implemented in batch one. Preview-only display/volume sliders are not production features. The owner furniture editor retains its separate working interface. `ui-preview.html` remains an isolated reference, not a live gameplay route.

### Targeted verification

| Surface | Evidence |
| --- | --- |
| Solo offers | Four populated cards, mastery/upgrade text, recipe hints, banish/cancel, reroll charge decrement and skip through actual handlers |
| Pause | Full six-weapon/six-passive inventory, fixed actions and attribute expansion control visually reviewed |
| Co-op offers | Real `CoopArena.renderModal` and `CoopWorld.applyAction` with local state: reroll changes charges; pass produces ally-waiting screen; ally cards are read-only |
| Co-op treasure | Five-item reveal, all item labels/icons and Continue visible; completion dispatches `chest_done` |
| Forge | Real local guest purchase: Fleet Foot rank 0 to 1, persisted on reopening |
| Grimoire | Item selection, search, recipe ingredient search and tabs; search input retains identity |
| Oath Records | Full checklist layout and In progress filter |
| Results | Actual solo finish saves guest coins and enables retry/menu actions; results screenshot reviewed |
| World UI | Solo HUD and actual co-op scene rendered; equipment, clock, health and minimap positions reviewed |
| Other dialogs | Full map/Return, cinematic/Next, co-op travel readiness with unchecked cinematic, interrupted-connection screen |
| Compact | 900x430 and 390x780 iframe views; solo/party offers and fixed footer; scrolling reaches ally cards; short HUD reviewed |

The 17 targeted reference, panel, compact-frame and reward tests pass. Existing game state and server code remain unchanged. Temporary scenario controls, fixture data, local guest API responses, HTTP UUID shim and iframe harness were removed before building.

Limits: no physical iPhone testing, production authentication test, or full two-client network/long-run soak in this batch. Co-op rendering/action checks used local model state; batch one separately verified actual two-client lobby entry. No guarantee of every device layout is implied.

### Efficient maintenance

Start with this file and `systems/ui-and-input.md`. Read only the affected renderer and its stylesheet section. Reach changed UI via temporary local fixtures using production renderers; remove them before publication. Test changed controls plus representative long-content and compact cases. Re-run party logic tests only when ownership, action dispatch or state rules change. Avoid repeating full survival runs for presentation-only work.

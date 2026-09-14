# Fallen Keep mini audit, September 12, 2026

Scope: source review, 159 existing Node tests, isolated reproductions, and the latest 120-minute production error-log sample. Reviewed commit 8af01c3897cbc6e377f0dd3b8be63d8e95f04f19, live version 53. No gameplay changes made. This is not an iPhone browser playtest, frame-rate benchmark or two-device network test.

## Verified inventory

- Seven playable character definitions: Knight, Witch, Ranger, Castellan, Bellkeeper, Cinder Scholar, Crownless. Some require achievements.
- Eleven base weapons, eight evolved weapons/recipes and seven passives, counted from the exported item and recipe tables.
- Four sections: courtyard 12400×9600, basement 13440×10560, first floor 13440×10560, throne room 4800×5760.
- Main menu, solo and two-player co-op, character/section selection, automatic combat, leveling, chests, transformations, map exploration, permanent upgrades and achievements are present.
- Progression includes Keep Key, basement seals, first-floor royal claims and King battle. The Crownless unlock is recorded from a saved King defeat.
- Co-op includes exclusive item ownership, shared passive effects, teammate evolution requirements, shared XP, revives and coordinated transitions. Party protocol 5 pins published decor versions.
- Owner decor editor includes moving/rotating/duplicating/deleting furniture, protected objects, undo/redo, draft publication, recent autosave/device-recovery support.

## Confirmed findings

### High: a save response can replace newer editor changes

Source: public/layout-editor.mjs, pointerup/end, edit(), action('save').

Reproduced by starting the real action('save') against a deferred fetch, changing history.value before resolving the fetch, then resolving with the submitted older patches. history.value became the old patches. The normal interaction path exists: autosave may start while a later drag is underway; pointerup calls edit() without checking busy. Successful saving unconditionally assigns history.value=d.patches. It also leaves already-rendered furniture potentially inconsistent with stored patches.

Fix next: immutable save snapshots and edit generations; acknowledge the saved snapshot without replacing newer edits; retain and reschedule newer work. Test dragging across an in-flight save and publishing while edits are pending.

### High: an interrupted sign-in leaves gameplay stuck in guest mode until reload

Source: public/progression.mjs, loadAccount() and api().

Reproduced an initial profile 401, then made the server return an authenticated profile and called loadAccount again. guestMode stayed true and only one server request occurred: subsequent calls went directly to guestRequest. Account progress may therefore appear missing and further play remains device-local even after sign-in is restored.

Fix next: explicit session refresh outside the guest shortcut, visibly identify account/guest state, and prevent silent mid-session switching. Do not automatically merge guest currency into an account.

### Medium: a pending recovery copy can be overwritten before restoration

Source: public/layout-editor.mjs loadDraft()/renderWorld(); public/layout-recovery.mjs retainLayout().

Source-confirmed: loading detects a recovery copy but does not restore it or isolate it. The next new edit writes the current draft to the same per-map localStorage key, replacing the previous recovery copy. Separate tabs also share this single key.

Fix next: preserve recovery candidates until explicitly restored/discarded, with tab/session identities or a small history. Explain conflicts before editing and offer backup import as well as export.

### Low: missing favicon endpoint

The returned recent error sample contains nine /favicon.ico 404s and no other returned errors. This is a bounded sample, not proof that browser errors or other server errors do not exist. Add an icon route or explicit supported favicon reference as routine polish.

## Test and review limitations

All 159 current tests pass despite the two reproduced state bugs. Existing editor startup coverage injects the Phaser loader and uses a DOM/display adapter; it does not exercise real browser event timing or real rendering. Need targeted interaction tests, iPhone portrait/landscape checks and two-device transition/disconnect checks before calling these flows reliable.

Royal charge warning circles are rendered separately in both solo and co-op. The empty combat ring callback alone is not evidence that warnings are missing; that suspected issue was ruled out in source review.

## Next work order

1. Repair editor save concurrency, recovery preservation and sign-in recovery.
2. Validate on-device edit → autosave → reload → publish, plus two-player chests, revive, section transitions and short disconnects.
3. Finish the current castle's balance and presentation using measured runs: guardian/King kill times, early witch pressure, chest progression and mobile frame time.
4. Expand to the next map and additional roster content once the above are stable. More content now would multiply the same save/rendering paths.

## Reduce token and iteration cost

- Start from docs/current-state.md, then inspect only the relevant modules. Treat old design-baseline.md as historical: it still says passive max 5 and random evolution choice, both superseded.
- Use targeted searches with bounded context. Four central files total approximately 171 KB but only 440 lines; whole-file or matching-line output is unusually expensive because methods are compressed onto giant lines.
- On relevant changes, format and extract one responsibility at a time (editor persistence, shared rewards/rendering, menu). Avoid a broad rewrite solely to save tokens.
- Keep inventory counts generated from item/character/map exports, rather than hand-copying lists across chat and docs.
- Reuse known project/version identifiers, read skills once per unchanged context, and show only needed tool fields. Never dump full tool registries, logs or credentials.
- Run focused tests for a narrow fix; run the full suite at an integrated release gate. Passing unit tests must not be described as browser testing.
- Group related changes into one verified release per task. Reuse unchanged build output and existing assets.
- Record exact failing scenarios and the test needed once, then refer to their IDs/locations. Short progress updates and final summaries reduce repeated conversation context.
- No percentage token saving claimed: usage measurements are not available here.

## Resolution follow-up

The subsequent fix addresses save acknowledgment concurrency, per-editor recovery copy preservation, explicit session refresh with per-run backend pinning, and the favicon route. Four additional regression tests bring the suite to 163 passing tests. See systems/level-editor.md and systems/saves-and-sessions.md. Browser/mobile verification remains outstanding. Findings above preserve the original audit evidence.

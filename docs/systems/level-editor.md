# Level editor and draft persistence

Reviewed 2026-09-12. User controls and map authoring details: ../layout-editor.md. Current save behavior below supersedes its original local-history description.

## Entry points

- layout-editor.mjs: scene, pointer interaction, autosave scheduling and controls.
- layout-save.mjs: immutable save snapshots and acknowledgment.
- layout-recovery.mjs: device recovery records and request error handling.
- layouts.mjs: templates, validation, layout version cache and collision bounds.
- server/layouts.mjs: owner-only drafts/publication, CAS revisions and public immutable bundles.

## Invariants

Saving acknowledges only the submitted snapshot. It must not replace live editor history. Newer edits keep their device backup, gain the returned base revision and schedule another save. Autosave waits while dragging, walking or busy. Publishing stops for review if newer edits arrived during saving, rather than publishing a stale arrangement.

Each editor instance uses its own recovery key per map. Old/other-tab and legacy copies are preserved until explicitly selected and discarded. Restoring a copy writes to the current editor's own key. Successful saving clears only a matching copy for that instance. Browser storage failure must be visible; the server remains the durable draft store.

Owner authorization is checked on every private API request. Missing identity returns 401 with sign-in recovery instructions. Different signed-in users remain denied. Published bundles are immutable; ongoing games and both co-op clients use pinned versions.

## Review evidence

Tests: audit-save-fixes.test.mjs covers save races, stale publish refusal and separate recovery copies; layouts.test.mjs covers authorization, validation, CAS and published-version pinning; layout-editor-startup.test.mjs covers Phaser loader injection; layout-recovery.test.mjs covers storage and malformed response errors.

Manual next: drag while a slow save completes; restore an old backup after new edits; portrait/landscape sidebar; edit → save → reload → publish; two clients load the same decor. Current checks use Node/adapters, not actual iPhone rendering.

## Authoring and cross-system boundaries

The [workshop guide](../layout-editor.md) covers 24-unit snapping, 90-degree rotation, 100-operation undo/redo, protected props and the 200-patch limit. Templates use stable IDs derived from original art/frame/coordinates; moving authored source positions may require a saved-patch migration. Patches change placement, not artwork, dimensions or collision radius. Placement warnings do not prove all routes are navigable.

[Architecture](architecture-and-operations.md) describes the draft/version tables and API. [Multiplayer](multiplayer.md) describes version pinning. The co-op collision offset discrepancy recorded in [review status](../review-status.md) is now fixed and tested against the actual solo movement method on all four sides of a furnishing. The 2026-09-12 documentation pass reran all 163 tests successfully; no new browser authoring test was performed.

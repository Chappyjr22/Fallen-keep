# Owner decor workshop

Main menu → Level Editor appears only after `/api/layouts/access` confirms the signed-in owner. Every draft and publication route independently checks the Sites-dispatch verified owner email. Public visitors can read only published bundles. The editor does not use guest progression or grant rewards.

Select a section, jump to a room, or choose an existing furnishing from the list. Drag an object, enter X/Y, rotate in 90-degree steps, duplicate, delete, or reset it. Grid snapping is 24 pixels. Empty-space dragging, Space-drag, WASD and zoom controls navigate the view. Walking preview starts from the camera center on clear floor and uses solo wall and prop collision, at 220 speed. Stop walking to edit. This is primarily a desktop authoring interface; pointer dragging also accepts touch.

Gold rectangles show artwork bounds; green circles show collision. Carpet, wall, furnishing and objective proximity warnings help keep paths clear. These are placement aids, not a guarantee that every narrow route remains accessible. Facade, boundary walls, stairs, fountain objective and quest tome are protected. Dynamic guardians, challenges and gates cannot be edited. Moved candle light follows its furnishing.

Save draft stores a per-section patch list in D1. Revisions use compare-and-swap; stale tabs receive a conflict instead of overwriting. Errors preserve current edits; Reload saved draft discards local changes only after confirmation. Undo and redo hold 100 local operations. Publishing first saves the draft, then appends an immutable bundle combining that section with the previously published sections. Reset an object or undo, then save/publish to revert its placement.

Solo loads the latest bundle at run start. Co-op pins the host's bundle when creating the party; both players load that exact bundle before readying, and the authoritative simulation and renderer use it. The version remains fixed through section travel, and snapshots carry only the small version number. Old bundles remain addressable. Refresh both clients and create a fresh party after this protocol update (5). Existing active games retain their loaded layout.

Template IDs derive from original atlas, frame and authored coordinates. Preserve these source identities during future authored-decor refactors or migrate saved patches. Patches cannot change artwork, dimensions or collision radius. Max 200 edits per section. The gameplay circle stays centered at x,y−8 when art rotates, matching solo and co-op. No per-frame furniture arrays or large new textures are transmitted/allocated.

Validation: 156 Node tests pass, including owner denial, CAS conflicts, immutable publications, section merge, geometry validation, undo/redo and co-op layout pinning across travel. Syntax and production build checked. Actual browser drag-and-drop and two-device playtesting were not performed in this environment.

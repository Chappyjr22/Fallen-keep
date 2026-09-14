# Rendering, assets and performance

Reviewed 2026-09-12. Entry points: `public/game.js` and `coop-ui.mjs`; shared helpers: `dungeon-renderer.mjs`, `royal-interior.mjs`, `royal-visuals.mjs`, `combat-visuals.mjs`, `coop-presentation.mjs`, `passive-icons.mjs`, `enemy-art.mjs`, `recruit-art.mjs`, `chest-guides.mjs`.

## Scene and artwork contracts

Phaser renders the arena; HTML/CSS overlays render menus, cards and dialogs. The game uses pixel-art sampling, rounded pixels and viewport resizing. Asset loading and atlas frame registration occur in the arena preload/create flow. Assets are under `public/assets/`; frame names such as `cell0` are runtime registrations, not independent files. Some atlases use irregular row bounds. Replacing an atlas requires verifying frame cropping, animation registration, display dimensions and origin for every consumer.

Props usually draw at an authored size, origin (.5, .8), with depth based on world Y. Collision uses a circle near the prop's feet, not its full painted rectangle. Rotating art does not imply rotating a rectangular physics body. Players, guardian sprites and royal enemies have their own origins. Idle objective visuals must exist before their hostile entities spawn; a challenge radius alone is not adequate artwork.

The terrain renderer uses an atlas and bounded viewport drawing for dungeon void and wall edges. Avoid allocating a large texture for the entire expanded map or a TileSprite for every wall. Royal floor/wall assets, furniture and localized candle lighting distinguish the first floor from the dungeon. Rugs use adjacency masks with trim only on exterior edges so turns and junctions remain continuous. Lighting follows resolved furniture positions.

## Combat and UI effects

Projectile kind selects arrow, Trueflight, soul, hunt or spectral-knight artwork. XP gems, coins, healing text, passive icons and chest beams have distinct representations. Passive ground loot must resolve its actual item ID through `passive-icons.mjs`. Chest guides convert world positions to viewport-edge arrows; multiple chests need independent identities and cleanup after collection.

Firebursts from Cinder Tome have 1.35-second stepped flames and deterministic embers. Ashen Covenant also leaves damaging fire pools. Visual lifetime and damage cadence are separate. Co-op's `EffectTimeline` retains newly received short effects long enough to be visible and deduplicates them by ID; pause freezes their local aging. Feedback records carry text, color and position so damage indicators are not reconstructed from guesses about HP changes.

## Performance boundaries

Solo caps and merges XP gems at 260; co-op has separate entity/effect caps documented in [multiplayer](multiplayer.md). Spatial hashes narrow nearby enemy checks, and dungeon navigation caches must be invalidated on a map rebuild. Cleanup must destroy sprites, timers, markers and per-run arrays when leaving/restarting a scene. A model cap alone does not prove that the corresponding display objects are recycled correctly.

Solo camera zoom currently clamps .65–1.25, co-op .9–1.25, based on viewport height. This difference matters on short landscape screens. Large world dimensions do not require equally large render textures. Preserve viewport-sized floor rendering and inspect texture count/memory when expanding art.

## Review and verification

Tests: `dungeon-renderer`, `chest-guides`, `coop-audit`, `coop-functional`, `xp-drops`, `crownless`. These verify calculations and adapter calls; they do not inspect actual GPU output. Manual checks: atlas crops, every projectile, idle/active objective art, rug corners, prop depth, damage numbers, chest arrows and cleanup across repeated transitions. Profile memory and frame time on a phone during a crowded late run before declaring performance solved.

Approved King appearance is recorded in [art direction](../corrupted-king-art-direction.md); reuse that identity in both cinematics and combat. New asset generation is a separate change, not part of this documentation review.

## Starter roster update (2026-09-12)

Starter hero sheet: assets/starter-heroes.png contains four uniform rows and four walk frames each. prepareRecruits now accepts source/IDs/row boundaries; original recruit decoding remains unchanged. New frames use 384-pixel cells, feet at y360 and 7 fps. Repulse uses the shared arsenal effect renderer in both modes. Artwork was approved by the user for deployment.

### XP gems
`public/xp-orb.mjs` creates one cached 32px faceted blue diamond texture, displayed at 22px in solo and co-op. Solo retains gem pooling and co-op retains visual pooling. XP values and collection behavior are unchanged. Large enemy position jumps snap on guests instead of interpolating across the arena.

### Controller input
`public/controller.mjs` polls standard-mapped browser gamepads, normalizes left stick/D-pad with a 0.22 deadzone, and supplies local movement to solo and co-op. DOM menu navigation handles enabled visible buttons, links, sliders and selects; A activates, B uses safe back/cancel/resume actions, Start pauses/resumes, View opens map, shoulders cycle controls. A activates nearby objective/gate prompts. Menus suppress movement; disconnect/background clears axes and requests pause. Keyboard/mouse remain usable. Room-code text input and external authentication still use device text input. Standard-mapped controllers only; physical hardware/browser compatibility and end-to-end controller-only UI need user validation. Tests cover axes, normalization, disconnect neutralization and existing co-op regressions; no physical controller was available.

### Throne atmosphere and finale art
A single dark teal rectangle at depth -78 darkens throne terrain below actors and loot in both Canvas and WebGL. Sparse bounded green motes retain readability. `king-finale-comic.png` is a four-panel 2×2 atlas, rendered by `king-story.mjs`. Consecrated pools and final evolutions share drawing helpers across solo/co-op. The historical xp-orb module/key remains for compatibility; its pixels are now gems.

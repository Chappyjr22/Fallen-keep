# Audio foundation status

Branch: `feature/audio-foundation`

Implemented in this branch:
- approved Fallen Keep audio direction
- dedicated WebAudio `AudioDirector`
- Master / Music / SFX / Ambience mixer state
- persistent volume and mute settings
- migration from the legacy `fallen-keep-sound` preference
- semantic audio event registry
- per-event cooldowns
- per-event voice/concurrency caps
- sample-variant selection
- subtle pitch-variation support
- async decode/cache/preload support
- temporary legacy oscillator bridge for current snapshot cues
- production sourcing/asset shot list
- automated tests for settings, bus gain, variation, cooldowns, concurrency and persistence

Local validation against the v7 snapshot:
- `node --check public/game.js`
- `node --test tests/*.test.mjs`
- 217 tests passed, 0 failed after the local runtime-integration patch was applied

The earlier foundation-only status below is superseded by the mini-run integration section.

Original next steps (historical):
1. wire `gameAudio` into `public/game.js`
2. expose Master / Music / SFX / Ambience controls in Settings
3. route the Knight vertical-slice events through semantic IDs
4. import professionally recorded source material
5. remove each temporary oscillator fallback as its production event is approved

## Approved mini-run integration

The user-supplied five Vorbis assets are installed under `public/assets/audio/mini-run`. The existing AudioDirector remains the sole audio system, preserving mixer APIs, settings, caching and voice limits. The package’s reduced replacement manager was not copied over the existing implementation.

Longsword plays its swing sample. Winter’s Judgment layers that same swing (gain .82) with the frost cast (gain .68). Solo level-up and actual player death use their samples; the post-run menu unlock popup plays the unlock sample. Co-op presentation observes new slash/frostslash effect IDs, level changes and living-to-downed transitions without changing simulation or network protocol. Repeated snapshots do not replay the same slash.

Pointer/keyboard interaction unlocks WebAudio and preloads the approved samples. Legacy oscillator cues remain for unapproved events. Approved events never substitute oscillators when muted, throttled or missing/undecodable. Playback rechecks limits after asynchronous context unlock.

Validation: full Node suite 219 passed, zero failures; `node --check public/game.js` passed. All five supplied Ogg files were inspected as 48 kHz Vorbis. No gameplay formulas, cooldowns, inventories, progression rules or database migrations changed. Real-device listening and browser autoplay behavior remain player-review items.

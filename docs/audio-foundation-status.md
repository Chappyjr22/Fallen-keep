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

The runtime integration patch is intentionally not marked complete until `public/game.js` is committed on this branch. Production audio assets are also not yet present.

Next implementation step:
1. wire `gameAudio` into `public/game.js`
2. expose Master / Music / SFX / Ambience controls in Settings
3. route the Knight vertical-slice events through semantic IDs
4. import professionally recorded source material
5. remove each temporary oscillator fallback as its production event is approved

# UI suite /04 review · 2026-09-12

Scope: isolated `/ui-preview.html`; production gameplay unchanged. Targeted UI checks only.

| Area | Observed checks |
| --- | --- |
| Entry / co-op | Mode, invite/waiting, clipboard-denied fallback, invalid/valid room code, guest host-only map status, connected roster, readiness disables Start, host area selection, staged party HUD |
| Level-up | Both players’ mixed offers, own claim waits for ally, reroll/banish controls, passed choice requires two ally choices, shared loadout display |
| Rewards / events | Five-step chest reveal with no initial count, owned upgrade labels, travel requires both ready, unchecked cinematic persists, ascent comic continues, reconnect/restored/disconnected recovery, results retry |
| Collections | Forge purchase changes sample coins 2670→2580 and rank 2→3, equipment search Hex Flask and passive filter, real recipes, achievement In progress filter |
| Settings | Display size 100→105%, reduced-motion toggle, controls list, defaults, pause→settings→back resumes HUD, audio slider 50→49% and Test sound action |
| Maps | Locked throne confirmation, all area selectors, generated interior banner, first-floor shared topology modal and return |
| Compact | 900×430 join and lobby, landscape party choices, 390×780 stacked party offers and scrolling to action/ally sections; pinned footer remains visible |

Desktop screenshots visually reviewed for mode, invite, connected lobby, maps, Oathforge, Grimoire, achievements, party choices, pause, chest, travel, reconnect and results. Compact checks used a temporary same-origin iframe harness, removed before build. Not real-device emulation.

Corrections made during review: mixed weapon/passive offers; banish exclusion; extra passed-choice readiness; clipboard fallback copies the requested value; cinematic checkbox persistence; preserve sample build for throne travel; settings return does not reseed HUD; short-landscape join form now shows code and Join together; clearer staged HUD label.

Limits: no actual two-client sessions, network recovery, combat, permanent progress or real-device mobile testing. Audio output was not aurally evaluated. Preview unlock/purchase/reward content is explicitly sample data. These results establish presentation and local interaction readiness, not production multiplayer correctness.

Efficient follow-up: review only the relevant suite function/style and shared rule source. Use All screens to reach a changed state, test its controls plus one representative compact layout; avoid replaying 30-minute runs for preview-only edits. Live integration requires separate targeted multiplayer and persistence checks.

# Desktop prototype review, 2026-09-12

Scope: interactive /ui-preview.html in a desktop browser, 1363 x 936. This is a staged UI prototype, not a live run. No production deployment or gameplay changes made for this review.

## Observed strengths

- Main menu: illustrated title, castle backdrop, crimson selection and restrained gold read as a coherent game identity.
- Character selection: roster and selected hero details are easy to distinguish. Knight and Crownless selection, Crownless unlock explanation and co-op presentation toggle responded.
- HUD: compact inventory, thin XP bar and corner map leave substantially more unobstructed arena space.
- Staged movement, pause/resume, map opening, reward opening, sample reroll, reward confirmation and returning to the scene worked in the exercised paths.

## Polish priorities

1. Character presentation: visible gap between hero feet and pedestal; inconsistent portrait crops from full-body sprites; excess empty space and small supporting labels. Ground heroes on their stands and standardize portrait framing.
2. HUD: tiny equipment level numbers and supporting labels; mixed artwork and placeholder glyphs for passives/currency. Improve recognition without returning to oversized panels.
3. Rewards: conventional rectangular cards and modal still feel less like a game than the title menu. Improve item-art prominence and selection feedback, and show the exact upgrade benefit rather than only generic mechanic descriptions.
4. Ambience: static backdrop and simple pedestal treatment fall short of the illustrated concept. Consider restrained light/fog motion after composition and readability are settled.

## Limits and intentional placeholders

- Reroll rotates sample cards without decrementing its sample count. Reward confirmation explicitly does not change inventory. These are prototype stubs, not evidence of live-game bugs.
- Co-op toggle does not create a session; P2 and HUD values are samples. Map is illustrative. No combat, saves, matchmaking, boss indicators, chest effects or multiplayer synchronization were tested here.
- Sample scene has repetitive floor tiling and stationary enemies. It cannot demonstrate readability during heavy combat.
- No blocking navigation failure was reproduced in the tested paths. The bounded console sample contained browser-extension metadata errors, which do not establish an application defect. This was not an exhaustive console or performance audit.
- Mobile, keyboard-only navigation, every character and secondary menu destinations require further review.

Recommendation: keep this visual direction; refine character presentation, HUD legibility and rewards before implementing a real playable slice. Then validate a busy solo run and a two-player run before rolling the redesign across every screen.

## Follow-up resolution /03

The original review above describes /02. Character foot alignment, portrait framing, small HUD ranks, placeholder item glyphs and reward presentation were addressed in /03. The follow-up used only the changed surfaces. Reward selection now also updates the staged HUD and decrements finite demonstration charges, superseding the earlier stub description. Short-layout action clipping and misleading hover styling were reproduced and fixed during the follow-up. Exact follow-up scope and viewport sizes are in ui-prototype.md. Real combat readability and production rollout remain future work.

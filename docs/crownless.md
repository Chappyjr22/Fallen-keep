# The Crownless

Approved character design: ivory hood and torn ivory/teal cloak, dark silver light armor, shadowed face with teal eyes, floating shattered gold crown. Four right-facing poses are normalized to a shared foot position in assets/crownless.png. Crownshards and Sovereign's Wake use assets/crown-items.png.

Unlock: save an actual Corrupted King defeat in the Throne Room. A Crown Unbound unlocks the character and Crownshards for future weapon rolls. Both co-op clients save the shared kingDefeated flag to their individual run records, including a downed teammate. Merely entering the chamber, completing the royal claims, surviving 30 minutes, or losing the run does not qualify. Earlier versions did not persist actual king defeats, so prior ambiguous throne runs are not retroactively treated as wins.

Attributes: 150 health, 220 base speed, 1.2 damage, .85 cooldown multiplier, +1 projectile, +25 luck and 2 armor. Charges: 6 rerolls, 6 banishes, 3 skips. Permanent movement bonuses apply on top of 220.

Unbound Step: 600 units of actual movement triggers a spectral burst (48 + twice the player level, scaled by damage) and .65 seconds of immunity. Six-second minimum interval. Wall pushing and stationary time do not charge it. It is personal to this character, unlike party-shared equipment passives. Uses bounded shared combat effects in solo and co-op.

Crownshards: automatic piercing fan of gold/emerald crown blades. Level VIII grants +40% damage and an extra blade. Echo increases blade count. Level VIII plus Wayfarer Boots I evolves through a chest into Sovereign's Wake: twelve base radial blades plus a close spectral burst. Party recipe rules allow an ally's boots and preserve exclusive weapon ownership.

Persistence: migration 0006 adds runs.king_defeated with default 0. Final checkpoints merge the flag monotonically; retries do not double count; closed records cannot gain later defeat credit. Solo sets the flag before saving its victory. Co-op finalization saves it for each participant. Protocol 4 requires fresh matching clients for new parties.

Validation: 151 automated checks pass, including king unlock/account isolation/guest storage, movement and wall collision, cooldown/immunity, weapon mastery, wall occlusion, party ingredient sharing, and rendering through the existing host/guest display-call adapter. Build and transparent asset checks completed. No actual GPU/browser or two-device playthrough was available; gameplay balance needs playtesting.

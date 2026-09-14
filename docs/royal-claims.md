# The King's Three Claims

First-floor objectives reset every run. Both captains must fall, the library requires 60 cumulative seconds with a living player inside its 260-unit reading circle, and three destroyed council banners summon the First Blade. Captains disable stair reinforcement waves. Objectives may be approached in any order. Every named encounter drops a chest and passive; the ritual drops a chest. Each hero may use the stair fountain once. First-floor play can continue past 30 minutes to finish the objectives.

Completion records one full-run claim, grants An Audience Earned, 1,000 coins once per account and unlocks Throne Room direct entry. It does not combine incomplete objectives across runs. Guest saves use the same rule. Migration 0005 adds runs.claims and profiles.throne_room.

Final ascent saves each player's section first, requires both players' confirmation in co-op, and preserves inventories, HP, XP, level, banishes and remaining charges. New section gold, time and kills reset. Earlier courtyard and dungeon travel still starts a fresh build.

Direct throne entry grants 24 level-up choices (24 solo levels or 48 co-op levels), then three preparation chests. Walk toward the king to initiate combat. Ordinary ascent grants no extra draft/chests. The king uses radial volleys and a telegraphed charge after half health; killing him ends the run in victory. Royal character artwork derives from the existing King reference. These are single-frame enemy sprites, not walk-cycle animation sheets.

Validation: objective lifecycle, retreat/downed ritual pause, authored positions against collisions, shared actions, hostile snapshot validation, full ascent preservation, telegraph timing, one-time server unlock/payment and host/guest rendering through the existing display-call adapter. Existing tests also cover prior progression, co-op rewards, combat and networking. Build output includes the new assets and generated D1 migration. No actual GPU/browser or two-device playthrough was available for this pass; difficulty tuning needs playtesting.

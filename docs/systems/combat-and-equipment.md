# Combat, equipment and rewards

Reviewed against source on 2026-09-12. Exact item names, levels, descriptions and recipes: [catalog](../equipment-catalog.md). Treat exported tables as authoritative when changing balance.

## Entry points and behavior

`public/game.js` owns solo attacks, hit detection, death and pickup processing. `public/coop-model.mjs` owns the co-op simulation. Shared definitions live in `rules.mjs`, `stats.mjs`, `rewards.mjs`, `arsenal.mjs`, `characters.mjs`, `crownless.mjs` and `enemy-tiers.mjs` under `public/`.

Players move while attacks fire automatically. Inventory is an item-ID to level object. Solo normally permits six weapons and six passives; co-op permits four each. Boss passive drops may exceed passive slot capacity. Base weapons and passives cap at level eight; evolved weapons have one level. The eight starter weapons are available immediately; expansion weapons are excluded until their hero unlocks. Passives remain equipped after transformation; two-weapon fusion consumes both owned weapons into one evolved weapon in either mode. Consumed ingredients are excluded from later offers while their evolution is owned. Not every base weapon currently has an evolution.

Solo level offers contain up to three distinct choices, weighted toward owned items (1.65 versus 1 for new items). Co-op uses its own unweighted offer pool and reserves new offers across players. Banish removes an offer from future rolls; inventory discard also removes ownership and spends a banish charge. The final owned weapon cannot be discarded. Reroll and skip spend character-specific charges. Co-op pass hands a reward opportunity to the ally, who receives a fresh offer; it does not transfer the exact displayed cards.

Chests roll one through five rewards with probabilities 40%, 30%, 18%, 9%, 3%. A valid transformation occupies one reward slot. Multiple eligible transformations prompt for a choice. Remaining slots upgrade eligible owned equipment or award currency; they never introduce a random new weapon/passive. When upgrades exist, the helper has a 30% gold branch; gold is 20–50 per slot. Boss ground passives are a separate reward path, falling back to 50 coins when no candidate exists. Breakables award healing, XP or coins.

## Stat composition

Base pickup radius is 100 world units. Most level-eight passives use effective power ten. Hourglass cooldown multiplier is `max(.2, characterCooldown * (1 - power * .08))`; cooldown cannot fall below this 20% multiplier. Echo adds `ceil(level/2)` projectiles at levels 1–7 and six at level eight, plus projectile speed. New weapons read current stats, so prior passive pickups apply automatically. Amount is interpreted by each weapon pattern, with explicit per-pattern caps, rather than blindly duplicating all attacks.

Permanent rank bonuses multiply character attributes. Haste multiplies speed, Might multiplies damage, Vitality adds health, Magnet multiplies pickup range and Frost applies slowing. `calculateStats` is the source for exact stacking. Weapon mastery adds weapon-specific boosts; recipes require the levels in the catalog, not automatically max-level passives.

## Enemies and performance

Veterans begin after three minutes and do not drop chests. Elites and bosses use separate health, damage, speed, slow-resistance and knockback scaling. Guardians and royal enemies override ordinary tier statistics. See `tierStats`, `guardianStats` and `royalStrength`; changing only ordinary boss HP does not rebalance every objective boss. Co-op elites begin at 120 seconds; caster probability and concurrent caps are in `coop-tuning.mjs`.

XP overflow must preserve XP value. Solo merges gems at its cap of 260. Co-op caps loot at 330, merging XP or granting displaced XP; when no XP can be displaced, matching pickups are compacted into a stack to make room. Chests and passives retain a reward count and collect one at a time. Mastered/unavailable passive stacks convert every remaining reward to 50 coins. This preserves the cap and the new drop location; at saturation, two older matching pickups can share one location.

## Review and verification

Preserve one death/reward per enemy, chest ownership rules, nonnegative cooldowns, wall line-of-sight and boss resistance. Test both runtimes when a shared helper is not the entire attack path.

Relevant tests: `rules`, `arsenal`, `rewards`, `witch`, `build-control`, `enemy-tiers`, `xp-drops`, `coop-party`, `coop-functional` under `tests/*.test.mjs`. Manual checks: max-level mastery, each evolution, competing recipes, passive pickup before a new weapon, boss passive overflow and XP at entity caps. Browser animation and late-run balance remain unverified by these Node checks.

## Starter roster update (2026-09-12)

Four starter hero traits are shared through starter-traits.mjs and adapted by both simulations: Sentinel fourth shield hit pulses with a two-second cap and enemy resistance; Arcanist fourth wand volley echoes after .3 seconds at half damage without recursion; Alchemist every third Flask/Sabbath volley expands pool radius 25%; Chaplain heals 1 HP/sec while a living hostile occupies the censer aura, including living co-op allies within aura and clear line of sight. No extra pool entities or passive sharing changes.

## Finale update, 2026-09-13

Final evolutions are implemented in `final-evolutions.mjs` through the shared arsenal casting/rendering path: wand8 + echo1 → Astral Dominion (multi-target arcane bursts); bow8 + haste1 → Briar Sovereign (rotating radial piercing arrows); censer8 + vitality1 → Saint’s Requiem (sacred pulse and lingering consecrated ground). Passives remain equipped. Every base weapon now participates in a transformation recipe.

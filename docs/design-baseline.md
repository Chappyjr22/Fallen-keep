# Agreed design baseline

> Historical initial design, not the current specification. Values and planned features may be superseded. Start with [current documentation](README.md).

## Identity and controls

Original medieval fantasy survivors game. Phaser; authentic pixel art, elevated top-down camera. Players only move; weapons attack automatically. Knight, mage, witch, ranger, paladin and necromancer are roster directions. Each character has its own starting weapon, stats and unique trait. Every future unlocked character also unlocks its signature weapon into the shared future-run pool. The approved Fallen Keep concept is the art target.

## Run and progression

Runs last 30 minutes. Begin with a decent number of weak enemies, continuously replenish and increase waves/density over time. Several elite variants per map and one to three bosses; later maps may add more. Reach 30 minutes to secure survival victory. Ordinary spawning then stops and an overwhelming final enemy arrives. Dying afterward does not negate victory. A later hidden mechanic can make that enemy beatable and unlock a special character and weapon. Exact health and damage are tuning parameters; initial Oathbreaker health 10,000,000 and damage 1,000,000.

Level-ups offer three random distinct new weapons, new passives or upgrades to owned equipment. Six weapon and six passive slots initially. Weapons max at 8, passives at 5. Max weapon plus its mapped passive can evolve; passive initially only needs level 1. Two mapped max weapons can fuse, replacing both with one weapon and freeing a slot. Passive remains after ordinary evolution. Elite chest triggers transformation; one ready evolution/fusion occupies one reward. Multiple ready recipes choose randomly. Recipes recorded in the eventual persistent grimoire.

## Chests

Every elite drops a chest. 1,2,3,4,5 rewards with respective fixed odds 40%,30%,18%,9%,3%. Chance determines count, not luck stats. Independently roll currency, weapons or passives, allowing all five to be one category. Existing equipment grants a level, maxed items leave pool, full inventory prevents new items. Apply rewards sequentially without exceeding caps.

## Permanent progress

Purchased or earned account-wide attribute upgrades are small percentage improvements layered onto a selected character's base stats. Three permanent +1% movement bonuses total +3%. Base 100 with +1% becomes 101; base 120 becomes 121.2 (an earlier conversational example rounded to 121). In-run equipment resets. Unlocked characters, signature weapons, maps, discovered recipes, earned currency and permanent attributes eventually persist. Implement durable persistence before enabling that progression. Keep caps modest; exact economy and caps remain undecided.

## Maps and initial scope

Fallen Keep: wide courtyard with sparse collision props and reusable tiles; extends past viewport. Briarwood: eventual repeating forest. King's Causeway: eventual horizontal corridor map. First playable includes Knight, one map and core loop with evolution/fusion. Additional roster, environments, full permanent progression and dedicated boss art are future slices, not claimed implemented.

## First-map pacing direction

0–5 min weak skeletons then hounds. 5–10 mixed/armored groups, boss minute 10. 10–20 spellcasters and frequent elites, boss minute 20. 20–30 dense combinations, boss minute 28. Minute 30 survival complete and Oathbreaker.

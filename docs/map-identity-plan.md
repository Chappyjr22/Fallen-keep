# Fallen Keep Map Identity Plan

## Core map rule

Every map must have a unique movement identity, environmental mechanic, encounter identity, objective layer, progression reason, and secret layer. If two maps could swap tilesets and still play the same, one of them is not finished.

The core loop remains survivor combat: move, kill, level, build, transform, survive. Map systems should create reasons to move and explore inside that loop rather than replacing it.

## Character dependency rule

Any new character design that depends on a map discovery must ship with the required map event in the same feature scope. A new character is not considered fully designed until all of these are defined:

- fantasy, stats, and trait
- Level 1 signature weapon behavior
- Level 2-8 weapon progression
- solo viability at Level 1 and through the first three minutes
- transformation recipe and transformed behavior
- unlock requirement
- any map/event dependency required by that unlock

Transformations must change behavior or complete the weapon fantasy, not merely add larger numbers.

## Shared map-event framework

Map-specific discoveries should use one reusable framework rather than bespoke one-off logic. An event definition should be able to describe:

- stable event id
- map id
- event kind: discovery, interaction, encounter, or conditional encounter
- location / placement key
- whether it is hidden from the minimap
- account-once vs repeatable behavior
- trigger conditions
- encounter id when combat is required
- permanent reward key
- discovery text

The first implementation should support account-persistent discoveries later without requiring the renderer or combat scene to know how persistence is stored.

## Royal Courtyard

### Identity
Open battlefield and discovery tutorial.

### Movement
Large readable spaces connected by recognizable landmarks. New players should have room to learn movement while gradually noticing that the world contains meaningful locations.

### Core event direction
Ruined bell towers can create optional timed events such as ambushes, elites, treasure caches, or future secret conditions.

### Secret anchor
**The Forgotten Grave**. A hidden discovery in the memorial/graveyard area. This is a future Gravebinder unlock hook once that character's complete weapon and transformation spec is approved.

### Enemy direction
Fallen guards, corrupted hounds, castle defenders, invaders, and ruined-garden creatures.

## Keep Dungeon

### Identity
Claustrophobic navigation, risk/reward side rooms, seals, and dangerous secrets.

### Movement
Corridors, cells, crossroads, dead ends, larger combat chambers, and optional shortcuts. Route decisions should matter more here than in the Courtyard.

### Core event direction
Locked cells and optional chambers. Future Dungeon Keys may open bonus cells but must never be required to complete the map.

### First vertical-slice secret
**The Hungry Chest**. A suspicious chest in a Dungeon side chamber. Approaching it begins a Mimic encounter. Defeating the encounter records the discovery and, once The Mimic is fully designed, unlocks that secret character.

### Enemy direction
Gaolers, chained prisoners, skeleton inmates, crawling horrors, tortured spirits, vermin, and seal guardians.

## Royal First Floor

### Identity
Authored castle exploration and objective-driven combat.

### Preserve
Royal Claims, named rooms, navigation, story purpose, and progression are already the strongest map identity in the game and should remain the foundation.

### Secret direction
**The Royal Coffer** in the Treasury is the future Relic Hunter unlock hook. Additional future secrets can include a false library wall or royal portrait passage.

### Enemy direction
Corrupted royal guards, court magi, animated armor, servants, scribes, cursed statues, and other court inhabitants.

## Throne Room

### Identity
Preparation and confrontation, not a normal farming/survival map.

### Preserve and deepen
King preparation, authored boss phases, and King 2.0 health gates. Later environmental phase changes can make the room itself participate in the fight.

### Secret direction
**The Broken Crown Altar**. A difficult conditional discovery tied to reaching or defeating the King under an unusual build restriction. This is the future Oathless unlock hook after that character's complete spec is approved.

## Map discovery principles

Normal objectives and known pickups may appear on the minimap. True secrets should not appear before discovery. A later account upgrade may expose vague `?` markers without naming the secret.

Secret types may include:

- exploration: find a location
- interaction: activate an object
- encounter: find it and survive or defeat an event
- conditional: arrive with a required item/build/state
- boss condition: perform an unusual action during a boss encounter

Secrets should be memorable and map-specific. Generic kill counters remain appropriate for normal early progression, while special characters can justify bespoke map events.

## First engineering vertical slice

1. Reusable map-event definitions and state helpers.
2. Persistent account discovery storage.
3. Dungeon Hungry Chest placement and encounter.
4. Secret discovery presentation.
5. Mimic character only after its Level 1-8 weapon, trait, transformation, solo viability, and unlock spec are approved.

This slice proves the full chain: exploration -> hidden object -> encounter -> permanent discovery -> secret unlock -> future character/weapon/transform progression.

# Fallen Keep first audio vertical slice

Status: production brief for Knight + Longsword + Winter's Judgment.

## Purpose

Establish the final audio quality bar with one complete, playable slice before expanding across the arsenal. These assets should sound physical, dark, medieval and restrained. Avoid arcade bleeps, obvious synth presets, exaggerated anime sword swooshes and generic stock fantasy magic.

## Folder target

Place approved production assets under `public/assets/audio/` using this structure:

- `sfx/weapons/sword/`
- `sfx/weapons/winter/`
- `sfx/player/`
- `sfx/pickups/`
- `sfx/ui/`
- `sfx/chest/`
- `sfx/encounters/`
- `music/`
- `ambience/`

Keep source/provenance notes in `docs/audio-sources.md`. Do not commit raw multi-gigabyte source libraries, only edited game-ready files.

## Target format

- Preferred shipping format: OGG Vorbis for broad browser compatibility and compact size.
- Keep lossless WAV masters outside the shipped game where practical.
- SFX should normally be mono unless stereo width is materially part of the effect.
- Music and ambience should be stereo.
- Trim dead air tightly while preserving natural tails.
- No normalization that crushes dynamics just to make every file equally loud.

## Longsword

### `weapon.sword.swing`

Target: 4 variants.

Search/source brief:
- real steel sword movement
- medium one-handed sword
- fast but weighty
- cloth/air body welcome
- no huge cinematic whoosh
- no bright comedy swish

Layering goal:
1. blade movement
2. restrained air/cloth displacement
3. very small metallic transient

Suggested filenames:
- `sword_swing_01.ogg`
- `sword_swing_02.ogg`
- `sword_swing_03.ogg`
- `sword_swing_04.ogg`

### `weapon.sword.impact`

Target: 5 variants.

Search/source brief:
- steel weapon striking armor, bone, dense leather or shield-like mass
- dry and controlled
- strong initial transient
- short enough for frequent survivor-game combat
- avoid giant Hollywood clangs with five-second tails

Layering goal:
1. metal/body impact
2. controlled low-mid weight
3. subtle armor/debris accent

Suggested filenames:
- `sword_impact_01.ogg` through `sword_impact_05.ogg`

Runtime rule: one grouped impact event per swing. Intensity can scale with number of enemies hit. Never trigger one full impact voice per enemy.

## Winter's Judgment

### `weapon.winter.cast`

Target: 3 variants.

The base sword identity must remain audible underneath the transformation.

Search/source brief:
- brittle ice crack
- frozen lake or compact ice fracture
- crystalline glass resonance
- cold wind burst
- no sparkling fairy magic

Layering goal:
1. sword movement inherited from Longsword
2. brittle ice fracture
3. short crystalline resonance
4. restrained freezing-air tail

Suggested filenames:
- `winter_cast_01.ogg`
- `winter_cast_02.ogg`
- `winter_cast_03.ogg`

### Future `weapon.winter.impact`

Target: 3 variants after the cast sound is approved.

Use ice fracture/crystalline break layered with the normal hit body. Do not replace the sword impact identity entirely.

## Player

### `player.block`

Target: 2-3 variants.

Knight's Iron Guard should read as a defensive physical event, not a UI ping.

Layers:
- shield/armor metal stop
- short low body impact
- faint spectral resonance only if needed

### `player.hit`

Target: 3 variants.

Layers:
- armor/leather body impact
- subtle low thump
- optional restrained breath/grunt only if it does not become repetitive

Do not make routine damage louder than boss or transformation cues.

## Pickups

### `pickup.xp`

Target: 3-5 tiny variants.

Should be pleasant at very high repetition. Think small crystalline/glass/stone pickup, not arcade coin or synth ping.

Requirements:
- extremely short
- soft transient
- pitch variation supported by runtime
- cooldown/grouping prevents machine-gun chatter

### `pickup.coin`

Target: 3 variants.

Physical small-metal/currency sound, less bright than classic arcade coins.

## Level up

### `level.up`

Target: 1 designed cue initially.

Layers:
- low tonal rise/body
- subtle metal or magical resonance
- short resolve at end

It should feel meaningful but not like a mobile-game reward jingle.

## Chest

### `chest.open`

Target: 2 variants.

Layers:
- wood/hinge/mechanism
- metal latch
- low supernatural bloom

### `chest.reveal`

Target: 3 short reveal accents.

Each sequential reward should feel satisfying without becoming a casino sound.

### `transform.reveal`

Target: 1 major sting for the first slice.

Should outrank normal combat in the mix. Combine low impact, metallic/spectral rise and a short resolved tail. Later transformations may receive their own identity layers on top.

## Encounters

### `elite.arrival`

Target: 1-2 variants.

Low, threatening, short. Possible materials: distant war horn, heavy gate/metal stress, drum/body impact. Avoid a cartoon alarm.

### `boss.arrival`

Target: 1 major cue.

Heavier and longer than elite arrival. Should interrupt ordinary combat attention without clipping or becoming obnoxious.

## First ambience/music work after SFX slice

Do not block the first combat slice on full music production. Once combat SFX are approved, build:

1. Courtyard ambience loop: wind, cloth/banner movement, sparse distant crows, distant structural groans.
2. Courtyard music prototype: low strings, sparse frame drum, distant bell texture, restrained motif.

## Mix acceptance test

Play at least ten minutes as Knight and verify:

- Longsword is recognizable with eyes closed.
- Four swing variants do not sound like obvious repeated alternates.
- A seven-enemy sword hit does not produce seven loud clangs.
- XP remains pleasant during mass pickup.
- Level-up and chest cues remain audible without being much louder than combat.
- Winter's Judgment clearly sounds like an evolved Longsword rather than unrelated ice magic.
- Elite/boss cues cut through the mix immediately.
- No sound feels comedic, toy-like or overtly synthetic.
- Muting and individual bus sliders work correctly.

Do not expand to the rest of the arsenal until this slice meets the quality bar.
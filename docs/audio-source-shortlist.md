# Fallen Keep audio source shortlist

Status: approved sourcing targets for the Knight + Longsword + Winter's Judgment vertical slice.

## Licensing rule

Use only source audio with a documented license that permits synchronization in a commercial game. Keep raw libraries outside the repository. Commit only edited, game-ready assets plus source/provenance notes.

For the free SONNISS GDC 2026 bundle, the current bundle page states that the included sounds are royalty-free, commercially usable, require no attribution, and may be used in games and other media productions. The license also prohibits redistributing the source sounds as a sound-effects library or asset pack. Re-designed sounds remain licensed material, so the repository should contain only the files actually used by Fallen Keep, not an extracted source library.

## First free source pool: SONNISS GDC 2026

The 2026 GDC bundle includes several unusually strong candidates for our first vertical slice. These are source ingredients, not intended to be dropped into the game untouched.

### Longsword source body

**Primary candidate**

`WEAPSwrd_Sword Slide Cuts, Metallic, Impact CM4 2_344 Audio_Medieval Weapons Vol 2.wav`

Library: Historical Weapons Vol. 2 / 344 Audio

Use it to audition:
- real blade movement
- metallic cut/scrape character
- impact transients
- ring-out material

Target edits:
- isolate 4 materially different swing/cut takes
- isolate useful metal/body transients for impact layering
- remove excess tails where they muddy survivor-game repetition
- preserve natural blade character

### Supplemental sword movement layer

`METLMisc_Metal, Slow Whoosh, Rattle, Pass By x4 01_344 Audio_Elemental Palette Designed Vol 1.wav`

Use only as a restrained secondary layer where a source sword movement lacks body. Avoid making Longsword sound like a cinematic trailer whoosh.

### Optional impact body layer

`METLImpt_Metal Bangs, Metal Hits, Banging On Doors_344 Audio_Haunting Ambiences Vol 3.wav`

Use sparingly for low-mid body. Do not let a generic metal bang replace the authentic sword transient.

### Optional dark body/debris layer

`WOODImpt_Wooden Hit, Dark, Heavy Hit, Vampire's Prison_344 Audio_Haunting Ambiences Vol 3.wav`

Potential very-low layer for a rare heavy hit. It should be nearly felt rather than heard and should never make normal sword hits sound like wood impacts.

## Winter's Judgment source pool

The free bundle contains four direct ice candidates from Alexander Kopeikin's 100 kHz Designed Ice library:

1. `ice, block of ice crushed, heavy-015.wav`
2. `ice, crack, ice block snapping-001.wav`
3. `ice, movement, ice drift, ice field cracking up, initial, wide-001.wav`
4. `ice, surface cracking, fissure, fast, hard-003.wav`

Recommended roles:

### Winter cast

Base: retain the approved Longsword swing.

Layer beneath/behind it:
- `ice, surface cracking, fissure, fast, hard-003.wav` for the immediate supernatural edge
- a tightly trimmed fragment of `ice, movement, ice drift, ice field cracking up, initial, wide-001.wav` for cold width/tail

The weapon must still read as a sword attack first and ice magic second.

### Winter impact / shatter

Primary transient:
- `ice, crack, ice block snapping-001.wav`

Heavy accent for larger shatters:
- `ice, block of ice crushed, heavy-015.wav`

Do not play a full heavy crush on every frozen enemy. It should be reserved for grouped shatters or high-intensity events.

## Transformation and supernatural sweeteners

The bundle also includes these candidates from Emotion and Magic:

- `magic, action gesture, evil presence, onslaught-004.wav`
- `magic, drone, tension, spellbound, evanescence-002.wav`
- `magic, energy flow, astonishment-001.wav`
- `magic, energy flow, astral travel-015.wav`

For the Knight slice, these are secondary sweeteners only. Winter's Judgment should be built primarily from sword + physical ice, not a generic magic effect.

The longer magical/drone sources may become more useful later for Arcane Wand, Soul Lantern, transformation reveals, and boss states.

## Paid upgrade path if the free sword source does not meet the bar

### SONNISS Historical Weapons Vol. 1

Strong fallback because it was recorded with professional swordsmen and includes High Medieval long sword recordings, sword fights, shield contacts, flesh impacts, and whooshes from multiple microphones.

### BOOM Library Medieval Weapons / Medieval Melee

Strong premium source pool for larger variation counts. BOOM's published metadata includes sword whooshes, two-handed sword hits, scrapes, stabs, armor, leather and other medieval material. Use source/construction-kit material rather than pre-designed cinematic effects when possible so Fallen Keep retains its own identity.

## Production target for batch 1

Create these game-ready assets after auditioning the free source files:

### Longsword
- `public/assets/audio/sfx/weapons/sword/sword-swing-01.ogg`
- `public/assets/audio/sfx/weapons/sword/sword-swing-02.ogg`
- `public/assets/audio/sfx/weapons/sword/sword-swing-03.ogg`
- `public/assets/audio/sfx/weapons/sword/sword-swing-04.ogg`
- `public/assets/audio/sfx/weapons/sword/sword-impact-01.ogg`
- `public/assets/audio/sfx/weapons/sword/sword-impact-02.ogg`
- `public/assets/audio/sfx/weapons/sword/sword-impact-03.ogg`
- `public/assets/audio/sfx/weapons/sword/sword-impact-04.ogg`
- `public/assets/audio/sfx/weapons/sword/sword-impact-05.ogg`

### Winter's Judgment
- `public/assets/audio/sfx/weapons/winter/winter-cast-01.ogg`
- `public/assets/audio/sfx/weapons/winter/winter-cast-02.ogg`
- `public/assets/audio/sfx/weapons/winter/winter-cast-03.ogg`
- `public/assets/audio/sfx/weapons/winter/winter-impact-01.ogg`
- `public/assets/audio/sfx/weapons/winter/winter-impact-02.ogg`
- `public/assets/audio/sfx/weapons/winter/winter-impact-03.ogg`

## Mix / edit rules for batch 1

- Trim dead air aggressively.
- Preserve transient detail.
- Avoid brick-wall loudness.
- No baked-in huge cinematic reverb.
- No obvious pitch-shift cartooning.
- Sword variants must sound like the same weapon, not four unrelated swords.
- Winter variants must retain the Longsword identity.
- A normal swing must stay short enough to repeat around the weapon's actual attack cadence.
- Impact sounds are grouped by attack event, not fired once per struck enemy.
- Export final assets as OGG for browser delivery; retain lossless working masters outside the repository.

## Acceptance test

Do not expand to another weapon until the Knight slice passes these checks:

- 10 minutes of Longsword play without obvious repetition fatigue
- hits remain clear under dense enemy counts
- XP and UI cues are still audible without competing with sword attacks
- Winter's Judgment clearly sounds like an evolved Longsword
- no event sounds arcade-like or synthetic
- no clipping or painful high-frequency buildup on headphones
- acceptable playback on iPhone/Safari and desktop Chromium

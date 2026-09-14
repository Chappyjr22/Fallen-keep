# Fallen Keep audio sourcing plan

The first production audio pass should use professionally recorded source material and custom layering rather than synthetic placeholder sounds.

## Source hierarchy

1. Professionally recorded/licensed source libraries for physical materials and Foley.
2. Custom editing/layering of those recordings into Fallen Keep-specific events.
3. Generated audio only for supernatural sweeteners or material that cannot be sourced cleanly, and only when it meets the same quality/licensing bar.
4. Oscillator tones remain temporary development fallbacks only.

## Recommended starting libraries

### Sonniss Game Audio GDC bundles
Use as the first no-cost source pool. Current bundle licensing allows commercial game use, modification, unlimited projects and no attribution. Preserve a copy of the applicable license alongside source-audio provenance records.

Look first for:
- sword swings and blade movement
- sword/armor impacts
- cloth movement
- chain and metal handling
- ice cracks
- cold wind
- stone/debris impacts
- chest/wood/metal mechanisms
- low cinematic impacts
- bells
- fire
- ambience beds

### BOOM Library
Premium fallback/upgrade source when the free pool does not meet the quality bar. Medieval Weapons / Medieval Melee are particularly relevant because they contain authentic weapon handling, swings, impacts, armor, leather, wood and multiple variations suitable for games.

## First asset shot list

Do not source one final file per event. Collect clean components and build several variants.

### Longsword
- 6 to 10 clean sword movement/whoosh recordings
- 6 to 10 steel/armor/body impacts
- 3 to 5 cloth/leather movement layers
- 3 to 5 restrained low impact sweeteners

Target output:
- `sword_swing_01..04`
- `sword_impact_01..05`

### Winter's Judgment
- brittle ice fractures
- crystalline resonance
- cold wind gusts
- low magical pressure layer

Target output:
- `winter_cast_01..03`
- `winter_impact_01..03`

### Run-loop cues
- XP gem pickup components
- coin/metal pickup components
- chest latch/wood/metal opening
- chest reveal sweeteners
- level-up rise/sting
- elite warning impact
- boss warning impact
- Knight block/shield transient
- player damage body/armor transient

## Processing rules

- Keep source masters outside the shipped `public/assets/audio` folder.
- Ship only edited game-ready files.
- Preserve at least 3 useful variations for spam-prone weapon/pickup events.
- Avoid huge reverb tails on frequently repeated combat sounds.
- Remove unnecessary low-frequency buildup from common effects.
- Leave headroom so boss/transform cues can win the mix.
- Normalize by perceived loudness, not peak level alone.
- Test sounds inside a dense 15+ minute run, not in isolation.

## Provenance

For every shipped asset, record:
- event ID
- shipped filename
- source library
- original source filename(s)
- license/source URL or license document
- edits/layers performed
- date imported

Do not commit purchased raw libraries to the public repository unless their license explicitly permits redistribution. Normally only derived, synchronized game assets should be shipped.

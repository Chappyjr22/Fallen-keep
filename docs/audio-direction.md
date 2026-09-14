# Fallen Keep audio direction

Status: approved production direction for the first serious audio pass.

## Goal

Fallen Keep should sound physical, dark, medieval, supernatural, restrained, and expensive. Avoid generic fantasy synths, arcade bleeps, stock magic zaps, and constant maximum-intensity effects.

The soundscape should come from believable materials first, with supernatural layers added on top.

Physical palette:
- steel
- leather
- chain
- wood
- stone
- cloth
- bone
- fire
- glass
- liquid

Supernatural palette:
- cold air
- distant whispers
- restrained choir
- reversed metal
- low room rumbles
- spectral movement
- corrupted resonance
- ritual bells

Transformations should preserve the identity of the base weapon and then elevate it. They should not sound like unrelated weapons.

## Mix hierarchy

Priority order:
1. Critical gameplay cues
2. Player weapon attacks and transformation events
3. Player damage and defensive reactions
4. Elite and boss cues
5. Chest and reward cues
6. Enemy sounds
7. Pickups
8. Ambience

Music supports the mix rather than competing with it.

## Audio architecture requirements

The runtime should move away from one-off oscillator beeps and use a reusable event-driven audio system.

Required buses:
- Master
- Music
- SFX
- Ambience

Required capabilities:
- per-event sample pools
- random sample variation
- subtle pitch and volume variation
- concurrency limits
- cooldown/throttling for spam-prone events
- event priority
- grouped impact intensity instead of one sound per enemy hit
- mobile/browser autoplay-safe initialization
- persistent volume and mute settings
- graceful fallback when an optional sample is unavailable

Gameplay code should trigger semantic event IDs, not know exact asset filenames.

Examples:
- `weapon.sword.swing`
- `weapon.sword.hit`
- `weapon.winter.cast`
- `pickup.xp`
- `pickup.coin`
- `ui.levelup`
- `chest.open`
- `chest.reveal`
- `enemy.elite.arrive`
- `boss.king.phase`
- `player.damage`
- `player.block`
- `unlock.major`

## First vertical slice

The first quality bar is Knight + Longsword + Winter's Judgment plus the minimum surrounding run loop.

Produce and integrate:
- Longsword swing variants
- Longsword impact variants
- Winter's Judgment cast layer
- Winter's Judgment impact/freeze layer
- XP gem pickup
- coin pickup
- enemy hit/death response
- player damage
- Knight block
- level-up cue
- chest open
- chest reward reveal
- transformation sting
- elite warning
- boss warning
- player death
- victory

The slice is considered successful only after a real run can be played without the audio feeling repetitive, noisy, comedic, or synthetic.

## Weapon identity

### Longsword
Base layers:
- blade movement
- cloth/air displacement
- restrained metallic transient

Impact:
- metal/bone body
- controlled low transient
- small debris/armor accent when appropriate

Winter's Judgment adds:
- brittle ice crack
- crystalline resonance
- freezing wind

### Spectral Shield
- metal mass
- airy spectral movement
- low impact pulse

### Arcane Wand
- crystalline snap
- magical pressure burst
- avoid stock laser or arcade projectile sounds

### Hex Flask
- glass
- liquid
- bubbling/corruption
- whispered or breathy low magical layer

### Hallowed Censer
- chain movement
- metal pendulum
- incense/breath texture
- sacred/corrupted resonance

### Soul Lantern
- spectral inhale/exhale
- distant human-like texture
- soft impact bloom

### Thornwood Bow
- dry bowstring release
- wood resonance
- sharp projectile impact

### Royal Halberd
- heavier metal movement
- longer swing/thrust body
- low-mid impact

### Storm Bell
- real bell body
- thunder transient
- electric tail without sci-fi character

### Cinder Tome
- ritual cast texture
- ignition
- fire bloom

### Crownshards
- spectral blade fan
- metallic-glass resonance
- royal/corrupted tail

## Music direction

Avoid generic heroic fantasy orchestral scoring.

Target language:
- dark medieval chamber music
- restrained cinematic scoring
- environmental dungeon texture

Useful instrumentation:
- cello and low strings
- viola
- frame drums
- sparse deep percussion
- bowed metal
- medieval bells
- restrained choir
- low male drone
- hurdy-gurdy texture
- dulcimer/plucked strings
- sparse pipe/woodwind texture

### Courtyard
Open, cold, exposed. Wind, low strings, sparse drums, distant bells.

### Basement
Claustrophobic. Drones, drips, chains, bowed metal, restrained pulse.

### First Floor
Royal but corrupted. Broken courtly texture, choir, bells, strings, fire ambience.

### Throne Room / Corrupted King
A modular score designed around King 2.0.

- Opening: recognizable King motif, slow and threatening
- 75% gate: rhythm enters
- 50% gate: choir and bell layers intensify
- 25% gate: heavier percussion/corruption layer
- Final stand: brief drop in density, then full motif returns at maximum intensity
- Death: hard musical cut, crown impact and long reverb, then victory cue

## Ambience

Ambience must make each map sound like a place even when music is quiet.

Courtyard:
- wind
- crows
- banners
- distant battle
- castle groans

Basement:
- drips
- stone movement
- distant chains
- rats
- muffled voices

First Floor:
- fireplaces
- distant footsteps
- banners
- wood/stone creaks
- whispers

Throne:
- deep room tone
- corruption hum
- wind through broken masonry
- occasional distant metal/crown resonance

## Survivor-game mixing rules

Do not play one loud impact sound for every enemy hit in a dense attack.

Examples:
- Longsword hitting seven enemies should produce one scaled impact event, not seven identical impacts.
- XP gem pickups should form a controlled cadence or grouped/rising sequence.
- Repeated projectile impacts need concurrency limits and variation.
- Loud transformation/boss cues should temporarily win the mix over ordinary combat.

## Source quality

Prefer properly licensed field-recorded or professionally designed source material, then layer/edit it into Fallen Keep's identity. AI-generated material may be used when it meets the same quality bar and licensing requirements.

Do not ship obviously synthetic placeholder tones as final combat or music assets.

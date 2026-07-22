# Sprint 17 Plan: Saffron City, Silph Co., Sabrina's Gym

**Sprint:** 17
**Theme:** Saffron City, Silph Co. (Team Rocket takeover), Sabrina's Psychic Gym
**Prerequisites:** Sprint 16 (Team Rocket Hideout, Saffron Gates opened)

---

## Overview

Saffron City is a major city featuring Silph Co. headquarters (under Team Rocket siege), the Fighting Dojo, and Sabrina's Psychic-type Gym. The player must clear Team Rocket from Silph Co. to unlock Sabrina's gym challenge.

## Story Arc

- Player enters Saffron City through the now-open gates
- Silph Co. is under Team Rocket control — player must infiltrate
- Clear Silph Co. floors, battle Giovanni again on the top floor
- Receive Master Ball from Silph Co. President
- Fighting Dojo optional — defeat to receive Hitmonlee or Hitmonchan
- Challenge Sabrina for the Marsh Badge

---

## Backend Tasks

### B1: New Pokemon Species (5 new)
- Kadabra (id:64) — Psychic, evolves from Abra at 16 (already have Abra=63)
- Alakazam (id:65) — Psychic (trade evolution, null)
- Mr. Mime (id:122) — Psychic
- Hitmonlee (id:106) — Fighting
- Hitmonchan (id:107) — Fighting

### B2: Maps Data
- saffron_city (30x30, city) — connections: north→route_5, south→route_6, east→route_8, west→route_7
- saffron_pokemon_center (8x8), saffron_pokemart (8x8)
- saffron_gym (12x12, gym) — teleporter puzzle aesthetic
- silph_co_1f (14x12, interior), silph_co_2f (14x12, interior)
- silph_co_top (14x12, interior) — Giovanni boss fight
- fighting_dojo (10x10, interior)

### B3: Trainers, NPCs
- Sabrina's gym trainers (3 psychic-type users)
- Silph Co. Rocket Grunts (4)
- Fighting Dojo trainers (2)
- Giovanni (reuse from Sprint 16 with stronger team)

### B4: Items
- Master Ball (id:59)
- TM29 Psychic (id:60)

### B5: Saffron Gym Service
- Add to gyms.json: saffron_gym, Sabrina, Psychic type, Marsh Badge
- Pokemon: Kadabra, Mr. Mime, Alakazam

### B6: Silph Co. Service (new)
- State machine: not_entered → infiltrating → rockets_cleared → president_rescued
- defeat_giovanni_silph gives Master Ball

### B7: Quest Definitions
- silph_co_rescue (main)
- marsh_badge (main)
- fighting_dojo (side)

---

## Frontend Tasks

### F1: Saffron City (30x30)
### F2: Silph Co. floors (1F, 2F, Top)
### F3: Sabrina's Gym — teleporter tile aesthetic
### F4: Fighting Dojo interior
### F5: Sprites: Sabrina, Blackbelt, Silph Worker
### F6: API wiring for Silph Co. service

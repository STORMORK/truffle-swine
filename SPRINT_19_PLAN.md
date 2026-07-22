# Sprint 19 Plan: Cinnabar Island, Blaine's Gym, Pokemon Mansion

**Sprint:** 19
**Theme:** Cinnabar Island, Blaine's Fire Gym, Pokemon Mansion, Routes 19-21 (Seafoam to Cinnabar water routes)
**Prerequisites:** Sprint 18 (Fuchsia City complete, HM03 Surf available)

---

## Overview

Cinnabar Island is reached by surfing south from Pallet Town or west from Fuchsia City. Features Blaine's Fire-type Gym with quiz/lock puzzle, the abandoned Pokemon Mansion with Mewtwo lore, and the Pokemon Lab for fossil revival.

## Story Arc

- Player surfs to Cinnabar Island via Route 21 (from Pallet) or Route 20 (from Fuchsia)
- Pokemon Mansion holds the Secret Key needed to unlock Blaine's Gym
- Blaine's quiz-style gym puzzle
- Earning the Volcano Badge from Blaine
- Pokemon Lab can revive fossils

---

## Backend Tasks

### B1: New Pokemon Species (5 new)
- Ponyta (id:77) — Fire, evolves to Rapidash at 40
- Rapidash (id:78) — Fire
- Growlithe (id:58) — Fire, evolves to Arcanine with Fire Stone
- Arcanine (id:59) — Fire
- Magmar (id:126) — Fire (Pokemon Mansion encounter)

### B2: Maps Data
- cinnabar_island (20x20, city) — connections: north→route_21, east→route_20
- cinnabar_pokemon_center (8x8), cinnabar_pokemart (8x8)
- cinnabar_gym (12x12, gym)
- pokemon_mansion_1f (14x14, interior)
- pokemon_mansion_2f (14x14, interior)
- pokemon_mansion_top (14x14, interior)
- pokemon_lab (10x8, interior)
- route_20 (30x10, water route — Fuchsia to Cinnabar)
- route_21 (10x30, water route — Pallet to Cinnabar)

### B3: Trainers & NPCs
- Blaine's gym trainers (3 fire-type users: Burglar class)
- Pokemon Mansion scientists (2)
- Route 20/21 swimmers (3)

### B4: Items & Encounters
- Secret Key (id:64) — unlocks Blaine's Gym
- TM38 Fire Blast (id:65)
- route_20, route_21 encounter tables (water Pokemon)
- pokemon_mansion encounter table

### B5: Gym Service
- Add cinnabar_gym, Blaine, Fire, Volcano Badge

### B6: Quests
- volcano_badge (main)
- pokemon_mansion (side — find Secret Key)

---

## Frontend Tasks

### F1: Cinnabar Island (20x20)
### F2: Blaine's Gym — quiz/lock aesthetic
### F3: Pokemon Mansion (3 floors)
### F4: Pokemon Lab
### F5: Routes 20 & 21 (water routes)
### F6: Sprites: Blaine, Burglar, Swimmer
### F7: API wiring (existing gym system)

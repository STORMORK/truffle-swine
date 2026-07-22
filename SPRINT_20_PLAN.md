# Sprint 20 Plan: Viridian City Gym (Giovanni), Victory Road

**Sprint:** 20
**Theme:** Viridian City Gym (Giovanni, Ground-type), Route 22/23, Victory Road
**Prerequisites:** Sprint 19 (Cinnabar Island complete, 7 badges)

---

## Overview

After earning 7 badges, the player returns to Viridian City where Giovanni has reopened his gym. Defeating him earns the 8th and final Earth Badge. Route 22/23 leads to Victory Road, a cave dungeon requiring Strength to navigate, leading to the Indigo Plateau.

## Story Arc

- Player returns to Viridian City with 7 badges
- Giovanni is revealed as the final Gym Leader
- Earning the Earth Badge from Giovanni
- Route 22/23 to Victory Road entrance
- Victory Road cave with boulder puzzles
- Arriving at Indigo Plateau

---

## Backend Tasks

### B1: New Pokemon Species (5 new)
- Rhyhorn (id:111) — Ground/Rock, evolves to Rhydon at 42
- Rhydon (id:112) — Ground/Rock
- Onix (id:95) — Rock/Ground
- Marowak (id:105) — Ground
- Dugtrio (id:51) — Ground

### B2: Maps Data
- viridian_gym (12x12, gym)
- route_22 (20x15, route)
- route_23 (15x30, route — badge check gates)
- victory_road_1f (16x16, cave)
- victory_road_2f (16x16, cave)
- indigo_plateau (15x15, city)
- indigo_pokemon_center (8x8)

### B3: Trainers & NPCs
- Giovanni's gym trainers (3 ground-type: Cooltrainers)
- Victory Road trainers (3)
- Route 22 trainer (1)

### B4: Items & Encounters
- TM26 Earthquake (id:66)
- victory_road encounter table
- route_22 encounter table

### B5: Gym Service
- Add viridian_gym, Giovanni, Ground, Earth Badge

### B6: Quests
- earth_badge (main)
- victory_road (main)

---

## Frontend Tasks

### F1: Viridian City Gym (12x12)
### F2: Route 22/23
### F3: Victory Road (2 floors, boulder puzzles)
### F4: Indigo Plateau exterior
### F5: Sprites: Cooltrainer
### F6: API wiring (existing gym system)

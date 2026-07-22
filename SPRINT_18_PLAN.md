# Sprint 18 Plan: Fuchsia City, Koga's Gym, Safari Zone

**Sprint:** 18
**Theme:** Fuchsia City, Koga's Poison Gym, Safari Zone, Routes 12-15 connections
**Prerequisites:** Sprint 17 (Saffron City complete)

---

## Overview

Fuchsia City is reached via Cycling Road (from Route 16) or Routes 12-15. Features Koga's Poison-type Gym with invisible wall puzzle, the Safari Zone for catching rare Pokemon, and the Warden's house (Gold Teeth quest for HM04 Strength).

## Story Arc

- Player reaches Fuchsia City via Cycling Road or eastern routes
- Safari Zone offers rare Pokemon and HM03 Surf
- Koga's gym has invisible walls — an aesthetic maze
- Earning the Soul Badge from Koga
- Warden trades Gold Teeth for HM04 Strength

---

## Backend Tasks

### B1: New Pokemon Species (5 new)
- Venonat (id:48) — Bug/Poison, evolves to Venomoth at 31
- Venomoth (id:49) — Bug/Poison
- Koffing already exists (id:37), Weezing (id:38) — already exist
- Chansey (id:113) — Normal (Safari Zone rare)
- Scyther (id:123) — Bug/Flying (Safari Zone rare)
- Tauros (id:128) — Normal (Safari Zone rare)

### B2: Maps Data
- fuchsia_city (30x25, city) — connections: east→route_15, north→route_16_south (cycling road end)
- fuchsia_pokemon_center (8x8), fuchsia_pokemart (8x8)
- fuchsia_gym (12x12, gym)
- safari_zone_entrance (10x8, interior)
- safari_zone_area_1 (20x20, route)
- safari_zone_area_2 (20x20, route)
- wardens_house (8x8, interior)

### B3: Trainers & NPCs
- Koga's gym trainers (3 poison-type users: Jugglers)
- Safari Zone guide NPC
- Warden NPC

### B4: Items & Encounters
- HM03 Surf (id:61), HM04 Strength (id:62), Gold Teeth (id:63)
- Safari Zone encounter tables (rare Pokemon)

### B5: Gym Service
- Add fuchsia_gym, Koga, Poison, Soul Badge

### B6: Quests
- soul_badge (main)
- safari_zone (side)
- wardens_teeth (side)

---

## Frontend Tasks

### F1: Fuchsia City (30x25)
### F2: Koga's Gym — invisible wall aesthetic
### F3: Safari Zone areas
### F4: Warden's House
### F5: Sprites: Koga, Juggler
### F6: API wiring (existing gym system)

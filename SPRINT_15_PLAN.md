# Sprint 15 Plan: Celadon City, Erika's Gym & Game Corner

**Sprint:** 15
**Theme:** Celadon City, Game Corner, Erika's Grass Gym, Route 16/Cycling Road
**Prerequisites:** Sprint 14 (Lavender Town, Pokemon Tower)

---

## Overview

Celadon City — the largest city so far, featuring the Department Store, Game Corner with Team Rocket's secret hideout entrance, and Erika's Grass-type Gym. Route 16 leads west to the Cycling Road.

## Story Arc

- Player arrives via Route 7 from Saffron/Lavender area
- Celadon Department Store has many useful items
- Game Corner hides Team Rocket's secret base (entrance only — full hideout Sprint 16)
- Erika's gym has the Cut tree puzzle — needs HM01 from S.S. Anne
- Earning Rainbow Badge unlocks access toward Fuchsia City via Cycling Road

---

## Backend Tasks

### B1: New Pokemon Species (5 new)
- Eevee (id:133) — Normal, no level evolution (stone only)
- Bellsprout (id:69) — Grass/Poison, evolves to Weepinbell at 21
- Weepinbell (id:70) — Grass/Poison, evolution null (Leaf Stone)
- Tangela (id:114) — Grass
- Exeggcute (id:102) — Grass/Psychic

### B2: Maps Data
- celadon_city (30x30, city) — connections: east→route_7, west→route_16
- celadon_pokemon_center (8x8), celadon_pokemart (8x8)
- celadon_department_store_1f (12x10), celadon_department_store_2f (12x10)
- celadon_gym (12x12, gym)
- celadon_game_corner (14x12, interior)
- celadon_mansion (10x10, interior)
- celadon_condominiums (8x8)
- route_16 (20x15, route) — west→cycling_road
- cycling_road (10x40, route) — vertical, downhill

### B3: Trainers, NPCs, Dialogues
- Celadon Gym trainers (3 grass-type users)
- Route 16 trainers (2: Biker, Bird Keeper)
- Cycling Road trainers (3: Bikers)
- Game Corner NPCs (Rocket disguised, gambler)
- Department Store clerks

### B4: Encounter Tables & Items
- route_16 encounters, cycling_road encounters
- TM21 Mega Drain (id:56), Coin Case (id:57), Silph Scope now obtainable from Game Corner arc

### B5: Celadon Gym Service (uses existing gym system)
- Add to gyms.json: celadon_gym, Erika, Grass type, Rainbow Badge
- Pokemon: Victreebel, Tangela, Vileplume

### B6: Quest Definitions
- rainbow_badge (main)
- team_rocket_hideout (main, setup only)

---

## Frontend Tasks

### F1: Celadon City Rendering (30x30)
### F2: Department Store multi-floor
### F3: Game Corner interior
### F4: Erika's Gym with cut-tree aesthetic
### F5: Route 16 & Cycling Road
### F6: Sprites: Erika, Biker, Clerk/Cashier
### F7: API wiring (none needed beyond existing gym endpoints)

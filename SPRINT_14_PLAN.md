# Sprint 14 Plan: Lavender Town, Pokemon Tower & Routes 7-8

**Sprint:** 14
**Theme:** Lavender Town, Pokemon Tower, Routes 7-8, Route 12
**Prerequisites:** Sprint 13 (Vermilion City, S.S. Anne, Thunder Badge)

---

## Overview

Sprint 14 introduces Lavender Town — the haunted town with Pokemon Tower, the Silph Scope quest setup, and new routes connecting Celadon City (future sprint) with the eastern part of the map.

## Story Arc

- Player travels east from Cerulean City via Route 8 to reach Lavender Town
- Pokemon Tower is haunted — ghosts block progress without Silph Scope
- Mr. Fuji is held captive on the top floor by Team Rocket
- Player can explore but cannot complete tower until Silph Scope (Sprint 15/Celadon)
- Route 12 leads south toward the Silence Bridge and Fuchsia City (future)

---

## Backend Tasks

### B1: New Pokemon Species (6 new species)
- **Gastly** (id:92) — Ghost/Poison, evolves to Haunter at lv25
- **Haunter** (id:93) — Ghost/Poison, evolves to Gengar via trade
- **Cubone** (id:104) — Ground, evolves to Marowak at lv28
- **Marowak** (id:105) — Ground
- **Drowzee** (id:96) — Psychic, evolves to Hypno at lv26 (already exists, verify)
- **Hypno** (id:97) — Psychic (new)

### B2: Maps Data
- **lavender_town** (20x20) — city, connections: west→route_8, south→route_12
- **lavender_pokemon_center** (8x8) — interior
- **lavender_pokemart** (8x8) — interior
- **lavender_volunteer_house** (8x8) — interior (Mr. Fuji's house)
- **pokemon_tower_1f** (12x12) — interior (lobby)
- **pokemon_tower_2f** (12x12) — interior (tombstones, ghost encounters)
- **pokemon_tower_3f** (12x12) — interior (more tombstones)
- **pokemon_tower_top** (12x12) — interior (Mr. Fuji held by Rocket)
- **route_7** (20x10) — short route connecting Celadon to Saffron area
- **route_8** (30x20) — route between Lavender and route_7
- **route_12** (15x35) — vertical route south of Lavender, Snorlax blocks path

### B3: NPCs, Dialogues, Trainers
- Lavender NPCs: Mr. Fuji (volunteer_house), Name Rater, townsfolk (4)
- Pokemon Tower ghost channelers (5 trainer-channelers on floors 2-3)
- Team Rocket grunts (2 on top floor)
- Route 8 trainers (3): Lass, Super Nerd, Gambler
- Route 12 trainers (2): Fisherman, Young Couple

### B4: Encounter Tables
- pokemon_tower_2f: Gastly (90%), Cubone (10%) — levels 13-18
- pokemon_tower_3f: Gastly (70%), Haunter (20%), Cubone (10%) — levels 15-20
- route_8: Growlithe, Pidgey, Kadabra, Meowth — levels 18-22
- route_12: Oddish, Venonat, Tentacool (surfing) — levels 22-26

### B5: Pokemon Tower Event Service
- `pokemon_tower_service.py` — state machine:
  - States: not_visited → exploring → ghost_blocked → has_scope → fuji_rescued
  - `get_state(game_id)` → current progress
  - `enter_tower(game_id)` → start exploration
  - `encounter_ghost(game_id, floor)` → check if blocked (no Silph Scope)
  - `use_silph_scope(game_id)` → reveal ghost as Marowak
  - `defeat_rockets(game_id)` → clear top floor
  - `rescue_fuji(game_id)` → get Poke Flute reward

### B6: Pokemon Tower Router
- `routes/pokemon_tower.py` — prefix: `/api/pokemon-tower`
  - GET `/state/{game_id}` 
  - POST `/enter` — enter tower
  - POST `/ghost` — encounter ghost on floor
  - POST `/scope` — use Silph Scope
  - POST `/rockets` — defeat Rockets
  - POST `/rescue` — rescue Mr. Fuji

### B7: New Items
- **Silph Scope** (id:54) — key_item, reveals ghost identity
- **Poke Flute** (id:55) — key_item, wakes Snorlax

### B8: Quest Definitions
- `pokemon_tower` (main) — Explore Pokemon Tower, rescue Mr. Fuji
- `snorlax_road` (side) — Wake the sleeping Snorlax on Route 12

### B9: Register Router in main.py

---

## Frontend Tasks

### F1: Lavender Town Rendering
- buildLavenderTown() — 20x20, eerie purple/grey aesthetic
  - Pokemon Center, Pokemart, Volunteer House, Pokemon Tower entrance
  - West exit to Route 8, south exit to Route 12

### F2: Pokemon Tower Multi-Floor
- buildPokemonTower1F() — 12x12, lobby with tombstones
- buildPokemonTower2F() — 12x12, channelers, ghost encounters
- buildPokemonTower3F() — 12x12, more channelers
- buildPokemonTowerTop() — 12x12, Mr. Fuji and Rocket grunts
- Floor-to-floor stairway connections

### F3: Routes 7, 8, 12
- buildRoute7() — 20x10, short connector
- buildRoute8() — 30x20, horizontal path with trainers
- buildRoute12() — 15x35, vertical path with Snorlax blockade

### F4: Sprites & API Wiring
- drawChanneler() — purple robe, mystical
- drawMrFuji() — old man, kind face
- drawGhost() — purple haze shape (unidentified ghost in tower)
- API: pokemon tower endpoints (6)

---

## QA Tasks

### QA-A: Backend QA (pre-write tests)
- test_lavender_town.py — map existence, connections, buildings (8 tests)
- test_pokemon_tower_event.py — state machine flow (12 tests)
- test_sprint14_species.py — Gastly, Haunter, Cubone, Marowak, Hypno (8 tests)
- test_routes_7_8_12.py — map connections, encounter tables (6 tests)

### QA-B: Frontend QA
- Verify all maps render (buildXxx functions exist)
- Check map interconnections (exits/doors)
- Verify sprites (drawChanneler, drawMrFuji, drawGhost)
- Verify API endpoints wired

---

## File Ownership (Parallel Safety)

| Agent | Owns |
|-------|------|
| Backend Data | pokemon_species.json, maps.json, items.json, trainers.json, npcs.json, dialogues.json, encounter_tables.json |
| Backend Svc | services/pokemon_tower_service.py, routes/pokemon_tower.py, main.py, quest_service.py |
| Backend QA | tests/test_lavender_town.py, test_pokemon_tower_event.py, test_sprint14_species.py, test_routes_7_8_12.py |
| Frontend | routes.js, sprites.js, api.js |
| Frontend QA | tests/QA_REPORT_SPRINT_14.md |

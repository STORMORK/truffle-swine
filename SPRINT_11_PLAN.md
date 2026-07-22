# Sprint 11 Plan — Route 4, Cerulean City, Misty's Gym & World Expansion

> **Theme:** World Expansion — Connect Mt. Moon to Cerulean City, Misty's Gym, New Trainers, Expanded Pokemon Roster
> **Sprint Start:** 2026-04-14
> **Baseline:** ~1,410 tests passing, 16 maps, 42 Pokemon species, 5 trainers, 2 gyms (Brock + Misty data only), 48 frontend JS modules, 24 backend routers

---

## Why This Sprint

The game world currently ends at Mt. Moon with no exit. Misty's gym data exists in `gyms.json` but Cerulean City doesn't exist as a map. The player has nowhere to go after beating Brock and clearing Mt. Moon. This sprint connects the world, adds a real second gym experience, and fills out the roster with Pokemon species needed for the Cerulean area.

**Current world graph:**
```
Pallet Town <-> Route 1 <-> Viridian City <-> Route 2 <-> Pewter City <-> Route 3 <-> Mt. Moon (dead end)
```

**After this sprint:**
```
Pallet Town <-> Route 1 <-> Viridian City <-> Route 2 <-> Pewter City <-> Route 3 <-> Mt. Moon <-> Route 4 <-> Cerulean City
```

---

## Sprint Goals

1. **Route 4 Map** — A new route connecting Mt. Moon exit to Cerulean City, with grass encounters (level 8-14 Pokemon), 3 trainers, and optional ledges.
2. **Cerulean City** — Full town map with Pokemon Center, Poke Mart, Cerulean Gym (Misty), Bike Shop (NPC only — no bike mechanic yet), and 5+ NPCs with dialogue.
3. **Misty's Gym Battle** — Wire existing Misty gym data to a playable gym map with 2 gym trainers and Misty (Staryu L18, Starmie L21). Player earns Cascade Badge.
4. **Expanded Pokemon Roster** — Add 12+ new species relevant to Cerulean area (Oddish line, Bellsprout line, Abra line, Jigglypuff, Spearow/Fearow, Ekans/Arbok or Sandshrew/Sandslash completion).
5. **Route Trainers** — Add 8+ new trainers across Route 3, Mt. Moon, and Route 4 to create a proper difficulty progression from Pewter to Cerulean.

---

## Task Dependencies (Build Order)

```
Phase 1 (Backend Data — parallel):
  B1: New Pokemon species data ──────┐
  B2: Route 4 map + encounter data ──┤── Can be parallel
  B3: Cerulean City map data ─────────┤
  B4: New trainer definitions ────────┘

Phase 2 (Backend Integration — depends on Phase 1):
  B5: Cerulean Gym wiring (depends on B3, B4)
  B6: Mt. Moon exit connection to Route 4 (depends on B2)
  B7: New NPC dialogues for Cerulean City (depends on B3)

Phase 3 (Frontend — after corresponding backend):
  F1: Route 4 map rendering + trainers (depends on B2, B6)
  F2: Cerulean City rendering + NPCs (depends on B3, B7)
  F3: Cerulean Gym UI + Misty battle (depends on B5)
  F4: New Pokemon sprites (depends on B1)

Phase 4 (QA):
  QA-A: Backend tests for all new data, endpoints, trainer battles
  QA-B: Frontend integration tests, map transitions, gym flow
```

**Critical Path:** B3 → B5 → F3 (Cerulean Gym is the headline feature)

---

## Backend Tasks (backend-dev)

### B1: New Pokemon Species Data

**Files to modify:**
- `backend/data/pokemon_species.json` — Add 12+ new species
- `backend/data/moves.json` — Add any missing moves for new species learnsets
- `backend/data/encounter_tables.json` — Add Route 4 + Cerulean area encounter tables
- `backend/data/abilities.json` — Add abilities for new species if missing

**New species to add (12 minimum):**

| ID | Name | Types | Rationale |
|----|------|-------|-----------|
| 23 | Ekans | Poison | Route 4 encounter (Red version equivalent) |
| 24 | Arbok | Poison | Evolution of Ekans |
| 29 | Nidoran-F | Poison | Route 3/4 encounter |
| 30 | Nidorina | Poison | Evolution |
| 32 | Nidoran-M | Poison | Route 3/4 encounter |
| 33 | Nidorino | Poison | Evolution |
| 39 | Jigglypuff | Normal/Fairy | Route 3 encounter |
| 40 | Wigglytuff | Normal/Fairy | Moon Stone evolution |
| 43 | Oddish | Grass/Poison | Route 4 grass encounter |
| 44 | Gloom | Grass/Poison | Evolution |
| 63 | Abra | Psychic | Route 4 encounter (flee mechanic) |
| 64 | Kadabra | Psychic | Evolution |

**New encounter tables:**
```json
"route_4": {
  "encounter_type": "grass",
  "base_encounter_rate": 0.15,
  "encounters": [
    {"species_id": 23, "min_level": 8, "max_level": 12, "weight": 25},
    {"species_id": 27, "min_level": 8, "max_level": 12, "weight": 20},
    {"species_id": 43, "min_level": 8, "max_level": 14, "weight": 20},
    {"species_id": 29, "min_level": 8, "max_level": 12, "weight": 15},
    {"species_id": 32, "min_level": 8, "max_level": 12, "weight": 10},
    {"species_id": 63, "min_level": 8, "max_level": 12, "weight": 5},
    {"species_id": 39, "min_level": 8, "max_level": 12, "weight": 5}
  ]
},
"route_4_surfing": {
  "encounter_type": "surfing",
  "base_encounter_rate": 0.15,
  "encounters": [
    {"species_id": 54, "min_level": 15, "max_level": 20, "weight": 50},
    {"species_id": 60, "min_level": 15, "max_level": 20, "weight": 30},
    {"species_id": 116, "min_level": 15, "max_level": 20, "weight": 20}
  ]
},
"cerulean_city_surfing": {
  "encounter_type": "surfing",
  "base_encounter_rate": 0.10,
  "encounters": [
    {"species_id": 54, "min_level": 15, "max_level": 25, "weight": 40},
    {"species_id": 60, "min_level": 15, "max_level": 20, "weight": 30},
    {"species_id": 118, "min_level": 15, "max_level": 25, "weight": 30}
  ]
}
```

**Also update `route_3` encounter table** to include Jigglypuff (species 39) and Nidoran-F/M (29, 32) for continuity with original games.

---

### B2: Route 4 Map Data

**Files to modify:**
- `backend/data/maps.json` — Add `route_4` map definition

**Map definition:**
```json
{
  "id": "route_4",
  "name": "route_4",
  "display_name": "Route 4",
  "map_type": "route",
  "width": 30,
  "height": 20,
  "connections": [
    {"direction": "west", "target_map_id": "mt_moon_entrance", "entry_x": 24, "entry_y": 15},
    {"direction": "east", "target_map_id": "cerulean_city", "entry_x": 0, "entry_y": 12}
  ],
  "npcs": [],
  "trainers": [
    {"trainer_id": "lass_crissy", "x": 8, "y": 10, "facing": "right", "sight_range": 3},
    {"trainer_id": "youngster_timmy", "x": 18, "y": 8, "facing": "down", "sight_range": 4},
    {"trainer_id": "hiker_marcos", "x": 24, "y": 14, "facing": "left", "sight_range": 3}
  ],
  "encounter_zones": [
    {"x": 5, "y": 5, "width": 8, "height": 6, "encounter_table_id": "route_4"},
    {"x": 18, "y": 10, "width": 6, "height": 5, "encounter_table_id": "route_4"}
  ],
  "buildings": []
}
```

**Also modify `mt_moon_entrance`** — Add east connection to Route 4:
```json
{"direction": "east", "target_map_id": "route_4", "entry_x": 0, "entry_y": 10}
```

---

### B3: Cerulean City Map Data

**Files to modify:**
- `backend/data/maps.json` — Add `cerulean_city`, `cerulean_pokemon_center`, `cerulean_pokemart`, `cerulean_gym`, and `bike_shop` maps
- `backend/data/shops.json` — Add Cerulean Poke Mart inventory (if not already defined)

**Maps to add:**

```json
{
  "id": "cerulean_city",
  "name": "cerulean_city",
  "display_name": "Cerulean City",
  "map_type": "town",
  "width": 25,
  "height": 25,
  "connections": [
    {"direction": "west", "target_map_id": "route_4", "entry_x": 29, "entry_y": 10}
  ],
  "npcs": [
    {"npc_id": "cerulean_townsfolk_1", "x": 8, "y": 12, "facing": "down"},
    {"npc_id": "cerulean_townsfolk_2", "x": 15, "y": 8, "facing": "left"},
    {"npc_id": "cerulean_townsfolk_3", "x": 20, "y": 15, "facing": "up"},
    {"npc_id": "bike_shop_owner", "x": 5, "y": 5, "facing": "down"},
    {"npc_id": "cerulean_officer", "x": 12, "y": 20, "facing": "right"}
  ],
  "trainers": [],
  "encounter_zones": [
    {"x": 18, "y": 18, "width": 5, "height": 5, "encounter_table_id": "cerulean_city_surfing"}
  ],
  "buildings": [
    {"name": "Pokemon Center", "x": 3, "y": 8, "width": 5, "height": 4, "door_x": 5, "door_y": 12, "interior_map_id": "cerulean_pokemon_center"},
    {"name": "Poke Mart", "x": 10, "y": 3, "width": 4, "height": 4, "door_x": 12, "door_y": 7, "interior_map_id": "cerulean_pokemart"},
    {"name": "Cerulean Gym", "x": 15, "y": 3, "width": 6, "height": 5, "door_x": 17, "door_y": 8, "interior_map_id": "cerulean_gym"},
    {"name": "Bike Shop", "x": 3, "y": 3, "width": 4, "height": 4, "door_x": 5, "door_y": 7, "interior_map_id": "bike_shop"}
  ]
},
{
  "id": "cerulean_pokemon_center",
  "name": "cerulean_pokemon_center",
  "display_name": "Cerulean City Pokemon Center",
  "map_type": "interior",
  "width": 10,
  "height": 8,
  "connections": [],
  "npcs": [{"npc_id": "nurse_joy", "x": 5, "y": 2, "facing": "down"}],
  "trainers": [],
  "encounter_zones": [],
  "buildings": []
},
{
  "id": "cerulean_pokemart",
  "name": "cerulean_pokemart",
  "display_name": "Cerulean City Poke Mart",
  "map_type": "interior",
  "width": 8,
  "height": 8,
  "connections": [],
  "npcs": [{"npc_id": "shop_clerk", "x": 4, "y": 2, "facing": "down"}],
  "trainers": [],
  "encounter_zones": [],
  "buildings": []
},
{
  "id": "cerulean_gym",
  "name": "cerulean_gym",
  "display_name": "Cerulean City Gym",
  "map_type": "gym",
  "width": 12,
  "height": 12,
  "connections": [],
  "npcs": [],
  "trainers": [
    {"trainer_id": "cerulean_gym_trainer_1", "x": 4, "y": 6, "facing": "right", "sight_range": 3},
    {"trainer_id": "cerulean_gym_trainer_2", "x": 8, "y": 6, "facing": "left", "sight_range": 3}
  ],
  "encounter_zones": [],
  "buildings": []
},
{
  "id": "bike_shop",
  "name": "bike_shop",
  "display_name": "Cerulean Bike Shop",
  "map_type": "interior",
  "width": 8,
  "height": 6,
  "connections": [],
  "npcs": [{"npc_id": "bike_shop_owner", "x": 4, "y": 2, "facing": "down"}],
  "trainers": [],
  "encounter_zones": [],
  "buildings": []
}
```

---

### B4: New Trainer Definitions

**Files to modify:**
- `backend/data/trainers.json` — Add 8+ new trainers

**New trainers:**

| ID | Name | Class | Location | Team |
|----|------|-------|----------|------|
| `lass_crissy` | Crissy | Lass | Route 4 | Oddish L12, Jigglypuff L12 |
| `youngster_timmy` | Timmy | Youngster | Route 4 | Rattata L11, Ekans L13 |
| `hiker_marcos` | Marcos | Hiker | Route 4 | Geodude L13, Geodude L13, Onix L11 |
| `bug_catcher_kent` | Kent | Bug Catcher | Mt. Moon | Paras L10, Paras L12 |
| `super_nerd_jovan` | Jovan | Super Nerd | Mt. Moon | Voltorb L11, Magnemite L13 |
| `cerulean_gym_trainer_1` | Diana | Swimmer | Cerulean Gym | Horsea L16, Shellder L16 |
| `cerulean_gym_trainer_2` | Luis | Swimmer | Cerulean Gym | Goldeen L17, Horsea L17 |
| `hiker_lenny` | Lenny | Hiker | Route 3 | Geodude L10, Onix L10 |

**Note:** `super_nerd_jovan` requires adding Voltorb (ID 100) and Magnemite (ID 81) to the species list. If scope is too large, substitute with existing species (e.g., Zubat, Paras). Keep species additions to B1.

**Alternative for Mt. Moon trainers (avoids new species):**
| `super_nerd_jovan` | Jovan | Super Nerd | Mt. Moon | Zubat L12, Clefairy L14 |

---

### B5: Cerulean Gym Wiring

**Files to modify:**
- `backend/data/gyms.json` — Verify `cerulean_gym` entry has correct `map_id` matching the new map
- `backend/data/trainers.json` — Ensure gym trainers reference correct species
- `backend/services/gym_service.py` — Verify gym lookup works with new `cerulean_gym` map ID

**Verification tasks:**
- The gym data in `gyms.json` already defines Misty with Staryu L18 + Starmie L21 and badge `cascade_badge`
- Confirm `gym_id` field matches the map `id` in `maps.json` (should be `cerulean_gym`)
- Confirm the gym service's `get_gym()` and `challenge_gym()` functions work with the new gym
- Add `badge_requirement` if needed (Boulder Badge required to challenge Misty — matches original games)
- Add gym trainer prerequisite: player must beat both gym trainers before challenging Misty

**Potential model change** (`backend/data/gyms.json`):
- Add `"prerequisite_badge": "boulder_badge"` to cerulean gym entry
- Add `"gym_trainers": ["cerulean_gym_trainer_1", "cerulean_gym_trainer_2"]` if not already structured

---

### B6: Mt. Moon Exit Connection

**Files to modify:**
- `backend/data/maps.json` — Add east connection from `mt_moon_entrance` to `route_4`

**Changes:**
- `mt_moon_entrance.connections` gets: `{"direction": "east", "target_map_id": "route_4", "entry_x": 0, "entry_y": 10}`
- Verify the map service handles cave→route transitions correctly (player exits cave darkness)
- If Mt. Moon B1 needs an exit ladder, add a `ladder` object pointing back to `mt_moon_entrance` or directly to Route 4

---

### B7: Cerulean City NPC Dialogues

**Files to modify:**
- `backend/data/npcs.json` — Add 5 new NPC definitions
- `backend/data/dialogues.json` — Add dialogue entries for each NPC

**New NPCs:**

| NPC ID | Name | Location | Dialogue Theme |
|--------|------|----------|----------------|
| `cerulean_townsfolk_1` | Swimmer | Cerulean City | Mentions water routes north of city |
| `cerulean_townsfolk_2` | Lass | Cerulean City | Talks about Misty's strength |
| `cerulean_townsfolk_3` | Youngster | Cerulean City | Hints about Nugget Bridge (future sprint) |
| `bike_shop_owner` | Bike Shop Owner | Bike Shop interior | Bike costs 1,000,000 — need Bike Voucher |
| `cerulean_officer` | Officer Jenny | Cerulean City | Reports of robberies (Team Rocket hint) |
| `shop_clerk` | Shop Clerk | Poke Mart interior | Standard shop greeting |

**Dialogue examples:**
```json
{
  "npc_id": "cerulean_townsfolk_2",
  "dialogues": [
    {"text": "Misty is so tough! Her Starmie's Rapid Spin is devastating!"},
    {"text": "You'll need some Grass or Electric types to beat her."}
  ]
}
```

---

## Frontend Tasks (frontend-dev)

### F1: Route 4 Map Rendering & Trainers

**Files to modify:**
- `frontend/js/routes.js` — Add Route 4 tile layout (grass patches, ledges, path)
- `frontend/js/map.js` — Add Route 4 collision data
- `frontend/js/sprites.js` — Add any new terrain sprites (if needed)
- `frontend/js/api.js` — Verify map transition API calls work for Route 4

**Implementation:**
- `renderRoute4(ctx, tileSize)` — Draw Route 4: grass patches, dirt path, ledges, fence borders
- Grass encounter zones at correct coordinates matching backend data
- 3 trainer sight lines rendering (existing trainer encounter system should work)
- Map transitions: west → Mt. Moon, east → Cerulean City
- Ledge tiles (existing `ledges.js` system) — south-facing ledges for shortcut back

**Integration Checklist (F1):**
- [ ] `GET /api/map/route_4` returns 200 with map data
- [ ] `POST /api/map/transition` from Mt. Moon east returns Route 4
- [ ] `POST /api/map/transition` from Route 4 east returns Cerulean City
- [ ] `POST /api/encounter/check` triggers encounters in Route 4 grass zones
- [ ] Trainer encounters trigger when walking into sight range
- [ ] Ledge jumping works (can jump south, can't climb north)
- [ ] No 404s in Network tab during Route 4 exploration

---

### F2: Cerulean City Rendering & NPCs

**Files to modify:**
- `frontend/js/routes.js` — Add Cerulean City tile layout
- `frontend/js/map.js` — Add Cerulean City collision data, building doors
- `frontend/js/npc.js` — Register new NPC positions and dialogue triggers
- `frontend/js/sprites.js` — Add Cerulean City building sprites (gym has water-themed roof, blue accents)
- `frontend/js/signs.js` — Add city signs ("Welcome to Cerulean City — A Mysterious, Blue Aura Surrounds It")
- `frontend/js/api.js` — Verify NPC dialogue API calls

**Implementation:**
- `renderCeruleanCity(ctx, tileSize)` — Draw: water-themed buildings, blue roof gym, Pokemon Center (red roof), Poke Mart (blue roof), Bike Shop, paths, trees, water pond in southeast
- Building door interactions → interior map transitions
- NPC walk-up interaction → dialogue display
- Surfable water zone in southeast corner (Sprint 10 Surf system)
- City sign at entrance

**Interior maps:**
- `renderCeruleanPokemonCenter(ctx)` — Standard Pokemon Center layout (counter, healing machine, PC)
- `renderCeruleanPokemart(ctx)` — Standard Poke Mart layout (counter, shelves)
- `renderBikeShop(ctx)` — Small shop with bike display, owner NPC

**Integration Checklist (F2):**
- [ ] `GET /api/map/cerulean_city` returns 200 with full map data
- [ ] `POST /api/map/building/enter` works for all 4 Cerulean buildings
- [ ] `GET /api/npc/{npc_id}` returns 200 for all 5 new NPCs
- [ ] `GET /api/npc/{npc_id}/dialogue` returns 200 with dialogue text
- [ ] Pokemon Center healing works in Cerulean
- [ ] Poke Mart shop works in Cerulean
- [ ] Surf zones on Cerulean City water work (if Sprint 10 Surf is wired)
- [ ] City sign displays on interaction
- [ ] No 404s in Network tab during Cerulean City exploration

---

### F3: Cerulean Gym UI & Misty Battle

**Files to modify:**
- `frontend/js/gym.js` — Add Cerulean Gym layout and battle flow
- `frontend/js/sprites.js` — Add Misty sprite (blue-themed leader), gym trainer sprites, water pool tiles
- `frontend/js/game.js` — Gym state transitions for Cerulean Gym (use existing gym state machine)
- `frontend/js/badges.js` — Add Cascade Badge display sprite

**Implementation:**
- `renderCeruleanGym(ctx, tileSize)` — Water-themed gym interior: water pool in center, walkways around edges, 2 gym trainers guarding path, Misty at back
- Gym trainer battles trigger on walk-up (existing trainer encounter system)
- After defeating both trainers, path to Misty opens
- Misty battle uses existing gym battle flow
- Cascade Badge awarded on victory — add to badge display
- Misty post-battle dialogue: "You're a great trainer! Take this Cascade Badge and TM11 - Bubblebeam!"

**Badge sprite (`badges.js`):**
- `drawCascadeBadge(ctx, x, y)` — Teardrop shape, blue fill, light blue highlight

**game.js changes:**
- Minimal: Cerulean Gym should work through existing `'gym'` state
- May need to add gym-specific rendering switch in gym state handler
- **WARNING:** Coordinate with F1/F2 if they also touch game.js — same merge conflict risk as Sprint 10

**Integration Checklist (F3):**
- [ ] `GET /api/gym/cerulean_gym` returns 200 with gym data including Misty's team
- [ ] `POST /api/gym/challenge` for cerulean_gym returns 200
- [ ] `POST /api/battle/action` works during gym battle (all battle actions)
- [ ] Badge awarded on victory: `POST /api/gym/award-badge` returns 200
- [ ] Cascade Badge appears in player badge display
- [ ] Gym trainers must be defeated before reaching Misty
- [ ] Misty's team matches gyms.json data (Staryu L18, Starmie L21)
- [ ] No 404s in Network tab during gym interaction

---

### F4: New Pokemon Sprites

**Files to modify:**
- `frontend/js/sprites.js` — Add programmatic pixel sprites for 12+ new Pokemon

**New sprites to draw (all 16x16 programmatic pixel art):**

| Species ID | Name | Key Visual Features |
|------------|------|-------------------|
| 23 | Ekans | Purple snake, coiled body, yellow rattle |
| 24 | Arbok | Larger purple cobra, hood pattern |
| 29 | Nidoran-F | Small blue quadruped, spots, horn |
| 30 | Nidorina | Larger blue, spines, darker spots |
| 32 | Nidoran-M | Small purple quadruped, large ears, horn |
| 33 | Nidorino | Larger purple, bigger horn, spines |
| 39 | Jigglypuff | Round pink circle, tuft, big eyes |
| 40 | Wigglytuff | Taller pink, rabbit ears, big eyes |
| 43 | Oddish | Blue body, green leaves on top |
| 44 | Gloom | Larger blue, droopy flower, drool |
| 63 | Abra | Yellow, seated pose, fox-like |
| 64 | Kadabra | Yellow/brown, spoon, mustache |

**Approach:** Follow existing sprite pattern — each sprite is a `drawSpeciesXX(ctx, x, y)` function using `ctx.fillRect()` calls for pixel art.

**Integration Checklist (F4):**
- [ ] Each new species renders correctly in battle screen
- [ ] Each new species renders correctly in Pokedex
- [ ] Each new species renders correctly in party menu
- [ ] Sprites don't overflow 16x16 tile bounds
- [ ] Colors match Gen 1 palette conventions

---

## Backend QA Tasks (QA-A)

### QA-A1: Route 4 & Map Transition Tests

**File to create:** `backend/tests/test_route4_cerulean.py`

**Test cases (minimum 15):**
1. `test_route_4_map_exists` — Route 4 loads from maps.json
2. `test_route_4_connections` — West→Mt. Moon, East→Cerulean verified
3. `test_cerulean_city_map_exists` — Cerulean City loads correctly
4. `test_cerulean_buildings_count` — 4 buildings defined (PokeCntr, Mart, Gym, Bike Shop)
5. `test_cerulean_interior_maps_exist` — All 4 interior maps load
6. `test_mt_moon_east_exit` — Mt. Moon has east connection to Route 4
7. `test_map_transition_mt_moon_to_route4` — Transition endpoint returns correct data
8. `test_map_transition_route4_to_cerulean` — Transition endpoint returns correct data
9. `test_route_4_encounter_table_exists` — route_4 encounter table is defined
10. `test_route_4_encounter_species` — Correct species in encounter table
11. `test_route_4_encounter_levels` — Level range 8-14
12. `test_cerulean_surfing_encounter_table` — Surfing encounters defined
13. `test_route_4_trainers_count` — 3 trainers on Route 4
14. `test_cerulean_npcs_count` — 5+ NPCs in Cerulean City
15. `test_building_enter_cerulean_gym` — Can enter gym via door coords

### QA-A2: Trainer & Species Tests

**File to create:** `backend/tests/test_sprint11_trainers_species.py`

**Test cases (minimum 15):**
1. `test_new_species_count` — At least 12 new species added
2. `test_ekans_species_data` — Ekans has correct types, stats, learnset
3. `test_nidoran_f_species_data` — Nidoran-F correct
4. `test_oddish_species_data` — Oddish has Grass/Poison types
5. `test_abra_species_data` — Abra correct (high speed stat for flee mechanic)
6. `test_jigglypuff_species_data` — Jigglypuff correct
7. `test_new_trainers_count` — At least 8 new trainers
8. `test_route_4_trainer_teams` — All Route 4 trainers have valid teams with existing species
9. `test_cerulean_gym_trainers` — 2 gym trainers with valid water-type teams
10. `test_trainer_levels_progression` — Route 4 trainers L11-14 (between Route 3 and Cerulean Gym)
11. `test_generate_wild_ekans` — Can generate wild Ekans with proper stats
12. `test_generate_wild_oddish` — Can generate wild Oddish
13. `test_generate_wild_abra` — Can generate wild Abra
14. `test_evolution_chains` — Ekans→Arbok, Oddish→Gloom, etc. evolvable
15. `test_npc_dialogue_exists` — All new NPCs have dialogue entries

### QA-A3: Cerulean Gym Tests

**File to create:** `backend/tests/test_cerulean_gym.py`

**Test cases (minimum 10):**
1. `test_cerulean_gym_exists` — Gym data loads correctly
2. `test_misty_team` — Staryu L18 + Starmie L21
3. `test_cascade_badge_name` — Badge is "Cascade Badge"
4. `test_cerulean_gym_map_matches` — Gym map_id matches maps.json
5. `test_challenge_cerulean_gym` — Challenge endpoint works
6. `test_gym_requires_boulder_badge` — Cannot challenge without Boulder Badge (if implemented)
7. `test_gym_trainers_in_map` — 2 trainers on gym map at correct positions
8. `test_award_cascade_badge` — Badge awarded after victory
9. `test_cascade_badge_in_game_state` — Badge appears in game state after award
10. `test_misty_reward_tm` — TM reward given after victory (if applicable)

---

## Frontend QA Tasks (QA-B)

### QA-B1: Route 4 & Map Transitions Frontend Review

**Scope:** Review changes to `routes.js`, `map.js`, `api.js`

**Checklist:**
1. Verify `api.js` has map transition calls for Route 4 ↔ Mt. Moon and Route 4 ↔ Cerulean
2. Check each API call has proper error handling (not `.catch(() => {})`)
3. Verify trainer sight range rendering matches backend data
4. Check encounter zones are at correct coordinates
5. Verify ledge mechanics work on Route 4
6. Open browser Network tab → traverse Route 4 → confirm no 404s
7. Verify map scroll/camera follows player correctly on the 30x20 map

### QA-B2: Cerulean City Frontend Review

**Scope:** Review changes to `routes.js`, `map.js`, `npc.js`, `signs.js`, `sprites.js`, `api.js`

**Checklist:**
1. Verify all building doors lead to correct interior maps
2. Check NPC dialogue triggers work for all 5 NPCs
3. Verify Pokemon Center healing flow works in Cerulean
4. Verify Poke Mart shop flow works in Cerulean
5. Check Bike Shop owner dialogue mentions Bike Voucher
6. Verify city sign text displays correctly
7. Check water zone renders correctly and Surf works (if Sprint 10 is wired)
8. Open browser Network tab → explore Cerulean → confirm no 404s
9. Verify building exit returns player to correct overworld position

### QA-B3: Cerulean Gym Frontend Review

**Scope:** Review changes to `gym.js`, `sprites.js`, `badges.js`, `game.js`

**Checklist:**
1. Verify gym interior renders with water theme
2. Check gym trainers trigger battle on sight
3. Verify path to Misty blocked until trainers defeated
4. Check Misty battle uses correct team from backend
5. Verify Cascade Badge sprite renders correctly in badge display
6. Check post-victory dialogue displays
7. Verify gym state transitions don't break existing Pewter Gym flow
8. Open browser Network tab → full gym run → confirm no 404s
9. Check game.js changes don't conflict with other state handlers

---

## Risk Mitigation

### 1. game.js Merge Conflicts (HIGH RISK — recurring)
**Problem:** F1, F2, F3 may touch game.js for map rendering and gym state.
**Mitigation:**
- F3 (gym) is the main game.js touch point — uses existing `'gym'` state, minimal new code
- F1 and F2 should NOT add new game states — Route 4 and Cerulean use existing `'overworld'` state
- Merge order: F4 (sprites only) → F1 (Route 4) → F2 (Cerulean) → F3 (Gym)
- Each PR rebases on main before merge

### 2. Frontend Integration Gap (HIGH RISK — recurring)
**Problem:** Frontend builds UI without wiring API calls.
**Mitigation:**
- Every frontend task has an explicit Integration Checklist (see above)
- QA-B must verify zero 404s in Network tab for each feature
- Code review rejects any `.catch(() => {})`

### 3. Species Data Consistency (MEDIUM)
**Problem:** New species need correct stats, learnsets, types, evolution data, and abilities — any mismatch causes battle crashes.
**Mitigation:**
- Backend-dev should reference Bulbapedia for accurate Gen 1 data
- QA-A tests verify each species can be generated as wild Pokemon with valid stats
- Test that all trainer team species actually exist in `pokemon_species.json`

### 4. Frontend Finishes Faster (MEDIUM — recurring)
**Problem:** Frontend-dev finishes 30-50% faster.
**Mitigation:**
- F4 (sprites) has no backend dependency — frontend-dev starts here
- F1 (Route 4) is simpler than F2/F3 — natural first task
- If frontend finishes early: prepare sprite shells for Sprint 12 Pokemon or polish existing UI

### 5. Gym Data Mismatch (LOW)
**Problem:** Misty's gym data already exists in gyms.json but the map didn't exist until now — potential field name mismatches.
**Mitigation:**
- B5 is a dedicated verification task — check all fields align
- QA-A3 has specific tests for gym-map linkage

---

## File Ownership Summary (Conflict Prevention)

| File | Owner | Notes |
|------|-------|-------|
| `backend/data/pokemon_species.json` | backend-dev | Modify (add 12+ species) |
| `backend/data/moves.json` | backend-dev | Modify (add moves for new species) |
| `backend/data/encounter_tables.json` | backend-dev | Modify (add route_4, cerulean encounters) |
| `backend/data/maps.json` | backend-dev | Modify (add 6 maps, update mt_moon) |
| `backend/data/trainers.json` | backend-dev | Modify (add 8+ trainers) |
| `backend/data/npcs.json` | backend-dev | Modify (add 6 NPCs) |
| `backend/data/dialogues.json` | backend-dev | Modify (add NPC dialogues) |
| `backend/data/gyms.json` | backend-dev | Modify (verify cerulean gym entry) |
| `backend/data/shops.json` | backend-dev | Modify (add cerulean mart inventory) |
| `frontend/js/routes.js` | frontend-dev | Modify (Route 4 + Cerulean rendering) |
| `frontend/js/map.js` | frontend-dev | Modify (collision data) |
| `frontend/js/npc.js` | frontend-dev | Modify (new NPC registrations) |
| `frontend/js/sprites.js` | frontend-dev | Modify (12+ new Pokemon + Misty + badges) |
| `frontend/js/gym.js` | frontend-dev | Modify (Cerulean Gym layout) |
| `frontend/js/badges.js` | frontend-dev | Modify (Cascade Badge sprite) |
| `frontend/js/signs.js` | frontend-dev | Modify (Cerulean City sign) |
| `frontend/js/api.js` | frontend-dev | Modify (verify API calls) |
| `frontend/js/game.js` | frontend-dev | Modify (MINIMAL — gym rendering switch only) |
| `backend/tests/test_route4_cerulean.py` | QA-A | New file |
| `backend/tests/test_sprint11_trainers_species.py` | QA-A | New file |
| `backend/tests/test_cerulean_gym.py` | QA-A | New file |

---

## Definition of Done

- [ ] All 5 sprint goals met
- [ ] Player can walk from Pewter City → Route 3 → Mt. Moon → Route 4 → Cerulean City
- [ ] Misty's gym is fully playable with Cascade Badge award
- [ ] 12+ new Pokemon species usable in wild encounters and trainer battles
- [ ] All integration checklists pass (zero 404s)
- [ ] 40+ new tests passing
- [ ] Total test count >= 1,450 (1,410 + 40)
- [ ] All PRs merged to `main` without regressions
- [ ] Full test suite passes: `cd backend && python3 -m pytest`

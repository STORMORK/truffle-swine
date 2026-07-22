# Sprint 12 Plan — Nugget Bridge, Bill's House, Team Rocket & Southward Expansion

> **Theme:** Nugget Bridge Gauntlet, Bill's House Event, Team Rocket Introduction, Route 5 & Underground Path toward Vermilion
> **Sprint Start:** TBD (immediately after Sprint 11 completion)
> **Baseline (projected post-Sprint 11):** ~1,450 tests, 22 maps, 54+ Pokemon species, 13+ trainers, 2 playable gyms, 48 frontend JS modules, 24 backend routers

---

## Why This Sprint

After Sprint 11, the player arrives in Cerulean City with 2 badges but has nothing to do except the gym. In the original Gen 1 games, Cerulean City is a major hub:
- **North:** Nugget Bridge (Route 24) → Route 25 → Bill's House — a gauntlet of 5 trainers + a Team Rocket grunt, ending with Bill's transformation event and the S.S. Ticket reward
- **South:** Route 5 → Underground Path → Route 6 → Vermilion City (Sprint 13)

This sprint fills out Cerulean City's surrounding content and introduces Team Rocket as a recurring antagonist. It also fixes a critical gap: the item system has no `give_item()` function, which is needed for story rewards.

**Current world graph (post-Sprint 11):**
```
Pallet Town ↔ Route 1 ↔ Viridian City ↔ Route 2 ↔ Pewter City ↔ Route 3 ↔ Mt. Moon ↔ Route 4 ↔ Cerulean City (dead end)
```

**After this sprint:**
```
                                                    Route 24 (Nugget Bridge) ↔ Route 25 ↔ Bill's House
                                                    ↑
Pallet Town ↔ Route 1 ↔ Viridian City ↔ Route 2 ↔ Pewter City ↔ Route 3 ↔ Mt. Moon ↔ Route 4 ↔ Cerulean City
                                                                                                    ↓
                                                                                                Route 5 ↔ Underground Path ↔ Route 6 (dead end — Vermilion in Sprint 13)
```

---

## Sprint Goals

1. **Nugget Bridge (Route 24)** — A linear bridge map with 5 consecutive trainer battles + a Team Rocket grunt at the end who offers the player to join Team Rocket (player refuses). Nugget item reward after clearing all 5 trainers.
2. **Bill's House & Transformation Event** — Route 25 leads to Bill's seaside cottage. Bill is stuck as a Pokemon — the player helps him transform back. Reward: S.S. Ticket (key item for future S.S. Anne sprint).
3. **Team Rocket Introduction** — First Team Rocket grunt battle. Cerulean City burgled house event (NPC dialogue + Officer Jenny). Establishes Team Rocket as recurring villains with a new `rocket_grunt` trainer class.
4. **Route 5 & Underground Path** — Southern exit from Cerulean toward Vermilion City. Route 5 with trainers, Underground Path (interior corridor), Route 6 stub (dead end at Vermilion gate — completed in Sprint 13).
5. **Item System Improvements** — Add `give_item()` function for story rewards, key item protection (can't toss/sell), new items (S.S. Ticket, Nugget).

---

## Task Dependencies (Build Order)

```
Phase 1 (Backend Foundation — parallel):
  B1: Item system improvements (give_item, key item protection) ──┐
  B2: Team Rocket trainer data & grunt class ─────────────────────┤── Can be parallel
  B3: Nugget Bridge (Route 24) map + trainer data ────────────────┤
  B4: Route 25 + Bill's House map data ───────────────────────────┤
  B5: Route 5, Underground Path, Route 6 map data ───────────────┘

Phase 2 (Backend Logic — depends on Phase 1):
  B6: Nugget Bridge gauntlet service — sequential trainer battles, Nugget reward (depends on B1, B3)
  B7: Bill's House event service — transformation cutscene, S.S. Ticket reward (depends on B1, B4)
  B8: Cerulean burgled house event — quest + dialogue (depends on B2)
  B9: New quest definitions — nugget_bridge, bill_rescue, rocket_cerulean (depends on B6, B7, B8)

Phase 3 (Frontend — after corresponding backend):
  F1: Nugget Bridge rendering + gauntlet UI (depends on B6)
  F2: Bill's House rendering + transformation cutscene (depends on B7)
  F3: Route 5, Underground Path, Route 6 rendering (depends on B5)
  F4: Team Rocket sprites + Cerulean event UI (depends on B2, B8)

Phase 4 (QA):
  QA-A: Backend tests for gauntlet, events, item system, quests
  QA-B: Frontend integration tests, cutscene flow, API wiring
```

**Critical Path:** B1 → B6 → F1 (item system fix blocks Nugget reward, which blocks the gauntlet UI)

---

## Backend Tasks (backend-dev)

### B1: Item System Improvements

**Files to modify:**
- `backend/data/items.json` — Add S.S. Ticket, Nugget
- `backend/services/item_service.py` — Add `give_item()`, protect key items in `toss_item()` and `sell_item()`
- `backend/routes/items.py` — Add `POST /api/inventory/give` endpoint

**New items in `items.json`:**
```json
{
  "id": 51,
  "name": "Nugget",
  "description": "A nugget of pure gold. Can be sold at a high price.",
  "category": "treasure",
  "price": 0,
  "sell_price": 5000,
  "effect": null,
  "usable": false
},
{
  "id": 52,
  "name": "S.S. Ticket",
  "description": "A ticket for the S.S. Anne luxury liner.",
  "category": "key_item",
  "price": 0,
  "sell_price": 0,
  "effect": null,
  "usable": false
}
```

**New service functions:**
- `give_item(game_id, item_id, quantity=1)` — Add item to player inventory without purchase. Validates item exists, returns updated inventory.
- Modify `toss_item()` — Add check: `if item.category == "key_item": raise ValueError("Key items cannot be discarded")`
- Modify `sell_item()` — Add check: `if item.category == "key_item": raise ValueError("Key items cannot be sold")`

**New endpoint:**
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/inventory/give` | Grant item to player (for story events) |

**Request model:**
```python
class GiveItemRequest(BaseModel):
    game_id: str
    item_id: int
    quantity: int = 1
```

---

### B2: Team Rocket Trainer Data

**Files to modify:**
- `backend/data/trainers.json` — Add Team Rocket grunt trainers
- `backend/data/npcs.json` — Add Team Rocket-related NPCs
- `backend/data/dialogues.json` — Add Rocket grunt dialogue (pre/post battle)

**New trainers:**

| ID | Name | Class | Location | Team |
|----|------|-------|----------|------|
| `rocket_grunt_nugget` | Rocket Grunt | Team Rocket | Route 24 (end of bridge) | Ekans L15, Zubat L15 |
| `rocket_grunt_cerulean` | Rocket Grunt | Team Rocket | Cerulean City (burgled house) | Rattata L14, Ekans L14 |

**Pre-battle dialogue (rocket_grunt_nugget):**
```
"Hey kid, you've got some skill! How about joining Team Rocket? We're always looking for talented trainers!"
[Player refuses]
"No?! Then I'll make you regret it!"
```

**Post-battle dialogue:**
```
"Grr... You'll regret crossing Team Rocket! We'll remember this!"
```

**New NPCs:**

| NPC ID | Name | Location | Dialogue |
|--------|------|----------|----------|
| `burgled_house_owner` | Cerulean Resident | Cerulean City (house interior) | "A Team Rocket thug broke into my house and stole my TM! Please help!" |
| `cerulean_officer_updated` | Officer Jenny | Cerulean City | Updated dialogue about the robbery, points player north toward Route 24 |

---

### B3: Nugget Bridge (Route 24) Map & Trainer Data

**Files to modify:**
- `backend/data/maps.json` — Add `route_24` map
- `backend/data/trainers.json` — Add 5 Nugget Bridge trainers
- `backend/data/encounter_tables.json` — Add Route 24 grass encounters

**Map definition:**
```json
{
  "id": "route_24",
  "name": "route_24",
  "display_name": "Route 24 - Nugget Bridge",
  "map_type": "route",
  "width": 10,
  "height": 40,
  "connections": [
    {"direction": "south", "target_map_id": "cerulean_city", "entry_x": 12, "entry_y": 0},
    {"direction": "north", "target_map_id": "route_25", "entry_x": 5, "entry_y": 19}
  ],
  "npcs": [
    {"npc_id": "nugget_bridge_greeter", "x": 5, "y": 38, "facing": "down"}
  ],
  "trainers": [
    {"trainer_id": "nugget_trainer_1", "x": 5, "y": 32, "facing": "down", "sight_range": 2},
    {"trainer_id": "nugget_trainer_2", "x": 5, "y": 27, "facing": "down", "sight_range": 2},
    {"trainer_id": "nugget_trainer_3", "x": 5, "y": 22, "facing": "down", "sight_range": 2},
    {"trainer_id": "nugget_trainer_4", "x": 5, "y": 17, "facing": "down", "sight_range": 2},
    {"trainer_id": "nugget_trainer_5", "x": 5, "y": 12, "facing": "down", "sight_range": 2},
    {"trainer_id": "rocket_grunt_nugget", "x": 5, "y": 5, "facing": "down", "sight_range": 3}
  ],
  "encounter_zones": [
    {"x": 0, "y": 0, "width": 4, "height": 10, "encounter_table_id": "route_24"}
  ],
  "buildings": []
}
```

**Also modify `cerulean_city`** — Add north connection: `{"direction": "north", "target_map_id": "route_24", "entry_x": 5, "entry_y": 39}`

**5 Nugget Bridge trainers:**

| ID | Name | Class | Team |
|----|------|-------|------|
| `nugget_trainer_1` | Ethan | Bug Catcher | Caterpie L14, Weedle L14 |
| `nugget_trainer_2` | Ali | Lass | Oddish L16, Pidgey L16 |
| `nugget_trainer_3` | Calvin | Youngster | Rattata L15, Ekans L15, Nidoran-M L15 |
| `nugget_trainer_4` | Shannon | Lass | Nidoran-F L16, Jigglypuff L16 |
| `nugget_trainer_5` | Hiker Josh | Hiker | Geodude L15, Geodude L15, Onix L13 |

**Encounter table:**
```json
"route_24": {
  "encounter_type": "grass",
  "base_encounter_rate": 0.15,
  "encounters": [
    {"species_id": 43, "min_level": 12, "max_level": 14, "weight": 25},
    {"species_id": 63, "min_level": 8, "max_level": 12, "weight": 15},
    {"species_id": 29, "min_level": 12, "max_level": 14, "weight": 20},
    {"species_id": 32, "min_level": 12, "max_level": 14, "weight": 20},
    {"species_id": 23, "min_level": 12, "max_level": 14, "weight": 15},
    {"species_id": 6, "min_level": 12, "max_level": 16, "weight": 5}
  ]
}
```

---

### B4: Route 25 + Bill's House Map Data

**Files to modify:**
- `backend/data/maps.json` — Add `route_25` and `bills_house` maps
- `backend/data/encounter_tables.json` — Add Route 25 encounters
- `backend/data/npcs.json` — Add Bill NPC
- `backend/data/dialogues.json` — Add Bill dialogue tree

**Maps:**
```json
{
  "id": "route_25",
  "name": "route_25",
  "display_name": "Route 25",
  "map_type": "route",
  "width": 30,
  "height": 20,
  "connections": [
    {"direction": "south", "target_map_id": "route_24", "entry_x": 5, "entry_y": 0}
  ],
  "npcs": [],
  "trainers": [
    {"trainer_id": "route25_hiker_1", "x": 10, "y": 10, "facing": "left", "sight_range": 3},
    {"trainer_id": "route25_lass_1", "x": 20, "y": 8, "facing": "down", "sight_range": 3}
  ],
  "encounter_zones": [
    {"x": 3, "y": 3, "width": 10, "height": 6, "encounter_table_id": "route_25"},
    {"x": 15, "y": 10, "width": 8, "height": 5, "encounter_table_id": "route_25"}
  ],
  "buildings": [
    {"name": "Bill's House", "x": 26, "y": 3, "width": 4, "height": 4, "door_x": 27, "door_y": 7, "interior_map_id": "bills_house"}
  ]
},
{
  "id": "bills_house",
  "name": "bills_house",
  "display_name": "Bill's House",
  "map_type": "interior",
  "width": 8,
  "height": 8,
  "connections": [],
  "npcs": [
    {"npc_id": "bill", "x": 4, "y": 3, "facing": "down"}
  ],
  "trainers": [],
  "encounter_zones": [],
  "buildings": []
}
```

**Route 25 trainers:**

| ID | Name | Class | Team |
|----|------|-------|------|
| `route25_hiker_1` | Wayne | Hiker | Geodude L15, Onix L15 |
| `route25_lass_1` | Haley | Lass | Oddish L17, Pidgey L17 |

**Bill NPC dialogue tree:** Branching dialogue with two phases:
1. **Pre-transformation:** "Help! I'm stuck as a Pokemon! Please operate the Cell Separation System on my PC!" → Player interacts with PC → Bill transforms back
2. **Post-transformation:** "Thank you so much! Here, take this S.S. Ticket as thanks. It's for the luxury liner in Vermilion City!"

**Encounter table:**
```json
"route_25": {
  "encounter_type": "grass",
  "base_encounter_rate": 0.15,
  "encounters": [
    {"species_id": 43, "min_level": 12, "max_level": 16, "weight": 25},
    {"species_id": 63, "min_level": 10, "max_level": 14, "weight": 15},
    {"species_id": 29, "min_level": 12, "max_level": 16, "weight": 20},
    {"species_id": 32, "min_level": 12, "max_level": 16, "weight": 20},
    {"species_id": 17, "min_level": 14, "max_level": 16, "weight": 10},
    {"species_id": 39, "min_level": 12, "max_level": 14, "weight": 10}
  ]
}
```

---

### B5: Route 5, Underground Path & Route 6 Map Data

**Files to modify:**
- `backend/data/maps.json` — Add `route_5`, `underground_path_ns`, `route_6` maps
- `backend/data/encounter_tables.json` — Add Route 5/6 encounters
- `backend/data/trainers.json` — Add Route 5/6 trainers

**Maps:**
```json
{
  "id": "route_5",
  "name": "route_5",
  "display_name": "Route 5",
  "map_type": "route",
  "width": 20,
  "height": 25,
  "connections": [
    {"direction": "north", "target_map_id": "cerulean_city", "entry_x": 12, "entry_y": 24}
  ],
  "npcs": [],
  "trainers": [],
  "encounter_zones": [
    {"x": 5, "y": 5, "width": 8, "height": 8, "encounter_table_id": "route_5"}
  ],
  "buildings": [
    {"name": "Underground Entrance North", "x": 10, "y": 22, "width": 3, "height": 3, "door_x": 11, "door_y": 25, "interior_map_id": "underground_path_ns"}
  ]
},
{
  "id": "underground_path_ns",
  "name": "underground_path_ns",
  "display_name": "Underground Path",
  "map_type": "interior",
  "width": 4,
  "height": 30,
  "connections": [],
  "npcs": [],
  "trainers": [],
  "encounter_zones": [],
  "buildings": []
},
{
  "id": "route_6",
  "name": "route_6",
  "display_name": "Route 6",
  "map_type": "route",
  "width": 20,
  "height": 25,
  "connections": [],
  "npcs": [
    {"npc_id": "vermilion_gate_guard", "x": 10, "y": 24, "facing": "up"}
  ],
  "trainers": [
    {"trainer_id": "route6_bug_catcher_1", "x": 8, "y": 10, "facing": "right", "sight_range": 3},
    {"trainer_id": "route6_youngster_1", "x": 14, "y": 15, "facing": "left", "sight_range": 3}
  ],
  "encounter_zones": [
    {"x": 4, "y": 4, "width": 6, "height": 8, "encounter_table_id": "route_6"},
    {"x": 12, "y": 8, "width": 5, "height": 6, "encounter_table_id": "route_6"}
  ],
  "buildings": [
    {"name": "Underground Entrance South", "x": 10, "y": 0, "width": 3, "height": 3, "door_x": 11, "door_y": 3, "interior_map_id": "underground_path_ns"}
  ]
}
```

**Also modify `cerulean_city`** — Add south connection: `{"direction": "south", "target_map_id": "route_5", "entry_x": 10, "entry_y": 0}`

**Route 5/6 encounter tables:**
```json
"route_5": {
  "encounter_type": "grass",
  "base_encounter_rate": 0.15,
  "encounters": [
    {"species_id": 43, "min_level": 13, "max_level": 16, "weight": 25},
    {"species_id": 17, "min_level": 13, "max_level": 16, "weight": 20},
    {"species_id": 16, "min_level": 13, "max_level": 16, "weight": 20},
    {"species_id": 39, "min_level": 13, "max_level": 16, "weight": 15},
    {"species_id": 63, "min_level": 12, "max_level": 16, "weight": 10},
    {"species_id": 52, "min_level": 14, "max_level": 17, "weight": 10}
  ]
},
"route_6": {
  "encounter_type": "grass",
  "base_encounter_rate": 0.15,
  "encounters": [
    {"species_id": 43, "min_level": 13, "max_level": 16, "weight": 25},
    {"species_id": 17, "min_level": 13, "max_level": 16, "weight": 20},
    {"species_id": 16, "min_level": 13, "max_level": 16, "weight": 20},
    {"species_id": 39, "min_level": 13, "max_level": 16, "weight": 15},
    {"species_id": 63, "min_level": 12, "max_level": 16, "weight": 10},
    {"species_id": 52, "min_level": 14, "max_level": 17, "weight": 10}
  ]
}
```

**Route 6 trainers:**

| ID | Name | Class | Team |
|----|------|-------|------|
| `route6_bug_catcher_1` | Keigo | Bug Catcher | Caterpie L16, Weedle L16 |
| `route6_youngster_1` | Dave | Youngster | Nidoran-M L16, Rattata L16 |

---

### B6: Nugget Bridge Gauntlet Service

**Files to create:**
- `backend/services/nugget_bridge_service.py`
- `backend/routes/nugget_bridge.py`

**Files to modify:**
- `backend/main.py` — Register `nugget_bridge` router

**Service design:**
The Nugget Bridge is a **sequential trainer gauntlet** — the player must defeat 5 trainers in order before reaching the Rocket Grunt. After defeating all 5, an NPC awards the Nugget. The Rocket Grunt battle is separate (standard trainer encounter).

**Service functions:**
- `get_nugget_bridge_state(game_id)` — Return how many of the 5 trainers have been defeated, whether Nugget has been awarded, whether Rocket Grunt is defeated
- `check_trainer_defeated(game_id, trainer_index)` — Mark trainer N as defeated (0-4)
- `award_nugget(game_id)` — Call `give_item(game_id, 51, 1)` to give Nugget, set story flag `nugget_bridge_complete`
- `is_bridge_clear(game_id)` — Check all 5 trainers defeated

**API Endpoints** (prefix: `/api/nugget-bridge`):

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/nugget-bridge/state/{game_id}` | Get bridge progress (trainers defeated, nugget awarded) |
| `POST` | `/nugget-bridge/defeat` | Record trainer defeat on bridge |
| `POST` | `/nugget-bridge/award` | Award Nugget after clearing all 5 trainers |

**Note:** The underlying trainer battles use the existing battle service. This service only tracks bridge-specific progress and the Nugget reward.

---

### B7: Bill's House Event Service

**Files to create:**
- `backend/services/bill_event_service.py`
- `backend/routes/bill_event.py`

**Files to modify:**
- `backend/main.py` — Register `bill_event` router

**Service functions:**
- `get_bill_state(game_id)` — Return Bill's current state: `"pokemon"` (needs help), `"transforming"` (mid-event), `"human"` (rescued), `"ticket_given"` (S.S. Ticket awarded)
- `start_transformation(game_id)` — Player activates the PC; begin transformation. Requires story flag `nugget_bridge_complete` or player has reached Bill's House.
- `complete_transformation(game_id)` — Bill transforms back, set flag `bill_rescued`
- `give_ss_ticket(game_id)` — Call `give_item(game_id, 52, 1)`, set flag `has_ss_ticket`

**API Endpoints** (prefix: `/api/bill`):

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/bill/state/{game_id}` | Get Bill's current state |
| `POST` | `/bill/transform` | Start the transformation event |
| `POST` | `/bill/complete` | Complete the transformation |
| `POST` | `/bill/ticket` | Receive S.S. Ticket from Bill |

---

### B8: Cerulean Burgled House Event

**Files to modify:**
- `backend/data/npcs.json` — Add `burgled_house_owner` NPC
- `backend/data/dialogues.json` — Add dialogue for the event
- `backend/data/maps.json` — Add `cerulean_burgled_house` interior map to Cerulean City buildings
- `backend/services/quest_service.py` — Add `rocket_cerulean` quest definition

**New map in `maps.json`:**
```json
{
  "id": "cerulean_burgled_house",
  "name": "cerulean_burgled_house",
  "display_name": "Cerulean City House",
  "map_type": "interior",
  "width": 8,
  "height": 8,
  "connections": [],
  "npcs": [{"npc_id": "burgled_house_owner", "x": 4, "y": 3, "facing": "down"}],
  "trainers": [],
  "encounter_zones": [],
  "buildings": []
}
```

**Also modify `cerulean_city`** — Add building entry for burgled house.

**Quest definition** (add to `_QUEST_DEFS` in `quest_service.py`):
```python
{
    "id": "rocket_cerulean",
    "name": "The Cerulean Robbery",
    "description": "A Team Rocket grunt has robbed a house in Cerulean City. Find and defeat the grunt!",
    "type": "side",
    "objectives": [
        {"type": "defeat_trainer", "target": "rocket_grunt_cerulean", "required": 1}
    ],
    "rewards": {"exp": 200, "money": 500, "items": [], "unlock_flags": ["rocket_cerulean_resolved"]},
    "prerequisite_quests": ["cascade_badge"],
    "status": "locked"
}
```

**Rocket Grunt encounter:** After the player defeats the Nugget Bridge Rocket Grunt (or obtains Cascade Badge), a Rocket Grunt appears behind the burgled house in Cerulean City. Defeating him completes the quest and the house owner thanks the player.

---

### B9: New Quest Definitions

**Files to modify:**
- `backend/services/quest_service.py` — Add 3 new quests to `_QUEST_DEFS`

**New quests:**

| Quest ID | Name | Type | Objectives | Prerequisites | Rewards |
|----------|------|------|-----------|---------------|---------|
| `nugget_bridge` | Nugget Bridge Challenge | main | Defeat 5 trainers on Route 24 | `cascade_badge` | Nugget item, 500 exp, flag `nugget_bridge_complete` |
| `bill_rescue` | Help Bill! | main | Visit Bill's House, complete transformation | `nugget_bridge` | S.S. Ticket, 300 exp, flag `bill_rescued`, flag `has_ss_ticket` |
| `rocket_cerulean` | The Cerulean Robbery | side | Defeat Rocket Grunt in Cerulean | `cascade_badge` | 500 money, 200 exp, flag `rocket_cerulean_resolved` |

**New story flags:** `nugget_bridge_complete`, `bill_rescued`, `has_ss_ticket`, `rocket_cerulean_resolved`

---

## Frontend Tasks (frontend-dev)

### F1: Nugget Bridge Rendering & Gauntlet UI

**Files to create:**
- `frontend/js/nuggetbridge.js` — Nugget Bridge gauntlet module

**Files to modify:**
- `frontend/js/routes.js` — Add Route 24 tile layout (narrow bridge, water on both sides)
- `frontend/js/map.js` — Add Route 24 collision data
- `frontend/js/sprites.js` — Add Nugget Bridge NPC sprite (greeter), Nugget item sprite
- `frontend/js/api.js` — Add Nugget Bridge API calls
- `frontend/index.html` — Include `nuggetbridge.js`

**Module: `nuggetbridge.js`:**
- `loadBridgeState(gameId)` — Call `GET /api/nugget-bridge/state/{game_id}`, track which trainers defeated
- `renderBridgeProgress(ctx, state)` — Visual indicator of progress (e.g., numbered markers on bridge)
- `onTrainerDefeated(gameId, trainerIndex)` — Call `POST /api/nugget-bridge/defeat`, update state
- `awardNugget(gameId)` — After trainer 5 defeated, NPC walks up: "Congratulations! Here's a Nugget!" → Call `POST /api/nugget-bridge/award`
- `renderNuggetReceived(ctx)` — Item received animation (item rises, text "Got a Nugget!")

**Route 24 rendering:**
- Narrow bridge over water — 10 tiles wide, 40 tiles tall
- Water tiles on both sides of the 3-tile-wide bridge deck
- Grass patches at top and bottom for wild encounters
- 5 trainers evenly spaced on bridge, facing south
- Rocket Grunt at the north end (distinct sprite)

**Integration Checklist (F1):**
- [ ] `GET /api/nugget-bridge/state/{game_id}` returns 200 with progress data
- [ ] `POST /api/nugget-bridge/defeat` returns 200 after each trainer battle
- [ ] `POST /api/nugget-bridge/award` returns 200 and gives Nugget
- [ ] `POST /api/map/transition` from Cerulean north returns Route 24
- [ ] `POST /api/encounter/check` works in Route 24 grass zones
- [ ] All 5 trainer encounters trigger in sequence
- [ ] Nugget award animation plays after 5th trainer
- [ ] Rocket Grunt pre-battle dialogue includes recruitment offer
- [ ] No 404s in Network tab during bridge traversal

---

### F2: Bill's House Rendering & Transformation Cutscene

**Files to create:**
- `frontend/js/billevent.js` — Bill's transformation event module

**Files to modify:**
- `frontend/js/routes.js` — Add Route 25 tile layout (grass path leading east to cottage)
- `frontend/js/map.js` — Add Route 25 collision data
- `frontend/js/cutscene.js` — Add `bill_transformation` scene to `SCENES`
- `frontend/js/sprites.js` — Add Bill sprite (human + Pokemon form), S.S. Ticket item sprite, Cell Separation System (PC-like machine)
- `frontend/js/api.js` — Add Bill event API calls
- `frontend/index.html` — Include `billevent.js`

**Module: `billevent.js`:**
- `loadBillState(gameId)` — Call `GET /api/bill/state/{game_id}`, determine which phase Bill is in
- `renderBillPokemonForm(ctx, x, y)` — Small Pokemon sprite (Clefairy-like, twitching)
- `renderBillHumanForm(ctx, x, y)` — Normal NPC sprite after transformation
- `startTransformation(gameId)` — Trigger cutscene: player uses PC → screen shakes → flash → Bill appears human
- `giveTicket(gameId)` — Call `POST /api/bill/ticket`, show item-received animation

**Cutscene sequence (`bill_transformation`):**
```javascript
[
  {type: 'dialogue', name: 'Bill', lines: ["Help! I'm stuck! I was experimenting with my Cell Separation System and merged with a Pokemon!"]},
  {type: 'dialogue', name: 'Bill', lines: ["Please! Run the Cell Separation System on my PC over there!"]},
  {type: 'callback', fn: () => BillEvent.startTransformation(gameId)},
  {type: 'shake', duration: 1000},
  {type: 'fade', direction: 'out', duration: 500},
  {type: 'wait', duration: 800},
  {type: 'fade', direction: 'in', duration: 500},
  {type: 'npc_face', npc: 'bill', direction: 'down'},
  {type: 'dialogue', name: 'Bill', lines: ["I'm back to normal! Thank you so much!", "Here, take this as a token of my gratitude!"]},
  {type: 'callback', fn: () => BillEvent.giveTicket(gameId)},
  {type: 'dialogue', name: 'Bill', lines: ["That's an S.S. Ticket for the luxury liner in Vermilion City. Enjoy!"]},
  {type: 'set_flag', flag: 'bill_rescued'}
]
```

**Route 25 rendering:**
- Horizontal route: grass fields, fence borders, winding path east to cottage
- Bill's House at east end: small cottage with door
- 2 trainers along the path

**Bill's House interior:**
- Small 8x8 room: bookshelves, PC/machine (Cell Separation System) at north wall
- Bill NPC: Pokemon form (pre-event) or human form (post-event)
- PC machine is interactable to trigger transformation

**Integration Checklist (F2):**
- [ ] `GET /api/bill/state/{game_id}` returns 200 with current state
- [ ] `POST /api/bill/transform` returns 200 and advances state
- [ ] `POST /api/bill/complete` returns 200
- [ ] `POST /api/bill/ticket` returns 200 and gives S.S. Ticket
- [ ] `POST /api/map/transition` from Route 24 north returns Route 25
- [ ] Building enter at Bill's House works
- [ ] Cutscene plays fully: dialogue → shake → fade → Bill transforms → ticket given
- [ ] Bill's sprite changes from Pokemon to human after event
- [ ] S.S. Ticket appears in player inventory after event
- [ ] Bill says different dialogue if visited again (post-event)
- [ ] No 404s in Network tab during Bill's event

---

### F3: Route 5, Underground Path & Route 6 Rendering

**Files to modify:**
- `frontend/js/routes.js` — Add Route 5, Underground Path, Route 6 tile layouts
- `frontend/js/map.js` — Add collision data for all 3 maps
- `frontend/js/sprites.js` — Add Underground Path tiles (stone corridor), gate guard sprite
- `frontend/js/npc.js` — Register gate guard NPC
- `frontend/js/api.js` — Verify map transition calls

**Route 5 rendering:**
- Vertical route south of Cerulean: grass patches, trees, dirt path
- Underground entrance building at south end
- No trainers (matches original game — mostly wild encounters)

**Underground Path rendering:**
- Long narrow corridor (4 wide, 30 tall): stone walls, floor tiles, dim lighting
- No encounters, no NPCs — just a passage
- Entry from Route 5 at top, exit to Route 6 at bottom

**Route 6 rendering:**
- Vertical route with grass patches, 2 trainers
- Gate building at south end (Vermilion City gate — blocked for now)
- Gate guard NPC: "This way leads to Vermilion City. Construction ahead, please be careful!" (placeholder for Sprint 13)

**Integration Checklist (F3):**
- [ ] `POST /api/map/transition` from Cerulean south returns Route 5
- [ ] Building enter at Underground Entrance works
- [ ] Underground Path renders correctly (stone corridor, no encounters)
- [ ] Building exit from Underground leads to Route 6
- [ ] `POST /api/encounter/check` works in Route 5 and Route 6 grass
- [ ] Route 6 trainers trigger correctly
- [ ] Gate guard dialogue displays (Vermilion teaser)
- [ ] No 404s in Network tab during south route traversal

---

### F4: Team Rocket Sprites & Cerulean Event UI

**Files to modify:**
- `frontend/js/sprites.js` — Add Team Rocket grunt sprite (black uniform, R logo), Officer Jenny updated sprite
- `frontend/js/npc.js` — Register burgled house NPCs
- `frontend/js/dialogue.js` — No changes needed (uses existing system)
- `frontend/js/routes.js` — Add `cerulean_burgled_house` interior rendering
- `frontend/js/quests.js` — Wire quest tracking for `rocket_cerulean` quest

**Rocket Grunt sprite:**
- 16x16 pixel art: black outfit, white "R" on chest, black cap
- Two variants: standing (overworld), battle pose (battle screen)

**Cerulean event flow:**
1. Player enters burgled house → owner NPC complains about robbery
2. Player exits house → Rocket Grunt appears behind the house (conditional on `cascade_badge` flag)
3. Grunt challenges player → standard trainer battle
4. Post-defeat: Grunt dialogue + quest completion notification
5. Owner NPC dialogue updates: "Thank you for stopping that thief!"

**Integration Checklist (F4):**
- [ ] Rocket Grunt sprite renders in overworld and battle screen
- [ ] Burgled house owner dialogue triggers on NPC interaction
- [ ] Rocket Grunt appears only after Cascade Badge
- [ ] `POST /api/quests/check-progress` with `defeat_trainer` event returns 200
- [ ] Quest completion notification displays
- [ ] Owner dialogue changes after quest completion
- [ ] No 404s in Network tab during Cerulean event

---

## Backend QA Tasks (QA-A)

### QA-A1: Item System & Reward Tests

**File to create:** `backend/tests/test_item_system_improvements.py`

**Test cases (minimum 12):**
1. `test_give_item_success` — `give_item()` adds item to inventory
2. `test_give_item_quantity` — Giving multiple of same item stacks correctly
3. `test_give_item_invalid_item` — 404 for nonexistent item ID
4. `test_give_item_invalid_game` — 404 for nonexistent game
5. `test_toss_key_item_blocked` — Cannot toss key item (S.S. Ticket)
6. `test_sell_key_item_blocked` — Cannot sell key item
7. `test_toss_normal_item_still_works` — Tossing potions still works
8. `test_sell_normal_item_still_works` — Selling normal items still works
9. `test_nugget_item_exists` — Nugget is defined in items.json
10. `test_ss_ticket_item_exists` — S.S. Ticket is defined in items.json
11. `test_nugget_sellable` — Nugget can be sold for 5000
12. `test_give_item_endpoint` — POST endpoint returns 200

### QA-A2: Nugget Bridge & Route Tests

**File to create:** `backend/tests/test_nugget_bridge.py`

**Test cases (minimum 15):**
1. `test_route_24_map_exists` — Route 24 loads from maps.json
2. `test_route_24_connections` — South→Cerulean, North→Route 25
3. `test_route_25_map_exists` — Route 25 loads correctly
4. `test_bills_house_map_exists` — Bill's House interior loads
5. `test_nugget_bridge_initial_state` — New game has 0 trainers defeated
6. `test_defeat_trainer_1` — First trainer recorded as defeated
7. `test_defeat_all_5` — All 5 trainers defeated, bridge clear
8. `test_award_nugget_after_clear` — Nugget awarded after 5 trainers
9. `test_award_nugget_before_clear` — Cannot award before clearing all 5
10. `test_nugget_in_inventory` — Nugget appears in player inventory after award
11. `test_bridge_state_persistence` — Progress persists across calls
12. `test_route_24_encounter_table` — Route 24 encounters defined
13. `test_route_25_encounter_table` — Route 25 encounters defined
14. `test_nugget_trainers_exist` — All 5 bridge trainers defined in trainers.json
15. `test_rocket_grunt_nugget_exists` — Rocket Grunt trainer data exists

### QA-A3: Bill's Event & Quest Tests

**File to create:** `backend/tests/test_bill_event.py`

**Test cases (minimum 12):**
1. `test_bill_initial_state_pokemon` — Bill starts as "pokemon"
2. `test_start_transformation` — State changes from "pokemon" to "transforming"
3. `test_complete_transformation` — State changes to "human", flag `bill_rescued` set
4. `test_give_ss_ticket` — S.S. Ticket added to inventory, flag `has_ss_ticket` set
5. `test_give_ticket_before_transformation` — Cannot get ticket before transformation
6. `test_double_transformation` — Idempotent if already human
7. `test_quest_nugget_bridge_def` — Quest definition exists
8. `test_quest_bill_rescue_def` — Quest definition exists
9. `test_quest_rocket_cerulean_def` — Quest definition exists
10. `test_quest_progress_on_defeat` — Defeating trainer advances quest
11. `test_quest_completion_rewards` — Quest rewards granted correctly
12. `test_story_flags_set` — All new story flags set correctly after events

### QA-A4: Route 5/6 & Underground Tests

**File to create:** `backend/tests/test_routes_5_6.py`

**Test cases (minimum 8):**
1. `test_route_5_map_exists` — Route 5 loads correctly
2. `test_route_6_map_exists` — Route 6 loads correctly
3. `test_underground_path_exists` — Underground Path loads correctly
4. `test_cerulean_south_connection` — Cerulean City has south connection to Route 5
5. `test_route_5_encounter_table` — Route 5 encounters defined
6. `test_route_6_encounter_table` — Route 6 encounters defined
7. `test_route_6_trainers` — 2 trainers on Route 6
8. `test_underground_no_encounters` — Underground Path has no encounter zones

---

## Frontend QA Tasks (QA-B)

### QA-B1: Nugget Bridge Frontend Review

**Scope:** Review `nuggetbridge.js`, changes to `routes.js`, `map.js`, `sprites.js`, `api.js`

**Checklist:**
1. Verify all 3 Nugget Bridge API endpoints wired in `api.js`
2. Check each API call has proper error handling (not `.catch(() => {})`)
3. Verify bridge renders with water on both sides
4. Check all 5 trainers trigger in sequence (can't skip)
5. Verify Nugget award animation plays correctly
6. Verify Rocket Grunt dialogue includes recruitment + battle
7. Open browser Network tab → clear bridge → confirm no 404s

### QA-B2: Bill's Event Frontend Review

**Scope:** Review `billevent.js`, changes to `routes.js`, `cutscene.js`, `sprites.js`, `api.js`

**Checklist:**
1. Verify all 4 Bill event API endpoints wired in `api.js`
2. Check Bill cutscene plays fully (dialogue → shake → fade → transform)
3. Verify Bill sprite changes from Pokemon to human form
4. Verify S.S. Ticket appears in inventory after event
5. Check re-visiting Bill shows post-event dialogue
6. Verify Route 25 rendering and trainer encounters
7. Open browser Network tab → complete Bill event → confirm no 404s

### QA-B3: Routes 5/6 & Underground Frontend Review

**Scope:** Review changes to `routes.js`, `map.js`, `npc.js`, `api.js`

**Checklist:**
1. Verify map transitions: Cerulean → Route 5 → Underground → Route 6
2. Check Underground Path renders as stone corridor
3. Verify Route 6 gate guard dialogue displays
4. Check Route 6 trainers trigger correctly
5. Verify no encounter zones in Underground Path
6. Open browser Network tab → traverse south routes → confirm no 404s

### QA-B4: Team Rocket & Cerulean Event Frontend Review

**Scope:** Review changes to `sprites.js`, `npc.js`, `routes.js`, `quests.js`

**Checklist:**
1. Verify Rocket Grunt sprite renders in overworld and battle
2. Check burgled house interior renders with owner NPC
3. Verify Rocket Grunt appears only after Cascade Badge
4. Check quest completion notification displays
5. Verify owner dialogue updates after quest resolution
6. Open browser Network tab → complete Cerulean event → confirm no 404s

---

## Risk Mitigation

### 1. game.js Merge Conflicts (HIGH RISK — recurring)
**Problem:** F1 (Nugget Bridge module), F2 (Bill cutscene), and F4 (Cerulean event) may touch game.js for new state or NPC interaction logic.
**Mitigation:**
- F1 and F2 use their own modules — minimal game.js changes
- The Nugget Bridge gauntlet can use the existing trainer encounter system
- Bill's cutscene uses existing `'cutscene'` state — no new state needed
- Merge order: F3 (routes, no game.js) → F4 (Cerulean event) → F1 (Nugget Bridge) → F2 (Bill — cutscene integration)
- Each PR rebases on main before merge

### 2. Frontend Integration Gap (HIGH RISK — recurring)
**Problem:** Frontend builds UI without wiring API calls.
**Mitigation:**
- Every frontend task has an explicit Integration Checklist
- QA-B must verify zero 404s in Network tab
- Code review rejects any `.catch(() => {})`
- Two new services (nugget_bridge, bill_event) have dedicated endpoints — easy to verify

### 3. Item System Changes Affect Existing Code (MEDIUM)
**Problem:** Modifying `toss_item()` and `sell_item()` might break existing functionality.
**Mitigation:**
- QA-A1 explicitly tests that normal items can still be tossed/sold
- Only key_item category gets protection — other categories unchanged
- B1 is Phase 1 — tested before any features depend on it

### 4. Cutscene Complexity (MEDIUM)
**Problem:** Bill's transformation is the most complex cutscene since Sprint 7. Multiple steps (dialogue, shake, fade, sprite change, item grant) must play in sequence.
**Mitigation:**
- Existing cutscene engine supports all needed step types (dialogue, shake, fade, callback, set_flag)
- No new step types needed — compose from existing primitives
- Test cutscene in isolation before integrating with Bill's House

### 5. Frontend Finishes Faster (MEDIUM — recurring)
**Problem:** Frontend-dev finishes 30-50% faster.
**Mitigation:**
- F3 (Routes 5/6) has minimal backend dependency — start immediately as map rendering work
- F4 (Team Rocket sprites + event) requires B2 + B8 — natural pacing gate
- If frontend finishes early: prepare Vermilion City map layout shells for Sprint 13

### 6. Quest System In-Memory Definitions (LOW)
**Problem:** All quest definitions are hardcoded in `quest_service.py`, not in a data file. Adding 3 more quests makes this file larger.
**Mitigation:**
- Acceptable for Sprint 12 — 8 total quests is manageable in-code
- Consider extracting to `quests.json` as a Sprint 13 tech debt task

---

## File Ownership Summary (Conflict Prevention)

| File | Owner | Notes |
|------|-------|-------|
| `backend/data/items.json` | backend-dev | Modify (add Nugget, S.S. Ticket) |
| `backend/data/maps.json` | backend-dev | Modify (add 7 maps, update cerulean connections) |
| `backend/data/trainers.json` | backend-dev | Modify (add 11 trainers) |
| `backend/data/npcs.json` | backend-dev | Modify (add 4+ NPCs) |
| `backend/data/dialogues.json` | backend-dev | Modify (add dialogues) |
| `backend/data/encounter_tables.json` | backend-dev | Modify (add route_24, route_25, route_5, route_6) |
| `backend/services/item_service.py` | backend-dev | Modify (add give_item, key item protection) |
| `backend/services/quest_service.py` | backend-dev | Modify (add 3 quest definitions) |
| `backend/services/nugget_bridge_service.py` | backend-dev | New file |
| `backend/services/bill_event_service.py` | backend-dev | New file |
| `backend/routes/items.py` | backend-dev | Modify (add give endpoint) |
| `backend/routes/nugget_bridge.py` | backend-dev | New file |
| `backend/routes/bill_event.py` | backend-dev | New file |
| `backend/main.py` | backend-dev | Modify (register 2 new routers) |
| `frontend/js/nuggetbridge.js` | frontend-dev | New file |
| `frontend/js/billevent.js` | frontend-dev | New file |
| `frontend/js/routes.js` | frontend-dev | Modify (Route 24, 25, 5, 6, Underground) |
| `frontend/js/map.js` | frontend-dev | Modify (collision data) |
| `frontend/js/sprites.js` | frontend-dev | Modify (Rocket Grunt, Bill, items) |
| `frontend/js/cutscene.js` | frontend-dev | Modify (add bill_transformation scene) |
| `frontend/js/npc.js` | frontend-dev | Modify (new NPCs) |
| `frontend/js/quests.js` | frontend-dev | Modify (quest tracking UI) |
| `frontend/js/api.js` | frontend-dev | Modify (new API calls) |
| `frontend/index.html` | frontend-dev | Modify (2 new script tags) |
| `frontend/js/game.js` | frontend-dev | Modify (MINIMAL — only if needed) |
| `backend/tests/test_item_system_improvements.py` | QA-A | New file |
| `backend/tests/test_nugget_bridge.py` | QA-A | New file |
| `backend/tests/test_bill_event.py` | QA-A | New file |
| `backend/tests/test_routes_5_6.py` | QA-A | New file |

---

## Definition of Done

- [ ] All 5 sprint goals met
- [ ] Player can traverse: Cerulean City → Route 24 (Nugget Bridge) → Route 25 → Bill's House
- [ ] Player can traverse: Cerulean City → Route 5 → Underground Path → Route 6
- [ ] Nugget Bridge gauntlet: 5 trainers + Rocket Grunt → Nugget reward
- [ ] Bill's House event: transformation cutscene → S.S. Ticket reward
- [ ] Cerulean burgled house quest completable
- [ ] Key items cannot be tossed or sold
- [ ] `give_item()` function works for story rewards
- [ ] All integration checklists pass (zero 404s)
- [ ] 47+ new tests passing
- [ ] Total test count >= 1,497 (1,450 + 47)
- [ ] All PRs merged to `main` without regressions
- [ ] Full test suite passes: `cd backend && python3 -m pytest`

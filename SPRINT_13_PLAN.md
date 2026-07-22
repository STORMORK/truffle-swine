# Sprint 13 Plan — Vermilion City, S.S. Anne & Lt. Surge

> **Theme:** Vermilion City Hub, S.S. Anne Luxury Ship Event, Lt. Surge's Electric Gym, Route 11 Stub
> **Sprint Start:** TBD (immediately after Sprint 12 completion)
> **Baseline (projected post-Sprint 12):** ~1,500 tests, 29 maps, 60+ Pokemon species, 25+ trainers, 2 playable gyms, 50 frontend JS modules, 26 backend routers

---

## Why This Sprint

After Sprint 12, Route 6 ends at a dead-end gate guard blocking the path to Vermilion City. The player has the S.S. Ticket from Bill but nowhere to use it. In the original Gen 1 games, Vermilion City is a major milestone:
- **Vermilion City** — A port city with the Pokemon Center, Poke Mart, Pokemon Fan Club, and Lt. Surge's Gym
- **S.S. Anne** — A luxury ship docked at the harbor. The player explores multiple decks, battles trainers and the Rival, then helps the seasick Captain who gives HM01 Cut
- **Lt. Surge's Gym** — The 3rd gym, featuring an Electric-type puzzle where the player must find 2 switches hidden in trash cans to unlock the path to the leader
- **Diglett's Cave entrance** — A shortcut back to Route 2 using the existing Diglett's Cave map
- **Route 11** — Eastern exit toward Route 12 (dead end for Sprint 14)

This sprint gives the player their 3rd badge (Thunder Badge), the Cut HM for overworld obstacles, and the most complex interior event yet (S.S. Anne multi-room ship).

**Current world graph (projected post-Sprint 12):**
```
                                                    Route 24 (Nugget Bridge) <-> Route 25 <-> Bill's House
                                                    ^
Pallet Town <-> Route 1 <-> Viridian City <-> Route 2 <-> Pewter City <-> Route 3 <-> Mt. Moon <-> Route 4 <-> Cerulean City
                                                                                                                    |
                                                                                                                Route 5 <-> Underground Path <-> Route 6 (dead end)
```

**After this sprint:**
```
                                                    Route 24 (Nugget Bridge) <-> Route 25 <-> Bill's House
                                                    ^
Pallet Town <-> Route 1 <-> Viridian City <-> Route 2 <-> Pewter City <-> Route 3 <-> Mt. Moon <-> Route 4 <-> Cerulean City
                                                    ^                                                               |
                                                    |                                                           Route 5 <-> Underground Path <-> Route 6
                                              Diglett's Cave                                                                                        |
                                                    ^                                                                                         Vermilion City <-> Route 11 (dead end)
                                                    |                                                                                               |
                                              Vermilion City ----+                                                                            S.S. Anne (harbor)
                                                                  |                                                                                 |
                                                          Vermilion Gym (Lt. Surge)                                                       [Deck, Cabins, Kitchen, Captain's Room]
```

Simplified:
```
Route 6 <-> Vermilion City <-> Route 11 (dead end)
                |         \
          Diglett's Cave   S.S. Anne Harbor
          (to Route 2)         |
                          S.S. Anne Interior (multi-room)
                               |
                          Vermilion Gym (Lt. Surge, Badge 3)
```

---

## Sprint Goals

1. **Vermilion City** — New city map with Pokemon Center, Poke Mart, Pokemon Fan Club (NPC gives Bike Voucher hint), Vermilion Gym, harbor dock entrance, houses, and Diglett's Cave entrance building. Connect Route 6 south to Vermilion north.
2. **S.S. Anne Event** — Multi-room luxury ship. Player needs S.S. Ticket (from Sprint 12's Bill) to board. Interior rooms: Main Deck, Cabins Hallway, Kitchen, Captain's Room. Multiple trainers throughout, Rival battle on the deck. Captain is seasick — player helps him, receives HM01 Cut. Ship departs after receiving Cut (one-time event).
3. **Lt. Surge's Gym** — Electric-type gym with trash can puzzle mechanic. 15 trash cans in a grid; player must find 2 switches in sequence. If the second switch is wrong, both reset. Lt. Surge has Voltorb L21, Pikachu L18, Raichu L24. Thunder Badge (Badge 3) reward.
4. **Diglett's Cave Entrance** — Building in Vermilion City connecting to the existing `digletts_cave` map, which connects back to Route 2. Backtracking shortcut.
5. **Route 11** — Eastern exit from Vermilion City toward Route 12 (dead end with gate guard for Sprint 14). Wild encounters and trainers.

---

## Task Dependencies (Build Order)

```
Phase 1 (Backend Foundation -- parallel):
  B1: New Pokemon species data (Pikachu, Raichu, Voltorb, Magnemite, etc.) ----+
  B2: Vermilion City map + buildings + NPCs ------------------------------------+-- Can be parallel
  B3: S.S. Anne map data (all interior rooms) ----------------------------------+
  B4: Route 11 map + trainers + encounters -------------------------------------+
  B5: New items (HM01 Cut) + Vermilion Mart stock ------------------------------+

Phase 2 (Backend Logic -- depends on Phase 1):
  B6: S.S. Anne event service -- ticket gate, rival battle, captain event (depends on B3, B5)
  B7: Lt. Surge gym + trash can puzzle service (depends on B1, B2)
  B8: Diglett's Cave connection wiring (depends on B2)
  B9: New quest definitions -- ss_anne, thunder_badge, etc. (depends on B6, B7)

Phase 3 (Frontend -- after corresponding backend):
  F1: Vermilion City rendering + buildings + NPCs (depends on B2)
  F2: S.S. Anne rendering + multi-room navigation + rival battle + captain cutscene (depends on B6)
  F3: Lt. Surge gym rendering + trash can puzzle UI (depends on B7)
  F4: Route 11 rendering + Diglett's Cave entrance (depends on B4, B8)

Phase 4 (QA):
  QA-A: Backend tests for S.S. Anne event, gym puzzle, species, quests
  QA-B: Frontend integration tests, cutscene flow, puzzle UI, API wiring
```

**Critical Path:** B3 + B5 -> B6 -> F2 (S.S. Anne data + HM item block the event service, which blocks ship UI)

---

## Backend Tasks (backend-dev)

### B1: New Pokemon Species Data

**Files to modify:**
- `backend/data/species.json` -- Add 7 new species

**New species:**

| Species ID | Name | Type 1 | Type 2 | Base Stats (HP/Atk/Def/SpA/SpD/Spe) | Evolution |
|-----------|------|--------|--------|--------------------------------------|-----------|
| 25 | Pikachu | Electric | -- | 35/55/40/50/50/90 | Thunder Stone -> Raichu |
| 26 | Raichu | Electric | -- | 60/90/55/90/80/110 | -- |
| 66 | Machop | Fighting | -- | 70/80/50/35/35/35 | L28 -> Machoke |
| 67 | Machoke | Fighting | -- | 80/100/70/50/60/45 | Trade -> Machamp |
| 81 | Magnemite | Electric | Steel | 25/35/70/95/55/45 | L30 -> Magneton |
| 82 | Magneton | Electric | Steel | 50/60/95/120/70/70 | -- |
| 100 | Voltorb | Electric | -- | 40/30/50/55/55/100 | L30 -> Electrode |

**Species JSON format (following existing pattern):**
```json
{
  "id": 25,
  "name": "Pikachu",
  "types": ["electric"],
  "base_stats": {"hp": 35, "attack": 55, "defense": 40, "sp_attack": 50, "sp_defense": 50, "speed": 90},
  "base_exp": 112,
  "catch_rate": 190,
  "growth_rate": "medium_fast",
  "learnable_moves": {
    "1": ["Thunder Shock", "Growl"],
    "5": ["Tail Whip"],
    "10": ["Thunder Wave"],
    "13": ["Quick Attack"],
    "18": ["Double Team"],
    "21": ["Slam"],
    "26": ["Thunderbolt"]
  },
  "evolution": {"method": "item", "item": "Thunder Stone", "into": 26},
  "sprite_id": "pikachu"
}
```

---

### B2: Vermilion City Map + Buildings + NPCs

**Files to modify:**
- `backend/data/maps.json` -- Add `vermilion_city`, `vermilion_pokemon_center`, `vermilion_pokemart`, `vermilion_fan_club`, `vermilion_house_1`, `digletts_cave_entrance` maps
- `backend/data/npcs.json` -- Add Vermilion NPCs
- `backend/data/dialogues.json` -- Add Vermilion dialogues

**Also modify:**
- `route_6` in `maps.json` -- Add south connection: `{"direction": "south", "target_map_id": "vermilion_city", "entry_x": 10, "entry_y": 0}`

**Main city map:**
```json
{
  "id": "vermilion_city",
  "name": "vermilion_city",
  "display_name": "Vermilion City",
  "map_type": "town",
  "width": 30,
  "height": 30,
  "connections": [
    {"direction": "north", "target_map_id": "route_6", "entry_x": 10, "entry_y": 24},
    {"direction": "east", "target_map_id": "route_11", "entry_x": 0, "entry_y": 15}
  ],
  "npcs": [
    {"npc_id": "vermilion_townsfolk_1", "x": 10, "y": 10, "facing": "down"},
    {"npc_id": "vermilion_townsfolk_2", "x": 18, "y": 14, "facing": "left"},
    {"npc_id": "vermilion_townsfolk_3", "x": 5, "y": 20, "facing": "right"},
    {"npc_id": "vermilion_dock_guard", "x": 15, "y": 28, "facing": "down"}
  ],
  "trainers": [],
  "encounter_zones": [],
  "buildings": [
    {"name": "Pokemon Center", "x": 8, "y": 4, "width": 5, "height": 4, "door_x": 10, "door_y": 8, "interior_map_id": "vermilion_pokemon_center"},
    {"name": "Poke Mart", "x": 16, "y": 4, "width": 4, "height": 4, "door_x": 18, "door_y": 8, "interior_map_id": "vermilion_pokemart"},
    {"name": "Vermilion Gym", "x": 5, "y": 14, "width": 7, "height": 6, "door_x": 8, "door_y": 20, "interior_map_id": "vermilion_gym"},
    {"name": "Pokemon Fan Club", "x": 16, "y": 14, "width": 5, "height": 4, "door_x": 18, "door_y": 18, "interior_map_id": "vermilion_fan_club"},
    {"name": "Vermilion House", "x": 24, "y": 4, "width": 4, "height": 4, "door_x": 26, "door_y": 8, "interior_map_id": "vermilion_house_1"},
    {"name": "Diglett's Cave", "x": 2, "y": 4, "width": 4, "height": 4, "door_x": 3, "door_y": 8, "interior_map_id": "digletts_cave_entrance"},
    {"name": "S.S. Anne Harbor", "x": 10, "y": 25, "width": 10, "height": 5, "door_x": 15, "door_y": 25, "interior_map_id": "ss_anne_deck"}
  ]
}
```

**Interior maps:**
```json
{
  "id": "vermilion_pokemon_center",
  "name": "vermilion_pokemon_center",
  "display_name": "Vermilion City Pokemon Center",
  "map_type": "interior",
  "width": 10,
  "height": 8,
  "connections": [],
  "npcs": [{"npc_id": "nurse_joy_vermilion", "x": 5, "y": 2, "facing": "down"}],
  "trainers": [],
  "encounter_zones": [],
  "buildings": []
},
{
  "id": "vermilion_pokemart",
  "name": "vermilion_pokemart",
  "display_name": "Vermilion City Poke Mart",
  "map_type": "interior",
  "width": 8,
  "height": 8,
  "connections": [],
  "npcs": [{"npc_id": "vermilion_shopkeeper", "x": 4, "y": 2, "facing": "down"}],
  "trainers": [],
  "encounter_zones": [],
  "buildings": []
},
{
  "id": "vermilion_fan_club",
  "name": "vermilion_fan_club",
  "display_name": "Pokemon Fan Club",
  "map_type": "interior",
  "width": 10,
  "height": 8,
  "connections": [],
  "npcs": [
    {"npc_id": "fan_club_chairman", "x": 5, "y": 3, "facing": "down"},
    {"npc_id": "fan_club_member_1", "x": 3, "y": 5, "facing": "right"},
    {"npc_id": "fan_club_member_2", "x": 7, "y": 5, "facing": "left"}
  ],
  "trainers": [],
  "encounter_zones": [],
  "buildings": []
},
{
  "id": "vermilion_house_1",
  "name": "vermilion_house_1",
  "display_name": "Vermilion City House",
  "map_type": "interior",
  "width": 8,
  "height": 8,
  "connections": [],
  "npcs": [{"npc_id": "vermilion_resident", "x": 4, "y": 3, "facing": "down"}],
  "trainers": [],
  "encounter_zones": [],
  "buildings": []
},
{
  "id": "digletts_cave_entrance",
  "name": "digletts_cave_entrance",
  "display_name": "Diglett's Cave Entrance",
  "map_type": "interior",
  "width": 6,
  "height": 6,
  "connections": [],
  "npcs": [],
  "trainers": [],
  "encounter_zones": [],
  "buildings": [
    {"name": "Cave Entrance", "x": 3, "y": 1, "width": 2, "height": 2, "door_x": 3, "door_y": 1, "interior_map_id": "digletts_cave"}
  ]
}
```

**New NPCs:**

| NPC ID | Name | Location | Dialogue |
|--------|------|----------|----------|
| `vermilion_townsfolk_1` | Sailor | Vermilion City | "The S.S. Anne is a luxury cruise ship! You need a ticket to board, though." |
| `vermilion_townsfolk_2` | Woman | Vermilion City | "Lt. Surge is the Gym Leader here. He's a tough ex-military man who uses Electric-type Pokemon!" |
| `vermilion_townsfolk_3` | Old Man | Vermilion City | "Diglett's Cave connects this city all the way to Route 2! It's quite a shortcut." |
| `vermilion_dock_guard` | Dock Guard | Vermilion City (harbor) | "The S.S. Anne is docked here. Do you have an S.S. Ticket?" (gates boarding) |
| `nurse_joy_vermilion` | Nurse Joy | Pokemon Center | Standard healing dialogue |
| `vermilion_shopkeeper` | Shopkeeper | Poke Mart | Standard shop dialogue |
| `fan_club_chairman` | Chairman | Fan Club | "I love my Rapidash! It's the most beautiful Pokemon! ... ... ... Listen to my Pokemon stories!" (long dialogue, Fan Club Chairman) |
| `fan_club_member_1` | Fan Club Member | Fan Club | "I just love Pokemon! They're so cute!" |
| `fan_club_member_2` | Fan Club Member | Fan Club | "The Chairman really loves talking about his Pokemon..." |
| `vermilion_resident` | Resident | House | "There's been construction on Route 11 lately. I hear they're building toward Lavender Town." |

---

### B3: S.S. Anne Map Data (All Interior Rooms)

**Files to modify:**
- `backend/data/maps.json` -- Add `ss_anne_deck`, `ss_anne_cabins`, `ss_anne_kitchen`, `ss_anne_captains_room` maps
- `backend/data/trainers.json` -- Add S.S. Anne trainers + Rival battle
- `backend/data/npcs.json` -- Add Captain, ship NPCs
- `backend/data/dialogues.json` -- Add Captain dialogue, Rival dialogue

**S.S. Anne room maps:**
```json
{
  "id": "ss_anne_deck",
  "name": "ss_anne_deck",
  "display_name": "S.S. Anne - Deck",
  "map_type": "interior",
  "width": 20,
  "height": 15,
  "connections": [],
  "npcs": [
    {"npc_id": "ss_anne_sailor_1", "x": 5, "y": 7, "facing": "right"},
    {"npc_id": "ss_anne_sailor_2", "x": 15, "y": 7, "facing": "left"}
  ],
  "trainers": [
    {"trainer_id": "ss_anne_gentleman_1", "x": 10, "y": 5, "facing": "down", "sight_range": 3},
    {"trainer_id": "ss_anne_lass_1", "x": 16, "y": 10, "facing": "left", "sight_range": 3}
  ],
  "encounter_zones": [],
  "buildings": [
    {"name": "Cabins", "x": 2, "y": 12, "width": 4, "height": 3, "door_x": 3, "door_y": 12, "interior_map_id": "ss_anne_cabins"},
    {"name": "Kitchen", "x": 14, "y": 12, "width": 4, "height": 3, "door_x": 15, "door_y": 12, "interior_map_id": "ss_anne_kitchen"},
    {"name": "Captain's Room", "x": 8, "y": 0, "width": 4, "height": 3, "door_x": 9, "door_y": 3, "interior_map_id": "ss_anne_captains_room"}
  ]
},
{
  "id": "ss_anne_cabins",
  "name": "ss_anne_cabins",
  "display_name": "S.S. Anne - Cabins",
  "map_type": "interior",
  "width": 15,
  "height": 20,
  "connections": [],
  "npcs": [
    {"npc_id": "ss_anne_passenger_1", "x": 3, "y": 5, "facing": "down"},
    {"npc_id": "ss_anne_passenger_2", "x": 12, "y": 10, "facing": "left"}
  ],
  "trainers": [
    {"trainer_id": "ss_anne_youngster_1", "x": 7, "y": 8, "facing": "down", "sight_range": 2},
    {"trainer_id": "ss_anne_sailor_trainer_1", "x": 5, "y": 15, "facing": "right", "sight_range": 3}
  ],
  "encounter_zones": [],
  "buildings": []
},
{
  "id": "ss_anne_kitchen",
  "name": "ss_anne_kitchen",
  "display_name": "S.S. Anne - Kitchen",
  "map_type": "interior",
  "width": 10,
  "height": 10,
  "connections": [],
  "npcs": [
    {"npc_id": "ss_anne_chef", "x": 5, "y": 3, "facing": "down"}
  ],
  "trainers": [
    {"trainer_id": "ss_anne_sailor_trainer_2", "x": 7, "y": 7, "facing": "left", "sight_range": 2}
  ],
  "encounter_zones": [],
  "buildings": []
},
{
  "id": "ss_anne_captains_room",
  "name": "ss_anne_captains_room",
  "display_name": "S.S. Anne - Captain's Room",
  "map_type": "interior",
  "width": 8,
  "height": 8,
  "connections": [],
  "npcs": [
    {"npc_id": "ss_anne_captain", "x": 4, "y": 3, "facing": "down"}
  ],
  "trainers": [],
  "encounter_zones": [],
  "buildings": []
}
```

**S.S. Anne trainers:**

| ID | Name | Class | Location | Team |
|----|------|-------|----------|------|
| `ss_anne_gentleman_1` | Arthur | Gentleman | Deck | Growlithe L18, Ponyta L18 |
| `ss_anne_lass_1` | Ann | Lass | Deck | Oddish L18, Pidgey L18 |
| `ss_anne_youngster_1` | Tyler | Youngster | Cabins | Nidoran-M L19, Rattata L19 |
| `ss_anne_sailor_trainer_1` | Huey | Sailor | Cabins | Machop L18, Machop L18, Machop L18 |
| `ss_anne_sailor_trainer_2` | Duncan | Sailor | Kitchen | Machop L20, Shellder L20 |

**Rival battle on S.S. Anne deck:**

The Rival appears on the deck when the player approaches the Captain's Room entrance. This uses the existing rival service with a new rival battle stage.

**Rival team (S.S. Anne variant — depends on starter chosen):**

| Slot | If player chose Bulbasaur | If player chose Charmander | If player chose Squirtle |
|------|---------------------------|---------------------------|------------------------|
| 1 | Pidgeotto L19 | Pidgeotto L19 | Pidgeotto L19 |
| 2 | Raticate L16 | Raticate L16 | Raticate L16 |
| 3 | Kadabra L18 | Kadabra L18 | Kadabra L18 |
| 4 | Charmeleon L20 | Wartortle L20 | Ivysaur L20 |

Add to `backend/data/rival.json` (or equivalent):
```json
{
  "stage": "ss_anne",
  "location": "ss_anne_deck",
  "trigger": "approach_captains_room",
  "dialogue_before": "Hey! What are you doing here? I didn't know they let the riff-raff on board!",
  "dialogue_after": "Hmph! I'll get the better of you next time! I'm going to go explore more of this ship!"
}
```

**Captain NPC dialogue tree:**
1. **Pre-event:** "Urp... I feel seasick... *blurgh*... Could you rub my back? I feel terrible..."
2. **Player interacts:** Screen action (back rub), Captain feels better
3. **Post-event:** "Ah, I feel so much better! Thank you! Here, take this as thanks!" -> Gives HM01 Cut
4. **Post-HM:** "I feel great now! We'll be setting sail soon though. You should head back to shore!"

---

### B4: Route 11 Map + Trainers + Encounters

**Files to modify:**
- `backend/data/maps.json` -- Add `route_11` map
- `backend/data/trainers.json` -- Add Route 11 trainers
- `backend/data/encounter_tables.json` -- Add `route_11` encounters
- `backend/data/npcs.json` -- Add Route 11 gate guard

**Map definition:**
```json
{
  "id": "route_11",
  "name": "route_11",
  "display_name": "Route 11",
  "map_type": "route",
  "width": 30,
  "height": 20,
  "connections": [
    {"direction": "west", "target_map_id": "vermilion_city", "entry_x": 29, "entry_y": 15}
  ],
  "npcs": [
    {"npc_id": "route_11_gate_guard", "x": 28, "y": 10, "facing": "left"}
  ],
  "trainers": [
    {"trainer_id": "route11_youngster_1", "x": 10, "y": 10, "facing": "right", "sight_range": 3},
    {"trainer_id": "route11_gambler_1", "x": 18, "y": 8, "facing": "down", "sight_range": 4},
    {"trainer_id": "route11_engineer_1", "x": 24, "y": 14, "facing": "left", "sight_range": 3}
  ],
  "encounter_zones": [
    {"x": 3, "y": 3, "width": 10, "height": 6, "encounter_table_id": "route_11"},
    {"x": 16, "y": 10, "width": 8, "height": 5, "encounter_table_id": "route_11"}
  ],
  "buildings": []
}
```

**Route 11 trainers:**

| ID | Name | Class | Team |
|----|------|-------|------|
| `route11_youngster_1` | Eddie | Youngster | Nidoran-M L19, Nidorino L19 |
| `route11_gambler_1` | Rich | Gambler | Voltorb L18, Magnemite L18, Voltorb L18 |
| `route11_engineer_1` | Bernie | Engineer | Magnemite L21, Magneton L21 |

**Encounter table:**
```json
"route_11": {
  "name": "Route 11",
  "encounter_type": "grass",
  "base_encounter_rate": 0.15,
  "encounters": [
    {"species_id": 23, "min_level": 15, "max_level": 19, "weight": 20},
    {"species_id": 21, "min_level": 15, "max_level": 17, "weight": 15},
    {"species_id": 50, "min_level": 15, "max_level": 19, "weight": 15},
    {"species_id": 39, "min_level": 14, "max_level": 18, "weight": 15},
    {"species_id": 100, "min_level": 14, "max_level": 18, "weight": 20},
    {"species_id": 81, "min_level": 15, "max_level": 19, "weight": 15}
  ]
}
```

**Gate guard NPC:**

| NPC ID | Name | Location | Dialogue |
|--------|------|----------|----------|
| `route_11_gate_guard` | Guard | Route 11 east end | "This road leads to Route 12 and Lavender Town, but the way is under construction. Come back later!" |

---

### B5: New Items (HM01 Cut) + Vermilion Mart Stock

**Files to modify:**
- `backend/data/items.json` -- Add HM01 Cut
- `backend/services/item_service.py` -- Ensure HM items are key items (can't toss/sell)

**New item in `items.json`:**
```json
{
  "id": 53,
  "name": "HM01 Cut",
  "description": "A Hidden Machine that teaches Cut to a Pokemon. Cut can be used to chop down small trees in the overworld.",
  "category": "key_item",
  "price": 0,
  "sell_price": 0,
  "effect": "teach_move",
  "move_name": "Cut",
  "usable": true
}
```

**Vermilion Mart stock** (add to shop data for `vermilion_pokemart`):
- Poke Ball (id: 1)
- Great Ball (id: 2)
- Potion (id: 5)
- Super Potion (id: 6)
- Antidote (id: 10)
- Paralyze Heal (id: 12)
- Awakening (id: 11)
- Repel (id: 20)

**Note:** HM01 Cut is a `key_item` — the existing key item protection from Sprint 12's B1 task already prevents tossing/selling. No additional logic needed.

---

### B6: S.S. Anne Event Service

**Files to create:**
- `backend/services/ss_anne_service.py`
- `backend/routes/ss_anne.py`

**Files to modify:**
- `backend/main.py` -- Register `ss_anne` router

**Service design:**
The S.S. Anne is a **story-gated multi-room event**. The player must have the S.S. Ticket (item_id: 52) to board. Once aboard, they explore rooms, battle trainers, fight the Rival, help the Captain, and receive HM01 Cut. After receiving the HM, the ship departs (area becomes inaccessible).

**Service functions:**
- `can_board(game_id)` -- Check if player has S.S. Ticket (item_id: 52) in inventory
- `get_ss_anne_state(game_id)` -- Return current state: `"docked"` (can board), `"exploring"` (player is aboard), `"rival_defeated"` (rival beaten), `"captain_helped"` (HM received), `"departed"` (ship gone, area locked)
- `board_ship(game_id)` -- Validate ticket, set state to `"exploring"`, transition to `ss_anne_deck`
- `trigger_rival_battle(game_id)` -- Called when player approaches Captain's Room door on deck. Sets up rival battle via existing `rival_service`. State -> `"rival_battle"`
- `complete_rival_battle(game_id)` -- After rival defeated. State -> `"rival_defeated"`
- `help_captain(game_id)` -- Player interacts with Captain. Call `give_item(game_id, 53, 1)` to give HM01 Cut. Set flag `has_hm_cut`. State -> `"captain_helped"`
- `depart_ship(game_id)` -- Called when player exits ship after helping captain. Ship departs. State -> `"departed"`. S.S. Anne rooms become inaccessible.

**API Endpoints** (prefix: `/api/ss-anne`):

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/ss-anne/state/{game_id}` | Get S.S. Anne event state |
| `POST` | `/ss-anne/board` | Board the ship (requires S.S. Ticket) |
| `POST` | `/ss-anne/rival` | Trigger rival battle on deck |
| `POST` | `/ss-anne/rival-complete` | Record rival defeat |
| `POST` | `/ss-anne/captain` | Help the captain, receive HM01 Cut |
| `POST` | `/ss-anne/depart` | Ship departs after captain helped |

**Request models:**
```python
class SSAnneRequest(BaseModel):
    game_id: str

class BoardShipRequest(BaseModel):
    game_id: str
    # Ticket validation done server-side via inventory check
```

---

### B7: Lt. Surge Gym + Trash Can Puzzle Service

**Files to create:**
- `backend/services/surge_gym_service.py`
- `backend/routes/surge_gym.py`

**Files to modify:**
- `backend/data/gyms.json` -- Add Vermilion Gym definition
- `backend/main.py` -- Register `surge_gym` router

**Gym definition in `gyms.json`:**
```json
{
  "id": "vermilion_gym",
  "name": "Vermilion City Gym",
  "city": "Vermilion City",
  "type_specialty": "electric",
  "badge_name": "Thunder Badge",
  "badge_id": "thunder",
  "map_id": "vermilion_gym",
  "gym_trainers": ["vermilion_gym_trainer_1"],
  "prerequisite_badge": "cascade",
  "puzzle_type": "trash_can_switches",
  "leader": {
    "id": "lt_surge",
    "name": "Lt. Surge",
    "sprite_id": "lt_surge",
    "badge_id": "thunder",
    "reward_money": 2400,
    "ai_difficulty": "hard",
    "dialogue_before": "Hey kid! What do you think you're doing here? You won't live long in combat! I tell you what, kid, electric Pokemon saved me during the war! They zapped my enemies into paralysis! The same Pokemon saved me will zap you!",
    "dialogue_after": "Now that's a shocker! You're the real deal, kid! Fine, take the Thunder Badge!",
    "pokemon_team": [
      {"species_id": 100, "name": "Voltorb", "level": 21, "moves": ["Sonic Boom", "Screech", "Tackle", "Self-Destruct"]},
      {"species_id": 25, "name": "Pikachu", "level": 18, "moves": ["Thunder Wave", "Quick Attack", "Thunder Shock", "Double Team"]},
      {"species_id": 26, "name": "Raichu", "level": 24, "moves": ["Thunderbolt", "Thunder Wave", "Quick Attack", "Slam"]}
    ]
  }
}
```

**Vermilion Gym map in `maps.json`:**
```json
{
  "id": "vermilion_gym",
  "name": "vermilion_gym",
  "display_name": "Vermilion City Gym",
  "map_type": "gym",
  "width": 12,
  "height": 15,
  "connections": [],
  "npcs": [
    {"npc_id": "vermilion_gym_guide", "x": 2, "y": 12, "facing": "right"}
  ],
  "trainers": [
    {"trainer_id": "vermilion_gym_trainer_1", "x": 6, "y": 8, "facing": "down", "sight_range": 3}
  ],
  "encounter_zones": [],
  "buildings": [],
  "puzzle": {
    "type": "trash_can_switches",
    "grid_width": 5,
    "grid_height": 3,
    "total_cans": 15,
    "switches_required": 2
  }
}
```

**Gym trainer:**

| ID | Name | Class | Team |
|----|------|-------|------|
| `vermilion_gym_trainer_1` | Rocker | Gentleman | Voltorb L20, Magnemite L20 |

**Trash Can Puzzle service functions:**
- `get_puzzle_state(game_id)` -- Return which cans have been checked, whether switch 1 and switch 2 are found, whether puzzle is solved
- `init_puzzle(game_id)` -- Randomly place 2 switches in 2 of the 15 trash cans. Switch 1 and Switch 2 must be adjacent (horizontally or vertically)
- `check_can(game_id, can_index)` -- Player checks a trash can (0-14):
  - If no switch found: "Nope, there's no switch here."
  - If switch 1 found (first switch): "Hey! There's a switch here! You pressed it!" -> record switch 1 found
  - If switch 2 found (second switch, after switch 1): "Hey! There's another switch! The door opened!" -> puzzle solved, path to Lt. Surge unlocked
  - If wrong can checked after switch 1 found: "Nope, there's no switch here. Oh! The first switch reset!" -> both switches reset, re-randomize positions
- `is_puzzle_solved(game_id)` -- Check if path to Lt. Surge is open
- `reset_puzzle(game_id)` -- Re-randomize switch positions (called on failed second switch)

**API Endpoints** (prefix: `/api/surge-gym`):

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/surge-gym/state/{game_id}` | Get puzzle state + gym progress |
| `POST` | `/surge-gym/init` | Initialize puzzle (randomize switches) |
| `POST` | `/surge-gym/check-can` | Check a trash can for a switch |
| `POST` | `/surge-gym/battle` | Start Lt. Surge battle (requires puzzle solved) |

**Request model for check-can:**
```python
class CheckCanRequest(BaseModel):
    game_id: str
    can_index: int  # 0-14
```

---

### B8: Diglett's Cave Connection Wiring

**Files to modify:**
- `backend/data/maps.json` -- Update `digletts_cave` map to add connections, update `route_2` to add Diglett's Cave entrance building

**Changes to `digletts_cave` map:**
Add connections to make it a traversable tunnel between Vermilion and Route 2:
```json
{
  "id": "digletts_cave",
  "connections": [
    {"direction": "south", "target_map_id": "digletts_cave_entrance", "entry_x": 3, "entry_y": 0},
    {"direction": "north", "target_map_id": "route_2", "entry_x": 5, "entry_y": 30}
  ]
}
```

**Add to `route_2` buildings array:**
```json
{"name": "Diglett's Cave Entrance", "x": 3, "y": 28, "width": 4, "height": 4, "door_x": 5, "door_y": 28, "interior_map_id": "digletts_cave"}
```

**Note:** The `digletts_cave` map and its encounter table already exist from a previous sprint. This task only wires the connections so the player can traverse between Vermilion City and Route 2.

---

### B9: New Quest Definitions

**Files to modify:**
- `backend/services/quest_service.py` -- Add 3 new quests to `_QUEST_DEFS`

**New quests:**

| Quest ID | Name | Type | Objectives | Prerequisites | Rewards |
|----------|------|------|-----------|---------------|---------|
| `ss_anne_event` | S.S. Anne Voyage | main | Board S.S. Anne, defeat Rival, help Captain | `bill_rescue` (has S.S. Ticket) | HM01 Cut, 800 exp, flag `has_hm_cut`, flag `ss_anne_complete` |
| `thunder_badge` | Thunder Badge Challenge | main | Solve trash can puzzle, defeat Lt. Surge | `cascade` badge | Thunder Badge, 1000 exp, flag `thunder_badge` |
| `fan_club_visit` | Pokemon Fan Club | side | Visit the Fan Club Chairman, listen to his story | None | 300 exp, flag `fan_club_visited` |

**Quest definitions:**
```python
{
    "id": "ss_anne_event",
    "name": "S.S. Anne Voyage",
    "description": "Board the S.S. Anne luxury liner with your S.S. Ticket. Explore the ship, battle your Rival, and help the seasick Captain.",
    "type": "main",
    "objectives": [
        {"type": "board_ship", "target": "ss_anne", "required": 1},
        {"type": "defeat_rival", "target": "ss_anne", "required": 1},
        {"type": "help_captain", "target": "ss_anne_captain", "required": 1}
    ],
    "rewards": {"exp": 800, "money": 0, "items": [{"item_id": 53, "quantity": 1}], "unlock_flags": ["has_hm_cut", "ss_anne_complete"]},
    "prerequisite_quests": ["bill_rescue"],
    "status": "locked"
},
{
    "id": "thunder_badge",
    "name": "Thunder Badge Challenge",
    "description": "Solve the trash can puzzle in Vermilion Gym and defeat Lt. Surge to earn the Thunder Badge!",
    "type": "main",
    "objectives": [
        {"type": "solve_puzzle", "target": "vermilion_gym", "required": 1},
        {"type": "defeat_gym_leader", "target": "lt_surge", "required": 1}
    ],
    "rewards": {"exp": 1000, "money": 2400, "items": [], "unlock_flags": ["thunder_badge"]},
    "prerequisite_quests": ["cascade_badge"],
    "status": "locked"
},
{
    "id": "fan_club_visit",
    "name": "Pokemon Fan Club",
    "description": "Visit the Pokemon Fan Club in Vermilion City and listen to the Chairman's Pokemon stories.",
    "type": "side",
    "objectives": [
        {"type": "talk_to_npc", "target": "fan_club_chairman", "required": 1}
    ],
    "rewards": {"exp": 300, "money": 0, "items": [], "unlock_flags": ["fan_club_visited"]},
    "prerequisite_quests": [],
    "status": "available"
}
```

**New story flags:** `has_hm_cut`, `ss_anne_complete`, `thunder_badge`, `fan_club_visited`, `ss_anne_departed`

---

## Frontend Tasks (frontend-dev)

### F1: Vermilion City Rendering + Buildings + NPCs

**Files to modify:**
- `frontend/js/routes.js` -- Add Vermilion City tile layout (port city, docks, buildings)
- `frontend/js/map.js` -- Add Vermilion City collision data
- `frontend/js/sprites.js` -- Add Vermilion City building sprites, dock tiles, sailor NPC sprites, Lt. Surge sprite
- `frontend/js/npc.js` -- Register all Vermilion NPCs
- `frontend/js/signs.js` -- Add Vermilion City signs ("Vermilion City - The Port of Exquisite Sunsets")

**Vermilion City rendering:**
- 30x30 tile city: port theme with dock tiles at south, buildings in center/north
- Harbor area at bottom: wooden dock tiles, water, S.S. Anne ship sprite visible
- Pokemon Center (west), Poke Mart (center-north), Vermilion Gym (west-center), Fan Club (east-center)
- Diglett's Cave entrance (northwest corner)
- Tree borders, flowers, fences
- Gate to Route 6 at north, gate to Route 11 at east

**Integration Checklist (F1):**
- [ ] `POST /api/map/transition` from Route 6 south returns Vermilion City
- [ ] All buildings enterable (Pokemon Center, Poke Mart, Gym, Fan Club, House, Diglett's Cave)
- [ ] Nurse Joy healing works in Vermilion Pokemon Center
- [ ] Poke Mart shop works with correct stock
- [ ] Dock guard blocks boarding without S.S. Ticket
- [ ] All NPC dialogues display
- [ ] Signs display city name
- [ ] `POST /api/map/transition` east returns Route 11
- [ ] No 404s in Network tab during city exploration

---

### F2: S.S. Anne Rendering + Multi-Room Navigation + Rival Battle + Captain Cutscene

**Files to create:**
- `frontend/js/ssanne.js` -- S.S. Anne event module

**Files to modify:**
- `frontend/js/routes.js` -- Add S.S. Anne room tile layouts (deck, cabins, kitchen, captain's room)
- `frontend/js/map.js` -- Add S.S. Anne collision data
- `frontend/js/sprites.js` -- Add ship interior tiles (wooden deck, metal walls, beds, kitchen equipment, captain desk), Rival sprite (reuse), Captain sprite, sailor sprites
- `frontend/js/cutscene.js` -- Add `captain_help` scene and `ss_anne_departure` scene to `SCENES`
- `frontend/js/api.js` -- Add S.S. Anne API calls
- `frontend/js/rival.js` -- Wire S.S. Anne rival battle stage
- `frontend/index.html` -- Include `ssanne.js`

**Module: `ssanne.js`:**
- `loadSSAnneState(gameId)` -- Call `GET /api/ss-anne/state/{game_id}`, determine current phase
- `boardShip(gameId)` -- Call `POST /api/ss-anne/board`, transition to deck
- `checkTicket(gameId)` -- Verify player has S.S. Ticket before boarding
- `triggerRivalBattle(gameId)` -- Call `POST /api/ss-anne/rival`, start rival battle UI
- `completeRivalBattle(gameId)` -- Call `POST /api/ss-anne/rival-complete`
- `helpCaptain(gameId)` -- Trigger captain cutscene, call `POST /api/ss-anne/captain`
- `departShip(gameId)` -- Call `POST /api/ss-anne/depart`, play departure cutscene, teleport player to Vermilion dock

**Cutscene: `captain_help`:**
```javascript
[
  {type: 'dialogue', name: 'Captain', lines: ["Urp... I feel so seasick... *blurgh*...", "Could you... rub my back? I feel terrible..."]},
  {type: 'callback', fn: () => SSAnne.helpCaptain(gameId)},
  {type: 'wait', duration: 1000},
  {type: 'dialogue', name: 'Captain', lines: ["Ah... that's much better! Thank you, young one!", "Here, take this as my gratitude!"]},
  {type: 'callback', fn: () => SSAnne.receiveHMCut(gameId)},
  {type: 'dialogue', name: 'System', lines: ["Received HM01 Cut!"]},
  {type: 'dialogue', name: 'Captain', lines: ["That HM teaches Cut to your Pokemon!", "It can chop down small trees blocking your path.", "We'll be setting sail soon though. You should head back to shore!"]},
  {type: 'set_flag', flag: 'has_hm_cut'}
]
```

**Cutscene: `ss_anne_departure`:**
```javascript
[
  {type: 'fade', direction: 'out', duration: 500},
  {type: 'dialogue', name: 'System', lines: ["The S.S. Anne is departing..."]},
  {type: 'wait', duration: 1500},
  {type: 'fade', direction: 'in', duration: 500},
  {type: 'set_flag', flag: 'ss_anne_departed'}
]
```

**S.S. Anne room rendering:**
- **Deck:** Wooden planks, railings, ocean visible at edges, stairs down to cabins/kitchen, door to Captain's Room at north
- **Cabins:** Corridor with cabin doors on both sides, beds visible, passengers
- **Kitchen:** Tables, cooking equipment, chef NPC
- **Captain's Room:** Small room with desk, globe, bed, Captain NPC hunched over

**Rival encounter flow:**
1. Player approaches Captain's Room door on deck
2. Rival walks in from right side: "Hey! What are you doing here?"
3. Pre-battle dialogue
4. Standard trainer battle (uses rival_service)
5. Post-battle dialogue, Rival leaves
6. Path to Captain's Room now clear

**Integration Checklist (F2):**
- [ ] `GET /api/ss-anne/state/{game_id}` returns 200
- [ ] `POST /api/ss-anne/board` returns 200 with S.S. Ticket
- [ ] `POST /api/ss-anne/board` returns 403 without S.S. Ticket
- [ ] Deck renders with trainers, sailors, room entrances
- [ ] Cabins render with trainers, passengers
- [ ] Kitchen renders with chef, sailor trainer
- [ ] Rival battle triggers when approaching Captain's Room
- [ ] Rival battle uses existing battle system correctly
- [ ] Captain cutscene plays fully (dialogue -> back rub -> HM received)
- [ ] HM01 Cut appears in player inventory
- [ ] Ship departure cutscene plays when exiting after Captain helped
- [ ] S.S. Anne rooms inaccessible after departure (dock guard: "The S.S. Anne has departed.")
- [ ] No 404s in Network tab during entire S.S. Anne sequence

---

### F3: Lt. Surge Gym Rendering + Trash Can Puzzle UI

**Files to create:**
- `frontend/js/surgegym.js` -- Trash can puzzle module

**Files to modify:**
- `frontend/js/routes.js` -- Add Vermilion Gym interior tile layout
- `frontend/js/map.js` -- Add Vermilion Gym collision data
- `frontend/js/sprites.js` -- Add Lt. Surge sprite, trash can sprites (unchecked, checked, switch found), electric barrier sprite
- `frontend/js/gym.js` -- Wire Vermilion Gym with puzzle prerequisite
- `frontend/js/api.js` -- Add Surge Gym API calls
- `frontend/index.html` -- Include `surgegym.js`

**Module: `surgegym.js`:**
- `loadPuzzleState(gameId)` -- Call `GET /api/surge-gym/state/{game_id}`
- `initPuzzle(gameId)` -- Call `POST /api/surge-gym/init` on first gym entry
- `renderTrashCans(ctx, state)` -- Draw 15 trash cans in a 5x3 grid (rows of 5 cans)
- `checkCan(gameId, canIndex)` -- Call `POST /api/surge-gym/check-can`, handle response:
  - No switch: brief "empty" animation, dialogue "Nope, nothing here."
  - Switch 1 found: highlight can, dialogue "Hey! There's a switch! You pressed it!"
  - Switch 2 found: both cans highlighted, electric barriers disappear, dialogue "The second switch! The door is open!"
  - Wrong second choice: flash animation, dialogue "The switches reset!", re-randomize
- `renderBarrier(ctx, solved)` -- Electric barrier sprites blocking path to Lt. Surge; disappear when puzzle solved
- `onPuzzleSolved(gameId)` -- Remove barriers, allow player to walk to Lt. Surge

**Gym interior rendering:**
- 12x15 gym interior: electric theme (yellow/black tiles, lightning bolt decorations)
- 15 trash cans in a 5x3 grid in the center area (rows at y=5, y=7, y=9)
- Electric barriers blocking the north path to Lt. Surge (at y=3)
- Lt. Surge standing behind barriers at y=2
- Gym guide NPC near entrance
- 1 gym trainer in front of trash can area

**Integration Checklist (F3):**
- [ ] `GET /api/surge-gym/state/{game_id}` returns 200
- [ ] `POST /api/surge-gym/init` returns 200 on first entry
- [ ] `POST /api/surge-gym/check-can` returns correct result for each can
- [ ] 15 trash cans render in 5x3 grid
- [ ] Checking empty can shows "nothing" dialogue
- [ ] Finding switch 1 shows highlight + dialogue
- [ ] Finding switch 2 shows barrier removal animation
- [ ] Wrong second switch shows reset animation + dialogue
- [ ] Electric barrier visually disappears when puzzle solved
- [ ] Lt. Surge battle triggers after walking past removed barrier
- [ ] Gym leader battle uses existing gym battle system
- [ ] Thunder Badge awarded after victory
- [ ] No 404s in Network tab during gym puzzle + battle

---

### F4: Route 11 Rendering + Diglett's Cave Entrance

**Files to modify:**
- `frontend/js/routes.js` -- Add Route 11 tile layout, Diglett's Cave entrance interior
- `frontend/js/map.js` -- Add Route 11 collision data
- `frontend/js/sprites.js` -- Add cave entrance tiles (stone archway)
- `frontend/js/npc.js` -- Register Route 11 gate guard

**Route 11 rendering:**
- Horizontal route east of Vermilion: grass patches, trainers, trees
- Gate building at east end (Route 12 blocked — dead end for Sprint 14)
- Gate guard NPC: "This way to Route 12 is under construction. Please come back later!"

**Diglett's Cave entrance interior:**
- Small 6x6 room with stone walls, cave opening at north wall
- Entering cave opening transitions to `digletts_cave` map

**Integration Checklist (F4):**
- [ ] `POST /api/map/transition` from Vermilion east returns Route 11
- [ ] Route 11 grass encounters work (`POST /api/encounter/check`)
- [ ] Route 11 trainers trigger correctly
- [ ] Gate guard dialogue at east end displays
- [ ] Diglett's Cave entrance building enterable from Vermilion City
- [ ] Cave entrance transitions to `digletts_cave` map
- [ ] Diglett's Cave traversal reaches Route 2
- [ ] No 404s in Network tab during Route 11 and Diglett's Cave traversal

---

## Backend QA Tasks (QA-A)

### QA-A1: New Species & Item Tests

**File to create:** `backend/tests/test_sprint13_species_items.py`

**Test cases (minimum 12):**
1. `test_pikachu_species_exists` -- Species ID 25 loads from species.json
2. `test_raichu_species_exists` -- Species ID 26 loads correctly
3. `test_voltorb_species_exists` -- Species ID 100 loads correctly
4. `test_magnemite_species_exists` -- Species ID 81 loads correctly
5. `test_magneton_species_exists` -- Species ID 82 loads correctly
6. `test_machop_species_exists` -- Species ID 66 loads correctly
7. `test_machoke_species_exists` -- Species ID 67 loads correctly
8. `test_pikachu_is_electric_type` -- Pikachu has "electric" type
9. `test_magnemite_dual_type` -- Magnemite has "electric" and "steel" types
10. `test_hm01_cut_item_exists` -- HM01 Cut (id: 53) exists in items.json
11. `test_hm01_is_key_item` -- HM01 Cut category is "key_item"
12. `test_hm01_cannot_be_sold` -- Selling HM01 raises ValueError

### QA-A2: Vermilion City & Map Tests

**File to create:** `backend/tests/test_vermilion_city.py`

**Test cases (minimum 12):**
1. `test_vermilion_city_map_exists` -- Vermilion City loads from maps.json
2. `test_vermilion_city_north_connection` -- North connection to Route 6
3. `test_vermilion_city_east_connection` -- East connection to Route 11
4. `test_route_6_south_connection` -- Route 6 has south connection to Vermilion City
5. `test_vermilion_pokemon_center_exists` -- Pokemon Center interior loads
6. `test_vermilion_pokemart_exists` -- Poke Mart interior loads
7. `test_vermilion_gym_map_exists` -- Gym interior loads
8. `test_vermilion_fan_club_exists` -- Fan Club interior loads
9. `test_digletts_cave_entrance_exists` -- Entrance map loads
10. `test_route_11_map_exists` -- Route 11 loads correctly
11. `test_route_11_encounters` -- Route 11 encounter table defined
12. `test_route_11_trainers_exist` -- 3 Route 11 trainers in trainers.json

### QA-A3: S.S. Anne Event Tests

**File to create:** `backend/tests/test_ss_anne.py`

**Test cases (minimum 15):**
1. `test_ss_anne_deck_map_exists` -- Deck map loads
2. `test_ss_anne_cabins_map_exists` -- Cabins map loads
3. `test_ss_anne_kitchen_map_exists` -- Kitchen map loads
4. `test_ss_anne_captains_room_exists` -- Captain's Room map loads
5. `test_can_board_with_ticket` -- `can_board()` returns True with S.S. Ticket
6. `test_cannot_board_without_ticket` -- `can_board()` returns False without ticket
7. `test_initial_state_docked` -- New game S.S. Anne state is "docked"
8. `test_board_ship_changes_state` -- Boarding sets state to "exploring"
9. `test_rival_battle_trigger` -- Rival battle stage "ss_anne" triggers correctly
10. `test_complete_rival_sets_state` -- After rival, state is "rival_defeated"
11. `test_help_captain_gives_hm` -- Helping captain gives HM01 Cut (item 53)
12. `test_captain_state_change` -- After captain, state is "captain_helped"
13. `test_depart_ship_state` -- After departure, state is "departed"
14. `test_cannot_board_after_departure` -- Cannot reboard after ship departed
15. `test_ss_anne_trainers_exist` -- All 5 S.S. Anne trainers defined

### QA-A4: Lt. Surge Gym & Puzzle Tests

**File to create:** `backend/tests/test_surge_gym.py`

**Test cases (minimum 15):**
1. `test_vermilion_gym_definition` -- Gym exists in gyms.json
2. `test_gym_type_electric` -- Type specialty is "electric"
3. `test_gym_badge_thunder` -- Badge is "thunder"
4. `test_gym_prerequisite_cascade` -- Prerequisite badge is "cascade"
5. `test_lt_surge_team_voltorb` -- Voltorb L21 in team
6. `test_lt_surge_team_pikachu` -- Pikachu L18 in team
7. `test_lt_surge_team_raichu` -- Raichu L24 in team
8. `test_puzzle_init_creates_switches` -- `init_puzzle()` places 2 switches in 15 cans
9. `test_puzzle_switches_adjacent` -- 2 switches are in adjacent cans
10. `test_check_empty_can` -- Checking empty can returns "no switch"
11. `test_find_first_switch` -- Finding switch 1 returns "switch found"
12. `test_find_second_switch_correct` -- Finding adjacent switch 2 solves puzzle
13. `test_find_second_switch_wrong` -- Wrong second switch resets both
14. `test_puzzle_reset_rerandomizes` -- After reset, switch positions change
15. `test_puzzle_solved_unlocks_leader` -- Solved puzzle allows Lt. Surge battle

### QA-A5: Quest & Integration Tests

**File to create:** `backend/tests/test_sprint13_quests.py`

**Test cases (minimum 8):**
1. `test_quest_ss_anne_event_def` -- Quest definition exists
2. `test_quest_thunder_badge_def` -- Quest definition exists
3. `test_quest_fan_club_visit_def` -- Quest definition exists
4. `test_ss_anne_quest_prerequisite` -- Requires `bill_rescue` quest
5. `test_thunder_badge_quest_prerequisite` -- Requires `cascade_badge`
6. `test_digletts_cave_connections` -- Cave has connections to entrance and Route 2
7. `test_route_2_has_cave_building` -- Route 2 has Diglett's Cave entrance building
8. `test_story_flags_set_correctly` -- All new flags (`has_hm_cut`, `ss_anne_complete`, `thunder_badge`) set after events

---

## Frontend QA Tasks (QA-B)

### QA-B1: Vermilion City Frontend Review

**Scope:** Review changes to `routes.js`, `map.js`, `sprites.js`, `npc.js`, `signs.js`

**Checklist:**
1. Verify Vermilion City renders with all 7 buildings visible
2. Check all buildings enterable via door tiles
3. Verify Pokemon Center healing works
4. Verify Poke Mart shop works with correct stock
5. Check all NPC dialogues trigger on interaction
6. Verify city signs render correctly
7. Check Route 6 -> Vermilion transition works both directions
8. Open browser Network tab -> explore city -> confirm no 404s

### QA-B2: S.S. Anne Frontend Review

**Scope:** Review `ssanne.js`, changes to `routes.js`, `cutscene.js`, `sprites.js`, `api.js`, `rival.js`

**Checklist:**
1. Verify all 6 S.S. Anne API endpoints wired in `api.js`
2. Check each API call has proper error handling
3. Verify dock guard blocks without S.S. Ticket
4. Verify dock guard allows boarding with S.S. Ticket
5. Check all 4 rooms render correctly (deck, cabins, kitchen, captain's room)
6. Verify inter-room navigation (deck -> cabins, deck -> kitchen, deck -> captain's room)
7. Check Rival battle triggers on deck near Captain's Room entrance
8. Verify Rival battle uses correct team for player's starter
9. Check Captain cutscene plays fully (dialogue -> back rub -> HM received)
10. Verify HM01 Cut appears in inventory
11. Check departure cutscene plays when exiting ship
12. Verify S.S. Anne rooms inaccessible after departure
13. Open browser Network tab -> complete entire S.S. Anne -> confirm no 404s

### QA-B3: Lt. Surge Gym Frontend Review

**Scope:** Review `surgegym.js`, changes to `routes.js`, `gym.js`, `sprites.js`, `api.js`

**Checklist:**
1. Verify all 4 Surge Gym API endpoints wired in `api.js`
2. Check 15 trash cans render in 5x3 grid
3. Verify checking empty can shows dialogue + animation
4. Check finding switch 1 highlights can + shows dialogue
5. Verify finding switch 2 removes electric barrier with animation
6. Check wrong second switch resets with animation + dialogue
7. Verify Lt. Surge battle triggers after barriers removed
8. Check Thunder Badge awarded after gym leader victory
9. Verify gym guide NPC provides puzzle hints
10. Open browser Network tab -> solve puzzle + battle -> confirm no 404s

### QA-B4: Route 11 & Diglett's Cave Frontend Review

**Scope:** Review changes to `routes.js`, `map.js`, `npc.js`, `sprites.js`

**Checklist:**
1. Verify Route 11 renders with grass patches and trainers
2. Check Route 11 encounters work in grass zones
3. Verify Route 11 trainers trigger correctly
4. Check east gate guard dialogue displays
5. Verify Diglett's Cave entrance building enterable from Vermilion
6. Check cave entrance transitions to existing Diglett's Cave
7. Verify full traversal: Vermilion -> Diglett's Cave -> Route 2
8. Open browser Network tab -> traverse Route 11 and Diglett's Cave -> confirm no 404s

---

## Risk Mitigation

### 1. S.S. Anne Complexity (HIGH RISK)
**Problem:** The S.S. Anne is the most complex multi-room event to date: 4 interior rooms, 5+ trainers, a Rival battle, a Captain cutscene, ticket gating, and one-time-only ship departure. Many moving parts.
**Mitigation:**
- Break into clear phases: B3 (data) -> B6 (service) -> F2 (frontend). Each phase is testable independently.
- The Rival battle reuses the existing `rival_service` — no new battle system needed.
- The Captain cutscene uses existing cutscene engine primitives (dialogue, callback, fade, set_flag).
- QA-A3 has 15 tests covering every state transition.
- F2 integration checklist has 12 verification points.
- If ship event proves too complex, the departure mechanic can be deferred (ship stays docked) without blocking other sprint goals.

### 2. Trash Can Puzzle — New Mechanic (HIGH RISK)
**Problem:** The trash can puzzle is a brand-new mechanic (no prior puzzle system exists). Requires randomization, adjacency checks, state management, and reset logic.
**Mitigation:**
- Puzzle logic is entirely self-contained in `surge_gym_service.py` — no changes to existing gym system.
- The adjacency constraint (switch 2 must be adjacent to switch 1) is validated in `init_puzzle()`.
- QA-A4 has 15 tests including edge cases (reset, re-randomize, solved state).
- Frontend puzzle UI is a simple grid of interactable objects — no complex animation required.
- Fallback: if puzzle proves problematic, switches can be fixed (not random) as a known-good first step.

### 3. game.js Merge Conflicts (HIGH RISK — recurring)
**Problem:** F1 (Vermilion City), F2 (S.S. Anne), and F3 (Gym puzzle) may all need minor game.js touches.
**Mitigation:**
- F2 (S.S. Anne) and F3 (Gym puzzle) use their own modules (`ssanne.js`, `surgegym.js`) — minimal game.js changes.
- Merge order: F4 (Route 11, least game.js impact) -> F1 (Vermilion City) -> F3 (Gym) -> F2 (S.S. Anne — most complex, merged last).
- Each PR rebases on main before merge.

### 4. Frontend Integration Gap (HIGH RISK — recurring)
**Problem:** Frontend builds UI without wiring API calls.
**Mitigation:**
- Every frontend task has an explicit Integration Checklist.
- QA-B must verify zero 404s in Network tab.
- Code review rejects any `.catch(() => {})`.
- Three new services (ss_anne, surge_gym, plus B8 wiring) have dedicated endpoints — easy to verify.

### 5. Rival Battle Data Dependencies (MEDIUM)
**Problem:** The S.S. Anne Rival battle requires the rival_service to support a new battle stage ("ss_anne") with team variants based on the player's starter choice.
**Mitigation:**
- The existing rival system already supports multiple stages (from previous sprints). Adding "ss_anne" stage follows the established pattern.
- Rival team data is added in B3 to `rival.json`.
- QA-A3 test #9 explicitly verifies rival battle stage setup.

### 6. Diglett's Cave Wiring (LOW)
**Problem:** The Diglett's Cave map already exists but has no connections. Adding connections might affect existing encounter behavior.
**Mitigation:**
- B8 only adds `connections` array entries — no changes to encounter zones or cave data.
- QA-A5 test #6 verifies connections work.
- The cave encounter table (`digletts_cave`) is unchanged.

---

## File Ownership Summary (Conflict Prevention)

| File | Owner | Notes |
|------|-------|-------|
| `backend/data/species.json` | backend-dev | Modify (add 7 new species) |
| `backend/data/maps.json` | backend-dev | Modify (add 10 maps, update route_6/route_2/digletts_cave connections) |
| `backend/data/gyms.json` | backend-dev | Modify (add Vermilion Gym definition) |
| `backend/data/trainers.json` | backend-dev | Modify (add 9+ trainers including gym/ship/route) |
| `backend/data/npcs.json` | backend-dev | Modify (add 12+ NPCs) |
| `backend/data/dialogues.json` | backend-dev | Modify (add Vermilion/ship/captain/rival dialogues) |
| `backend/data/encounter_tables.json` | backend-dev | Modify (add route_11) |
| `backend/data/items.json` | backend-dev | Modify (add HM01 Cut) |
| `backend/data/rival.json` | backend-dev | Modify (add ss_anne rival stage) |
| `backend/services/ss_anne_service.py` | backend-dev | New file |
| `backend/services/surge_gym_service.py` | backend-dev | New file |
| `backend/services/quest_service.py` | backend-dev | Modify (add 3 quest definitions) |
| `backend/routes/ss_anne.py` | backend-dev | New file |
| `backend/routes/surge_gym.py` | backend-dev | New file |
| `backend/main.py` | backend-dev | Modify (register 2 new routers) |
| `frontend/js/ssanne.js` | frontend-dev | New file |
| `frontend/js/surgegym.js` | frontend-dev | New file |
| `frontend/js/routes.js` | frontend-dev | Modify (Vermilion, S.S. Anne rooms, gym, Route 11) |
| `frontend/js/map.js` | frontend-dev | Modify (collision data) |
| `frontend/js/sprites.js` | frontend-dev | Modify (Vermilion tiles, ship tiles, Lt. Surge, trash cans, barriers) |
| `frontend/js/cutscene.js` | frontend-dev | Modify (add captain_help + ss_anne_departure scenes) |
| `frontend/js/npc.js` | frontend-dev | Modify (register Vermilion/ship NPCs) |
| `frontend/js/gym.js` | frontend-dev | Modify (wire Vermilion Gym with puzzle prereq) |
| `frontend/js/rival.js` | frontend-dev | Modify (add ss_anne rival battle stage) |
| `frontend/js/signs.js` | frontend-dev | Modify (add Vermilion City signs) |
| `frontend/js/api.js` | frontend-dev | Modify (10+ new API calls) |
| `frontend/index.html` | frontend-dev | Modify (2 new script tags: ssanne.js, surgegym.js) |
| `frontend/js/game.js` | frontend-dev | Modify (MINIMAL — only if needed) |
| `backend/tests/test_sprint13_species_items.py` | QA-A | New file |
| `backend/tests/test_vermilion_city.py` | QA-A | New file |
| `backend/tests/test_ss_anne.py` | QA-A | New file |
| `backend/tests/test_surge_gym.py` | QA-A | New file |
| `backend/tests/test_sprint13_quests.py` | QA-A | New file |

---

## Definition of Done

- [ ] All 5 sprint goals met
- [ ] Player can traverse: Route 6 -> Vermilion City -> Route 11 (dead end)
- [ ] Player can traverse: Vermilion City -> Diglett's Cave -> Route 2 (backtracking shortcut)
- [ ] Player can board S.S. Anne with S.S. Ticket, explore all 4 rooms
- [ ] Rival battle on S.S. Anne deck works correctly
- [ ] Captain cutscene plays, player receives HM01 Cut
- [ ] S.S. Anne departs after captain event (one-time access)
- [ ] Lt. Surge trash can puzzle works: find 2 adjacent switches, wrong guess resets
- [ ] Lt. Surge battle triggers after puzzle solved, awards Thunder Badge (Badge 3)
- [ ] All 7 new Pokemon species defined (Pikachu, Raichu, Voltorb, Magnemite, Magneton, Machop, Machoke)
- [ ] Pokemon Fan Club visitable with Chairman dialogue
- [ ] All integration checklists pass (zero 404s)
- [ ] 62+ new tests passing (12 + 12 + 15 + 15 + 8 = 62)
- [ ] Total test count >= 1,562 (1,500 + 62)
- [ ] All PRs merged to `main` without regressions
- [ ] Full test suite passes: `cd backend && python3 -m pytest`
- [ ] Player now has 3 badges: Boulder, Cascade, Thunder

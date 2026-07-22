# Sprint 10 Plan — Secret Areas, HM Overworld Puzzles & Cave System

> **Theme:** Secret Areas & Hidden Locations, HM Overworld Puzzles, Cave System
> **Sprint Start:** 2026-04-14
> **Baseline:** 93 PRs merged, 1,295 tests passing on `main`

---

## Sprint Goals

1. **Secret Area Discovery System** — Players can discover 3+ hidden areas through environmental triggers (walk on hidden tiles, interact with specific objects), with server-tracked progress and unlock conditions (badge count, item possession).
2. **HM Overworld Effects** — Cut, Surf, Strength, and Flash usable in the overworld to solve environmental puzzles (remove trees, traverse water, push boulders, illuminate caves), with full backend validation and frontend animations.
3. **Cave System** — At least 2 cave maps (Mt. Moon entrance, Diglett's Cave) with darkness mechanics, Flash illumination, cave-specific encounter tables, and proper map connections.
4. **Full Frontend-Backend Integration** — Every new API endpoint is wired to the frontend with verified 200 responses; no silent 404s.
5. **Test Coverage** — 50+ new tests covering all new endpoints, edge cases, and integration points.

---

## Task Dependencies (Build Order)

```
Phase 1 (Backend Foundation):
  B1: Secret Area models & data ──┐
  B2: HM Overworld models & data ─┤── Can be parallel
  B3: Cave map data & models ──────┘

Phase 2 (Backend Services & Routes):
  B4: Secret Area service & endpoints (depends on B1)
  B5: HM Overworld service & endpoints (depends on B2)
  B6: Cave system service & endpoints (depends on B3)

Phase 3 (Frontend — after corresponding backend is done):
  F1: Secret Area rendering & discovery UI (depends on B4)
  F2: HM Puzzle UI & animations (depends on B5)
  F3: Cave rendering & darkness (depends on B6)

Phase 4 (QA — after frontend+backend complete):
  QA-A: Backend tests for B4, B5, B6
  QA-B: Frontend integration tests for F1, F2, F3
```

**Critical Path:** B2 → B5 → F2 (HM overworld is the most complex feature)

---

## Backend Tasks (backend-dev)

### B1: Secret Area Data & Models

**Files to create:**
- `backend/data/secret_areas.json` — Secret area definitions
- `backend/models/secret_area.py` — Pydantic models

**Files to modify:**
- `backend/models/map.py` — Add `hidden_entrances` field to `GameMap`
- `backend/data/maps.json` — Add hidden entrance coordinates to existing maps

**Data structure** (`secret_areas.json`):
```json
[
  {
    "id": "viridian_secret_garden",
    "display_name": "Viridian Secret Garden",
    "map_id": "viridian_secret_garden",
    "trigger_map_id": "viridian_city",
    "trigger_type": "walk",
    "trigger_x": 15,
    "trigger_y": 18,
    "unlock_conditions": {
      "min_badges": 0,
      "required_items": [],
      "required_pokemon_count": 0
    },
    "discovery_message": "You found a hidden path through the bushes!",
    "rewards": {
      "items": [{"item_id": 10, "quantity": 1}],
      "experience": 100
    }
  }
]
```

**Pydantic models** (`secret_area.py`):
```python
class UnlockConditions(BaseModel):
    min_badges: int = 0
    required_items: list[int] = []
    required_pokemon_count: int = 0

class SecretAreaReward(BaseModel):
    items: list[dict] = []
    experience: int = 0

class SecretArea(BaseModel):
    id: str
    display_name: str
    map_id: str
    trigger_map_id: str
    trigger_type: str  # "walk", "interact", "hm_cut"
    trigger_x: int
    trigger_y: int
    unlock_conditions: UnlockConditions
    discovery_message: str
    rewards: SecretAreaReward

class SecretAreaProgress(BaseModel):
    game_id: str
    discovered_areas: list[str] = []

class DiscoverAreaRequest(BaseModel):
    game_id: str
    map_id: str
    x: int
    y: int

class DiscoverAreaResponse(BaseModel):
    discovered: bool
    area_id: Optional[str] = None
    display_name: Optional[str] = None
    message: Optional[str] = None
    rewards: Optional[SecretAreaReward] = None
```

**New model for map hidden entrances** (add to `map.py`):
```python
class HiddenEntrance(BaseModel):
    x: int
    y: int
    target_map_id: str
    entry_x: int
    entry_y: int
    visible_after_discovery: bool = True
```

Add to `GameMap`: `hidden_entrances: list[HiddenEntrance] = []`

---

### B2: HM Overworld Effect Data & Models

**Files to create:**
- `backend/data/hm_obstacles.json` — Obstacle definitions per map
- `backend/models/hm_overworld.py` — Pydantic models for HM overworld effects

**Files to modify:**
- `backend/data/maps.json` — Add `obstacles` field to maps with cuttable trees, pushable boulders, surfable water zones

**Data structure** (`hm_obstacles.json`):
```json
[
  {
    "id": "route_1_tree_1",
    "map_id": "route_1",
    "obstacle_type": "cuttable_tree",
    "x": 8,
    "y": 12,
    "hm_required": "Cut",
    "badge_required": "cascade_badge",
    "blocks_path_to": "route_1_secret_patch",
    "removed": false
  },
  {
    "id": "route_2_boulder_1",
    "map_id": "route_2",
    "obstacle_type": "pushable_boulder",
    "x": 14,
    "y": 10,
    "hm_required": "Strength",
    "badge_required": "rainbow_badge",
    "push_direction": null,
    "push_limit": 5
  },
  {
    "id": "pallet_town_water_1",
    "map_id": "pallet_town",
    "obstacle_type": "surf_zone",
    "x": 10,
    "y": 14,
    "width": 4,
    "height": 4,
    "hm_required": "Surf",
    "badge_required": "soul_badge"
  }
]
```

**Pydantic models** (`hm_overworld.py`):
```python
class HMObstacle(BaseModel):
    id: str
    map_id: str
    obstacle_type: str  # "cuttable_tree", "pushable_boulder", "surf_zone"
    x: int
    y: int
    width: int = 1
    height: int = 1
    hm_required: str  # "Cut", "Surf", "Strength", "Flash"
    badge_required: Optional[str] = None
    removed: bool = False
    push_direction: Optional[str] = None
    push_limit: int = 0

class UseHMRequest(BaseModel):
    game_id: str
    hm_move: str  # "Cut", "Surf", "Strength", "Flash"
    map_id: str
    target_x: int
    target_y: int
    pokemon_index: int  # Which party Pokemon knows the HM

class UseHMResponse(BaseModel):
    success: bool
    message: str
    obstacle_id: Optional[str] = None
    effect: Optional[str] = None  # "tree_removed", "surfing_started", "boulder_pushed", "cave_lit"
    new_state: Optional[dict] = None

class SurfStateRequest(BaseModel):
    game_id: str
    map_id: str
    x: int
    y: int

class BoulderPushRequest(BaseModel):
    game_id: str
    obstacle_id: str
    direction: str  # "up", "down", "left", "right"

class BoulderPushResponse(BaseModel):
    success: bool
    new_x: int
    new_y: int
    message: str
```

---

### B3: Cave Map Data & Models

**Files to create:**
- `backend/data/cave_maps.json` — Cave-specific map data (or extend `maps.json`)
- `backend/models/cave.py` — Cave-specific models

**Files to modify:**
- `backend/data/maps.json` — Add cave maps (mt_moon_entrance, mt_moon_b1, digletts_cave)
- `backend/data/encounter_tables.json` — Add cave encounter tables
- `backend/models/map.py` — Add `is_dark` and `cave_level` fields to `GameMap`

**New maps to add to `maps.json`:**
```json
{
  "id": "mt_moon_entrance",
  "display_name": "Mt. Moon",
  "map_type": "cave",
  "width": 25,
  "height": 30,
  "is_dark": false,
  "cave_level": 0,
  "connections": [
    {"direction": "south", "target_map_id": "route_3", "entry_x": 18, "entry_y": 0}
  ],
  "encounter_zones": [
    {"x": 3, "y": 3, "width": 20, "height": 25, "encounter_table_id": "mt_moon_1f"}
  ]
},
{
  "id": "mt_moon_b1",
  "display_name": "Mt. Moon B1F",
  "map_type": "cave",
  "width": 30,
  "height": 30,
  "is_dark": true,
  "cave_level": 1,
  "connections": []
},
{
  "id": "digletts_cave",
  "display_name": "Diglett's Cave",
  "map_type": "cave",
  "width": 15,
  "height": 40,
  "is_dark": true,
  "cave_level": 1,
  "connections": []
}
```

**New encounter tables to add:**
```json
"mt_moon_1f": {
  "encounter_type": "cave",
  "base_encounter_rate": 0.15,
  "encounters": [
    {"species_id": 41, "min_level": 7, "max_level": 10, "weight": 40},
    {"species_id": 46, "min_level": 8, "max_level": 10, "weight": 25},
    {"species_id": 35, "min_level": 8, "max_level": 12, "weight": 15},
    {"species_id": 74, "min_level": 7, "max_level": 10, "weight": 15},
    {"species_id": 27, "min_level": 8, "max_level": 10, "weight": 5}
  ]
},
"mt_moon_b1": {
  "encounter_type": "cave",
  "base_encounter_rate": 0.20,
  "encounters": [
    {"species_id": 41, "min_level": 9, "max_level": 12, "weight": 35},
    {"species_id": 46, "min_level": 9, "max_level": 12, "weight": 25},
    {"species_id": 35, "min_level": 9, "max_level": 14, "weight": 15},
    {"species_id": 74, "min_level": 9, "max_level": 12, "weight": 15},
    {"species_id": 95, "min_level": 10, "max_level": 12, "weight": 10}
  ]
},
"digletts_cave": {
  "encounter_type": "cave",
  "base_encounter_rate": 0.20,
  "encounters": [
    {"species_id": 50, "min_level": 15, "max_level": 22, "weight": 60},
    {"species_id": 51, "min_level": 25, "max_level": 31, "weight": 40}
  ]
}
```

**Cave Pydantic models** (`cave.py`):
```python
class CaveState(BaseModel):
    game_id: str
    map_id: str
    is_lit: bool = False
    visibility_radius: int = 2  # tiles visible without Flash (2 = minimal)

class FlashRequest(BaseModel):
    game_id: str
    map_id: str
    pokemon_index: int

class FlashResponse(BaseModel):
    success: bool
    visibility_radius: int  # Expands to full visibility (e.g., 10)
    message: str

class CaveTransitionRequest(BaseModel):
    game_id: str
    from_map_id: str
    ladder_x: int
    ladder_y: int

class CaveTransitionResponse(BaseModel):
    target_map_id: str
    spawn_x: int
    spawn_y: int
    is_dark: bool
    cave_level: int
```

---

### B4: Secret Area Service & Endpoints

**Files to create:**
- `backend/services/secret_area_service.py`
- `backend/routes/secret_area.py`

**Files to modify:**
- `backend/main.py` — Register `secret_area` router

**Service functions** (`secret_area_service.py`):
- `load_secret_areas()` — Load from `secret_areas.json`
- `check_tile_for_secret(game_id, map_id, x, y)` — Check if walking on a tile triggers a secret area
- `can_unlock_area(game_id, area)` — Validate unlock conditions (badges, items)
- `discover_area(game_id, area_id)` — Mark area as discovered, grant rewards
- `get_discovered_areas(game_id)` — Return list of discovered area IDs
- `is_area_discovered(game_id, area_id)` — Check single area

**API Endpoints** (prefix: `/api/secret`):

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/secret/check` | Check if current tile is a secret area trigger |
| `POST` | `/secret/discover` | Discover and unlock a secret area |
| `GET` | `/secret/progress/{game_id}` | Get all discovered areas for a game |
| `GET` | `/secret/areas` | List all secret area metadata (for debug/admin) |

---

### B5: HM Overworld Service & Endpoints

**Files to create:**
- `backend/services/hm_overworld_service.py`
- `backend/routes/hm_overworld.py`

**Files to modify:**
- `backend/main.py` — Register `hm_overworld` router
- `backend/services/move_tutor_service.py` — Import `is_hm_move()` for validation (already exists)

**Service functions** (`hm_overworld_service.py`):
- `load_hm_obstacles()` — Load from `hm_obstacles.json`
- `get_obstacles_for_map(map_id)` — Return obstacles on a specific map
- `can_use_hm(game_id, hm_move, pokemon_index)` — Validate: Pokemon knows move + player has required badge
- `use_cut(game_id, map_id, target_x, target_y, pokemon_index)` — Remove cuttable tree, update state
- `use_strength(game_id, map_id, target_x, target_y, pokemon_index)` — Enable boulder pushing on map
- `push_boulder(game_id, obstacle_id, direction)` — Move boulder 1 tile, validate no collision
- `use_surf(game_id, map_id, x, y, pokemon_index)` — Enter surf state, change movement mode
- `use_flash(game_id, map_id, pokemon_index)` — Light up dark cave
- `get_surf_state(game_id)` — Check if player is currently surfing
- `get_removed_obstacles(game_id, map_id)` — Return list of removed obstacles for map rendering

**API Endpoints** (prefix: `/api/hm`):

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/hm/use` | Use an HM move in overworld (Cut, Surf, Strength, Flash) |
| `POST` | `/hm/boulder/push` | Push a boulder in a direction |
| `GET` | `/hm/obstacles/{map_id}` | Get all obstacles on a map |
| `GET` | `/hm/obstacles/{map_id}/state/{game_id}` | Get obstacle state (removed/pushed) for a game |
| `GET` | `/hm/surf/state/{game_id}` | Check player surf state |
| `POST` | `/hm/surf/exit` | Exit surfing state |

---

### B6: Cave System Service & Endpoints

**Files to create:**
- `backend/services/cave_service.py`
- `backend/routes/cave.py`

**Files to modify:**
- `backend/main.py` — Register `cave` router
- `backend/models/map.py` — Add `is_dark: bool = False`, `cave_level: int = 0` to `GameMap`

**Service functions** (`cave_service.py`):
- `get_cave_state(game_id, map_id)` — Return darkness/visibility state
- `use_flash_in_cave(game_id, map_id, pokemon_index)` — Validate Flash + illuminate cave
- `get_cave_transition(game_id, from_map_id, ladder_x, ladder_y)` — Handle cave floor transitions (ladders/stairs)
- `is_dark_cave(map_id)` — Check if map requires Flash
- `get_cave_encounter_modifier(cave_level)` — Higher levels = higher encounter rate

**API Endpoints** (prefix: `/api/cave`):

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/cave/state/{game_id}/{map_id}` | Get cave darkness state |
| `POST` | `/cave/flash` | Use Flash to light cave |
| `POST` | `/cave/transition` | Move between cave floors |
| `GET` | `/cave/maps` | List all cave maps |

---

## Frontend Tasks (frontend-dev)

### F1: Secret Area Rendering & Discovery UI

**Files to create:**
- `frontend/js/secretareas.js` — Secret area discovery module

**Files to modify:**
- `frontend/js/game.js` — Add `'secret_discovery'` state for discovery animation
- `frontend/js/map.js` — Add hidden entrance tile collision check
- `frontend/js/renderer.js` — Render hidden entrance visuals (shimmer effect after discovery)
- `frontend/js/api.js` — Add secret area API calls
- `frontend/index.html` — Include `secretareas.js` script tag

**Module: `secretareas.js`**:
- `checkForSecretArea(mapId, x, y)` — Call `POST /api/secret/check` on each tile step
- `discoverArea(mapId, x, y)` — Call `POST /api/secret/discover`, trigger discovery animation
- `renderDiscoveryAnimation(ctx, x, y, message)` — Sparkle/reveal animation (2-second sequence)
- `renderHiddenEntrance(ctx, x, y, discovered)` — Draw hidden entrance tile (faint shimmer if undiscovered, visible path if discovered)
- `loadDiscoveredAreas(gameId)` — Call `GET /api/secret/progress/{game_id}` on map load

**game.js changes:**
- Add `'secret_discovery'` to state machine (between overworld steps)
- In overworld update loop: call `checkForSecretArea()` after each move
- Transition: `'overworld'` → `'secret_discovery'` → `'overworld'`

**Integration Checklist (F1):**
- [ ] `POST /api/secret/check` returns 200 with `{discovered: false}` for normal tiles
- [ ] `POST /api/secret/check` returns 200 with `{discovered: true, area_id: ...}` for trigger tiles
- [ ] `POST /api/secret/discover` returns 200 with rewards data
- [ ] `GET /api/secret/progress/{game_id}` returns 200 with discovered area list
- [ ] Discovery animation plays without blocking game loop
- [ ] Hidden entrance becomes visible after discovery
- [ ] No silent 404s in browser console during secret area interactions

---

### F2: HM Puzzle UI & Animations

**Files to create:**
- `frontend/js/hmpuzzles.js` — HM overworld puzzle module

**Files to modify:**
- `frontend/js/game.js` — Add `'hm_animation'` and `'surfing'` states
- `frontend/js/map.js` — Add obstacle rendering (trees, boulders) and collision for obstacles
- `frontend/js/renderer.js` — Draw cuttable trees, pushable boulders, surf water tiles
- `frontend/js/sprites.js` — Add tree, boulder, and surfing player sprites
- `frontend/js/input.js` — Add HM use prompt when facing an obstacle (A button interaction)
- `frontend/js/api.js` — Add HM overworld API calls

**Module: `hmpuzzles.js`**:
- `loadObstacles(mapId, gameId)` — Call `GET /api/hm/obstacles/{map_id}/state/{game_id}`, cache obstacle positions
- `showHMPrompt(hmMove, obstacleType)` — Display "Use Cut on this tree?" dialogue
- `useCut(gameId, mapId, x, y, pokemonIndex)` — Call `POST /api/hm/use`, play tree-cutting animation (3 frames: slash, tree shakes, tree disappears)
- `useStrength(gameId, mapId, x, y, pokemonIndex)` — Call `POST /api/hm/use`, enable boulder pushing
- `pushBoulder(gameId, obstacleId, direction)` — Call `POST /api/hm/boulder/push`, animate boulder sliding
- `startSurfing(gameId, mapId, x, y, pokemonIndex)` — Call `POST /api/hm/use`, transition player sprite to surfing sprite
- `exitSurfing(gameId)` — Call `POST /api/hm/surf/exit`, return to walking sprite
- `renderObstacles(ctx, obstacles, tileSize)` — Draw all obstacles with correct sprites
- `isObstacleAt(x, y)` — Collision check against obstacle list

**game.js changes:**
- Add `'hm_animation'` state: plays cut/strength animations, returns to overworld
- Add `'surfing'` state: alternate movement mode (water tiles only), different encounter table
- In overworld interaction (A button): check if facing an obstacle → prompt HM use
- **WARNING:** These changes touch the NPC interaction section (~lines 300-350). Coordinate with F1/F3 to avoid merge conflicts — F2 should be the LAST frontend PR merged.

**Sprite additions (`sprites.js`):**
- `drawCuttableTree(ctx, x, y)` — Small tree with dashed outline indicating cuttability
- `drawPushableBoulder(ctx, x, y)` — Round boulder with directional arrow hints
- `drawSurfingPlayer(ctx, x, y, facing)` — Player on water Pokemon (simplified Lapras)
- `drawCutAnimation(ctx, x, y, frame)` — 3-frame slash effect
- `drawBoulderPush(ctx, x, y, dx, dy, progress)` — Smooth boulder movement interpolation

**Integration Checklist (F2):**
- [ ] `GET /api/hm/obstacles/{map_id}` returns 200 with obstacle list
- [ ] `GET /api/hm/obstacles/{map_id}/state/{game_id}` returns 200 with obstacle states
- [ ] `POST /api/hm/use` with `hm_move: "Cut"` returns 200 and `effect: "tree_removed"`
- [ ] `POST /api/hm/use` with `hm_move: "Surf"` returns 200 and `effect: "surfing_started"`
- [ ] `POST /api/hm/use` with `hm_move: "Strength"` returns 200 and `effect: "strength_activated"`
- [ ] `POST /api/hm/boulder/push` returns 200 with new boulder position
- [ ] `GET /api/hm/surf/state/{game_id}` returns 200 with surfing boolean
- [ ] `POST /api/hm/surf/exit` returns 200
- [ ] Cut animation plays fully before tree disappears
- [ ] Boulder push animation is smooth (not teleporting)
- [ ] Surfing state persists across map transitions (if applicable)
- [ ] Player cannot walk on water without Surf
- [ ] Player cannot walk through uncut trees
- [ ] No silent 404s in browser console during HM interactions

---

### F3: Cave Rendering & Darkness Mechanics

**Files to create:**
- `frontend/js/cave.js` — Cave rendering and darkness module

**Files to modify:**
- `frontend/js/game.js` — Handle cave entry/exit transitions, dark cave state
- `frontend/js/map.js` — Add cave tile types (rock walls, ladders, stalagmites)
- `frontend/js/renderer.js` — Darkness overlay with radial gradient (visibility radius)
- `frontend/js/maploader.js` — Load cave maps with darkness flag
- `frontend/js/api.js` — Add cave API calls
- `frontend/index.html` — Include `cave.js` script tag

**Module: `cave.js`**:
- `enterCave(gameId, mapId)` — Call `GET /api/cave/state/{game_id}/{map_id}`, set up darkness
- `renderDarkness(ctx, playerX, playerY, visibilityRadius, canvasWidth, canvasHeight)` — Draw darkness overlay: black fill with radial gradient cutout centered on player. Without Flash: 2-tile radius (dim). With Flash: full visibility.
- `useFlash(gameId, mapId, pokemonIndex)` — Call `POST /api/cave/flash`, expand visibility with animation
- `renderFlashAnimation(ctx, x, y, frame)` — Expanding light circle animation (10 frames)
- `transitionCaveFloor(gameId, fromMapId, ladderX, ladderY)` — Call `POST /api/cave/transition`, fade-to-black transition
- `renderCaveTiles(ctx, tileData)` — Draw cave-specific tiles (dark stone walls, floor, ladders, water pools)
- `getCaveState(gameId, mapId)` — Return current cave lighting state

**Darkness rendering approach:**
```javascript
// After rendering all map tiles and sprites:
function renderDarkness(ctx, px, py, radius, w, h) {
  ctx.save();
  const gradient = ctx.createRadialGradient(px, py, 0, px, py, radius * 16);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.7, 'rgba(0,0,0,0.3)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.95)');
  ctx.fillStyle = gradient;
  ctx.globalCompositeOperation = 'source-atop';
  // Actually: fill everything dark, then punch a hole
  ctx.fillStyle = 'rgba(0,0,0,0.95)';
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
```

**game.js changes:**
- In overworld rendering: if current map `is_dark` and not lit, call `renderDarkness()`
- Cave floor transitions via ladder interaction (A button on ladder tile)
- **NOTE:** Minimize game.js changes — put logic in `cave.js`, only add state checks in game.js

**Integration Checklist (F3):**
- [ ] `GET /api/cave/state/{game_id}/{map_id}` returns 200 with `{is_lit: false, visibility_radius: 2}`
- [ ] `POST /api/cave/flash` returns 200 with `{success: true, visibility_radius: 10}`
- [ ] `POST /api/cave/transition` returns 200 with target map data
- [ ] `GET /api/cave/maps` returns 200 with cave map list
- [ ] Darkness overlay renders correctly (player visible, surroundings dark)
- [ ] Flash animation expands light radius smoothly
- [ ] Cave encounters trigger at correct rates
- [ ] Ladder interaction transitions between cave floors
- [ ] Exiting cave removes darkness overlay
- [ ] No silent 404s in browser console during cave interactions

---

## Backend QA Tasks (QA-A)

### QA-A1: Secret Area Backend Tests

**File to create:** `backend/tests/test_secret_areas.py`

**Test cases (minimum 15):**
1. `test_load_secret_areas` — Verify all secret areas load from JSON
2. `test_check_tile_normal` — Normal tile returns `{discovered: false}`
3. `test_check_tile_trigger` — Trigger tile returns area info
4. `test_discover_area_success` — Discover area with met conditions
5. `test_discover_area_insufficient_badges` — Fail when badge requirement not met
6. `test_discover_area_missing_items` — Fail when required items not in inventory
7. `test_discover_area_already_discovered` — Idempotent re-discovery
8. `test_get_progress_empty` — New game has no discovered areas
9. `test_get_progress_after_discovery` — Progress updates after discovery
10. `test_discover_area_grants_rewards` — Items/XP added to player
11. `test_discover_area_invalid_game_id` — 404 for nonexistent game
12. `test_check_tile_wrong_map` — Trigger doesn't fire on wrong map
13. `test_multiple_areas_same_map` — Multiple triggers on one map
14. `test_discover_area_endpoint_integration` — Full POST endpoint test
15. `test_progress_endpoint_integration` — Full GET endpoint test

---

### QA-A2: HM Overworld Backend Tests

**File to create:** `backend/tests/test_hm_overworld.py`

**Test cases (minimum 20):**
1. `test_load_obstacles` — All obstacles load from JSON
2. `test_get_obstacles_for_map` — Returns correct obstacles per map
3. `test_use_cut_success` — Cut removes tree when Pokemon knows Cut + has badge
4. `test_use_cut_no_move` — Fail when Pokemon doesn't know Cut
5. `test_use_cut_no_badge` — Fail when player lacks required badge
6. `test_use_cut_wrong_target` — Fail when no tree at target coordinates
7. `test_use_cut_already_removed` — Idempotent: cutting already-removed tree
8. `test_use_strength_success` — Strength activates boulder pushing
9. `test_push_boulder_success` — Boulder moves one tile in direction
10. `test_push_boulder_blocked` — Boulder can't move into wall/another boulder
11. `test_push_boulder_limit` — Boulder stops after push_limit moves
12. `test_use_surf_success` — Surfing state activated on water tile
13. `test_use_surf_no_water` — Fail when not adjacent to water
14. `test_surf_state_persists` — Surf state check returns true while surfing
15. `test_exit_surf` — Surfing state cleared
16. `test_use_flash_success` — Cave lit up (delegates to cave service)
17. `test_use_hm_invalid_game` — 404 for nonexistent game
18. `test_obstacle_state_per_game` — Different games have independent obstacle states
19. `test_removed_obstacles_list` — Returns correct removed obstacles
20. `test_hm_use_endpoint_integration` — Full POST endpoint test

---

### QA-A3: Cave System Backend Tests

**File to create:** `backend/tests/test_cave_system.py`

**Test cases (minimum 15):**
1. `test_cave_maps_exist` — Mt. Moon and Diglett's Cave in map data
2. `test_cave_maps_have_dark_flag` — `is_dark` correctly set
3. `test_cave_encounter_tables_exist` — Cave encounter tables loaded
4. `test_cave_encounter_rates` — Cave encounter rates within expected range
5. `test_cave_state_default_dark` — New cave entry is dark with radius 2
6. `test_flash_lights_cave` — Flash expands visibility to 10
7. `test_flash_requires_hm_move` — Fail without Flash move
8. `test_flash_requires_badge` — Fail without required badge (if any)
9. `test_cave_transition_valid` — Ladder leads to correct floor
10. `test_cave_transition_invalid_coords` — Fail for non-ladder tile
11. `test_cave_maps_list` — List endpoint returns cave maps
12. `test_cave_state_persists` — Flash state maintained during session
13. `test_cave_encounter_species` — Correct Pokemon species in cave tables
14. `test_cave_level_modifier` — Higher cave level = higher encounter rate
15. `test_dark_cave_identification` — `is_dark_cave()` correctly identifies dark caves

---

## Frontend QA Tasks (QA-B)

### QA-B1: Secret Area Frontend Review

**Scope:** Review `secretareas.js`, changes to `game.js`, `map.js`, `renderer.js`, `api.js`

**Checklist:**
1. Verify `api.js` has all 4 secret area endpoints wired
2. Check each API call has proper error handling (NOT `.catch(() => {})`)
3. Verify discovery animation doesn't block game loop (uses requestAnimationFrame)
4. Check hidden entrance visibility toggle works correctly
5. Verify `checkForSecretArea()` is called on every tile step in game.js
6. Open browser Network tab → walk around → confirm no 404s to `/api/secret/*`
7. Check that secret area progress loads on map initialization

---

### QA-B2: HM Puzzle Frontend Review

**Scope:** Review `hmpuzzles.js`, changes to `game.js`, `sprites.js`, `input.js`, `map.js`, `api.js`

**Checklist:**
1. Verify `api.js` has all 8 HM overworld endpoints wired
2. Check each API call has proper error handling
3. Verify obstacle collision prevents walking through uncut trees / unpushed boulders
4. Check cut animation has all 3 frames and plays smoothly
5. Verify boulder push animation uses interpolation (not instant teleport)
6. Check surfing state transition: walking sprite → surfing sprite
7. Verify surfing movement is restricted to water tiles
8. Check HM prompt appears when facing obstacle and pressing A
9. Open browser Network tab → use each HM → confirm no 404s to `/api/hm/*`
10. Verify game.js merge: no broken state transitions from NPC interaction conflicts

---

### QA-B3: Cave Frontend Review

**Scope:** Review `cave.js`, changes to `game.js`, `renderer.js`, `maploader.js`, `api.js`

**Checklist:**
1. Verify `api.js` has all 4 cave endpoints wired
2. Check each API call has proper error handling
3. Verify darkness overlay renders centered on player position
4. Check visibility radius: 2 tiles without Flash, 10 with Flash
5. Verify Flash animation expands smoothly (10 frames)
6. Check cave entry transition (screen effect)
7. Verify cave exit properly removes darkness overlay
8. Check ladder interaction triggers floor transition
9. Open browser Network tab → enter cave → use Flash → confirm no 404s to `/api/cave/*`
10. Verify cave encounters work at correct rates

---

## Risk Mitigation

### 1. game.js Merge Conflicts (HIGH RISK)
**Problem:** F1, F2, and F3 all modify `game.js`, especially the NPC interaction section (~lines 300-350).
**Mitigation:**
- Merge order: F1 (secret areas) → F3 (caves) → F2 (HM puzzles) — F2 has the most state changes
- Each frontend PR must rebase on main before merge
- Team lead reviews game.js changes in each PR before merge approval
- F1 and F3 should add state checks OUTSIDE the 300-350 NPC block where possible

### 2. Frontend Integration Gap (HIGH RISK — recurring)
**Problem:** Frontend builds UI without wiring API calls, using `.catch(() => {})` to hide 404s.
**Mitigation:**
- Every frontend task has an explicit Integration Checklist (see above)
- QA-B must open browser Network tab and verify zero 404s for each feature
- Code review must reject any `.catch(() => {})` patterns
- Frontend-dev must run backend server during development (`python3 -m uvicorn main:app --reload --port 8001`)

### 3. Frontend Finishes Faster Than Backend (MEDIUM)
**Problem:** Frontend-dev completes tasks 30-50% faster.
**Mitigation:**
- Frontend-dev starts with F1 (secret areas) — simpler feature, gives backend time to complete B4/B5
- If frontend finishes early: assign sprite preparation for cave tiles, or begin Shell/stub work for next sprint
- F2 (HM puzzles) depends on B5 completing first — natural pacing

### 4. Backend-dev Skips Bug Fixes (MEDIUM)
**Problem:** Backend-dev prioritizes new features over bug fixes.
**Mitigation:**
- If bug fixes emerge from QA-A testing, assign as ONLY task (block feature PRs)
- Bug fix PR must merge before any new feature PR review begins

### 5. Cave Darkness Performance (LOW)
**Problem:** Radial gradient darkness overlay might cause frame drops on slower machines.
**Mitigation:**
- Use `globalCompositeOperation` approach (GPU-accelerated in most browsers)
- Cache gradient object if player hasn't moved
- Test with 60fps target on the game loop

---

## File Ownership Summary (Conflict Prevention)

| File | Owner | Notes |
|------|-------|-------|
| `backend/models/secret_area.py` | backend-dev | New file |
| `backend/models/hm_overworld.py` | backend-dev | New file |
| `backend/models/cave.py` | backend-dev | New file |
| `backend/services/secret_area_service.py` | backend-dev | New file |
| `backend/services/hm_overworld_service.py` | backend-dev | New file |
| `backend/services/cave_service.py` | backend-dev | New file |
| `backend/routes/secret_area.py` | backend-dev | New file |
| `backend/routes/hm_overworld.py` | backend-dev | New file |
| `backend/routes/cave.py` | backend-dev | New file |
| `backend/data/secret_areas.json` | backend-dev | New file |
| `backend/data/hm_obstacles.json` | backend-dev | New file |
| `backend/data/maps.json` | backend-dev | Modify (add caves, hidden entrances) |
| `backend/data/encounter_tables.json` | backend-dev | Modify (add cave tables) |
| `backend/models/map.py` | backend-dev | Modify (add fields) |
| `backend/main.py` | backend-dev | Modify (register routers) |
| `frontend/js/secretareas.js` | frontend-dev | New file |
| `frontend/js/hmpuzzles.js` | frontend-dev | New file |
| `frontend/js/cave.js` | frontend-dev | New file |
| `frontend/js/game.js` | frontend-dev | Modify (SEQUENCED — see merge order) |
| `frontend/js/map.js` | frontend-dev | Modify |
| `frontend/js/renderer.js` | frontend-dev | Modify |
| `frontend/js/sprites.js` | frontend-dev | Modify |
| `frontend/js/input.js` | frontend-dev | Modify |
| `frontend/js/maploader.js` | frontend-dev | Modify |
| `frontend/js/api.js` | frontend-dev | Modify |
| `frontend/index.html` | frontend-dev | Modify |
| `backend/tests/test_secret_areas.py` | QA-A | New file |
| `backend/tests/test_hm_overworld.py` | QA-A | New file |
| `backend/tests/test_cave_system.py` | QA-A | New file |

---

## Definition of Done

- [ ] All 5 sprint goals met
- [ ] All integration checklists pass (zero 404s)
- [ ] 50+ new tests passing
- [ ] Total test count ≥ 1,345 (1,295 + 50)
- [ ] All PRs merged to `main` without regressions
- [ ] Full test suite passes: `cd backend && python3 -m pytest`
- [ ] Game playable: can discover a secret area, use Cut/Surf/Strength, enter and navigate a cave with Flash

# Pixel Pokemon Game

A retro pixel-art Pokemon game built with HTML5 Canvas and Python FastAPI. 9 sprints of content with battles, gyms, trading, breeding, fishing, and more.

**GitHub:** https://github.com/tomqiaozc/pixel-pokemon-game

## Features

### Core Gameplay (Sprints 1-4)
- **Overworld Exploration** — 5+ interconnected maps with 60fps movement, collision, camera
- **Starter Selection** — Bulbasaur, Charmander, or Squirtle with IV-calculated stats
- **Turn-based Battles** — Gen 1 damage formula, STAB, 18-type effectiveness, critical hits
- **Wild Encounters** — per-route spawn tables, time-of-day filtering, configurable rates
- **Pokemon Catching** — catch rate calculation, auto-deposit to PC when party full
- **Trainer Battles** — line-of-sight detection, 3-tier AI (wild/trainer/leader)
- **Gym System** — Pewter City gym, badge collection, gym puzzles
- **Evolution & EXP** — level-up evolution with animations, move learning
- **Items & Shop** — buy/sell, potions/revives/status heals, Pokeballs
- **Pokemon Center** — heal team, PC Box storage
- **Pokedex** — seen/caught tracking, species detail view

### Advanced Systems (Sprints 5-6)
- **Status Conditions** — 6 primary + volatile conditions, stat stages (-6 to +6)
- **Pokemon Abilities** — 15+ abilities (Intimidate, Levitate, Wonder Guard, etc.)
- **Weather System** — Rain, Sun, Sandstorm, Hail with battle modifiers
- **Day/Night Cycle** — real-time lighting, time-based encounters
- **Trading** — Pokemon trading between players
- **PvP Battles** — multiplayer battle lobby with matchmaking
- **Leaderboard** — player stats, rankings, trainer card

### Story & Content (Sprint 7)
- **Quest System** — story quests, area gating, progress flags, quest markers
- **Rival System** — scaling team, encounters at story checkpoints
- **Cutscene Engine** — scripted sequences for key story moments
- **Mini-Games** — Game Corner with slots, memory match, quiz; coin currency, prizes
- **Legendary Pokemon** — overworld aura, special battle mechanics, unique catch rates

### Farming & Breeding (Sprint 8)
- **Berry Farming** — 10 types, 7 plots, real-time growth, watering, battle effects
- **Pokemon Breeding** — daycare, egg groups, gender, IV inheritance, step-based hatching
- **Achievements** — 35 achievements, 8 categories, medal tiers, notifications

### Fishing, Items & Moves (Sprint 9)
- **Fishing** — cast/bite/reel QTE, 3 rod tiers, 14 water Pokemon species
- **Surfing** — overworld water movement, water encounters
- **Held Items** — 28 items with battle effects (Focus Sash, Life Orb, Leftovers, etc.)
- **Evolution Stones** — 5 stones with Eevee eeveelutions
- **Move Tutor** — 3 tutors with badge requirements, move costs
- **TM/HM System** — 10 TMs (single-use) + 5 HMs (reusable, non-deletable)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5 Canvas, Vanilla JavaScript (42 modules) |
| Backend | Python 3.11+, FastAPI, Pydantic |
| Art | Programmatic pixel art (Canvas API, no external images) |
| Storage | In-memory with JSON seed data |
| Tests | pytest — **1295 automated tests** |
| PRs | 92 merged, sprint-based with QA gates |

## Getting Started

### Backend
```bash
cd backend
pip install fastapi uvicorn pydantic
python3 -m uvicorn main:app --reload --port 8001
```

### Frontend
```bash
python3 -m http.server 8000 --directory frontend
```

Open **http://localhost:8000** in your browser.

### Run Tests
```bash
cd backend
python3 -m pytest -q
```

## Controls

| Key | Action |
|-----|--------|
| W / Arrow Up | Move up |
| A / Arrow Left | Move left |
| S / Arrow Down | Move down |
| D / Arrow Right | Move right |
| Z / Enter | Confirm / Interact / Fish |
| X / Escape | Cancel / Pause menu |
| 1-4 | Select move in battle |

## Project Structure

```
pixel-pokemon-game/
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   └── js/                     # 42 modules
│       ├── game.js             # Main game loop & state machine
│       ├── api.js              # Backend API client
│       ├── renderer.js         # Canvas rendering & camera
│       ├── map.js              # Tile map & collision
│       ├── sprites.js          # Programmatic sprite drawing
│       ├── battle.js           # Battle UI & animations
│       ├── menu.js             # Pause menu, inventory, TM/HM bag
│       ├── berry.js            # Berry farming UI
│       ├── daycare.js          # Daycare & breeding UI
│       ├── fishing.js          # Fishing mini-game & surfing
│       ├── movetutor.js        # Move Tutor & TM/HM UI
│       ├── achievements.js     # Achievement UI & notifications
│       ├── minigames.js        # Game Corner mini-games
│       ├── legendary.js        # Legendary encounter effects
│       ├── quests.js           # Quest system & markers
│       ├── rival.js            # Rival NPC system
│       └── ... (25 more modules)
├── backend/
│   ├── main.py                 # FastAPI app & router registration
│   ├── models/                 # 15 Pydantic model files
│   ├── routes/                 # 16 API route files
│   ├── services/               # 10 business logic services
│   ├── data/                   # JSON seed data (species, moves, items, maps)
│   └── tests/                  # 33 test files, 1295 tests
└── README.md
```

## Development

Built with an autonomous agent team using sprint-based development:
- **Team Lead** (Opus) — orchestration, code review, merge management
- **Frontend Dev** (Haiku) — HTML5 Canvas game client
- **Backend Dev** (Haiku) — FastAPI server & business logic
- **QA Tester A** (Haiku) — gap coverage tests & backend bugs
- **QA Tester B** (Haiku) — frontend code review & integration testing

Each sprint: Dev → QA → Bug Fix → Merge. 92 PRs merged through Sprint 9.

### Next: Sprint 10 (Planned)
- Secret Areas & Hidden Locations
- HM Overworld Puzzles (Cut, Surf, Strength)
- Cave System exploration

# Development Handoff — Sprint 9 Complete

> **Instructions for AI:** Read this document to understand the full project state, then assemble a 6-agent development team to continue from Sprint 10. Follow the team configuration, sprint workflow, and known patterns below.

## Project: Pixel Pokemon Game

**Repo:** `tomqiaozc/pixel-pokemon-game`
**Main branch:** `main` — all 93 PRs merged, 1295 tests passing
**Last sprint completed:** Sprint 9 (2026-03-28)

## Completed Sprints Summary

| Sprint | Focus | Key PRs |
|--------|-------|---------|
| 1 | Core engine: Canvas, game loop, tile map, movement, collision | #1-#5 |
| 2 | Starters, wild encounters, battle UI, NPC dialogue | #6-#15 |
| 3 | Evolution, items/shop, Pokemon Center, PC Box, Pokedex | #16-#30 |
| 4 | Multi-route overworld, trainer AI, gym/badge system | #31-#45 |
| 5 | Status conditions, abilities, weather, day/night cycle | #46-#55 |
| 6 | Trading, PvP battles, leaderboard, achievements (basic) | #56-#70 |
| 6.5 | Full frontend-backend integration audit & wiring | #71-#75 |
| 7 | Story quests, rival system, cutscenes, mini-games, legendary Pokemon | #76-#82 |
| 8 | Berry farming, Pokemon breeding/daycare, expanded achievements/medals | #83-#89 |
| 9 | Fishing/surfing, held items, evolution stones, Move Tutor, TM/HM system | #90-#93 |

## Architecture

### Frontend (42 JS modules)
- **No framework** — vanilla JS with HTML5 Canvas
- **Programmatic pixel art** — all sprites drawn via Canvas API, no external images
- **16x16 tiles**, 60fps game loop in `game.js`
- **State machine** in `game.js` controls all modes (overworld, battle, menu, shop, etc.)
- Key files: `game.js` (main loop), `battle.js` (battle UI), `renderer.js` (canvas), `map.js` (collision), `api.js` (backend client)

### Backend (Python FastAPI)
- **FastAPI** with Pydantic models, in-memory storage
- **Structure:** `models/` (15 files), `routes/` (16 files), `services/` (10 files), `data/` (JSON seed data)
- **Tests:** 33 test files, 1295 passing tests in `backend/tests/`
- **Server:** `python3 -m uvicorn main:app --reload --port 8001`

### Serving
- Backend: port 8001 (uvicorn)
- Frontend: port 8000 (`python3 -m http.server 8000 --directory frontend`)

## Known Patterns & Lessons (Critical for Team Management)

### 1. Frontend Integration Gap (RECURRING — Sprints 4, 5, 6, 8, 9)
Frontend-dev builds beautiful visual modules but doesn't wire API calls to the backend. Uses `.catch(() => {})` that silently swallows 404 errors, making bugs invisible during testing. **Mitigation:** Every frontend task MUST include an integration checklist: "verify each API call returns 200, not 404." QA-B should check network tab for failed requests.

### 2. Backend-dev Skips Bug Fixes
Backend-dev consistently prioritizes new feature work over assigned bug fix tasks. **Mitigation:** Assign bug fixes as the ONLY task (no feature tasks in parallel). Hold PR merges as leverage — "bug fix PR must merge before feature PR review begins."

### 3. Frontend Finishes Faster Than Backend
Frontend sprint tasks complete 30-50% faster. **Mitigation:** Give frontend meatier tasks, or assign UI prep/shell tasks for the NEXT sprint while QA runs on the current sprint.

### 4. game.js Merge Conflicts
`game.js` is the central state machine — nearly every sprint touches the NPC interaction section around lines 300-350. Multiple PRs modifying this area in the same sprint WILL conflict. **Mitigation:** Sequence frontend PRs that touch game.js, don't merge concurrently.

### 5. QA Gap Test Maintenance
When bug fix PRs change behavior, the QA gap tests that originally detected those bugs need updating. Always run full test suite after merging bug fixes and update test assertions.

## Sprint 10 Plan (Next Up)

**Theme:** Secret Areas & Hidden Locations, HM Overworld Puzzles, Cave System

### Backend Tasks
- Secret area discovery system: hidden triggers, unlock conditions, progress tracking
- HM overworld effects: Cut (remove obstacles), Surf (water movement), Strength (push boulders)
- Cave system: new map data, dark cave mechanics, encounter tables

### Frontend Tasks
- Secret area map rendering, discovery animations, hidden entrance visuals
- HM puzzle UI: tree cutting animation, boulder pushing, water surfing transitions
- Cave rendering: darkness overlay, flash mechanic, cave-specific encounters

### QA Tasks
- QA-A: HM puzzle mechanics, secret area unlock conditions, cave encounters
- QA-B: HM visual effects, secret area maps, discovery UI flow

## Team Configuration

| Role | Agent Type | Notes |
|------|-----------|-------|
| team-lead | Opus | Orchestration, code review, merge management, conflict resolution |
| product-manager | Haiku | Sprint planning, task breakdown, requirement docs |
| frontend-dev | Haiku | HTML5 Canvas game client, all 42 JS modules |
| backend-dev | Haiku | FastAPI server, models, routes, services, tests |
| qa-tester (QA-A) | Haiku | Backend-focused: gap coverage tests, backend bug detection |
| qa-tester-2 (QA-B) | Haiku | Frontend-focused: UI code review, integration testing, API wiring |

## Sprint Workflow

1. **PM plans** sprint tasks (or team lead creates from prior plan)
2. **Frontend-dev & backend-dev** work in parallel on feature branches
3. **QA-A** reviews backend after backend PR ready
4. **QA-B** reviews frontend after frontend PR ready
5. **Bug fix cycle** — bugs assigned back to devs, must fix before moving on
6. **Merge** — team lead resolves conflicts, merges to main
7. **Full test suite** — verify 1295+ tests pass, fix any regressions

## Git Workflow (for each developer)

1. `git checkout main && git pull origin main`
2. `git checkout -b feature/TASK_DESCRIPTION`
3. Implement, commit, push
4. `gh pr create --title "..." --body "..."`
5. Team lead reviews and merges
6. Back to main for next task

## GitHub Notes
- User's GitHub account: `tomqiaozc`
- If push fails with auth error, run: `gh auth switch --user tomqiaozc`
- PRs target `main` branch
- Total PRs merged: 93

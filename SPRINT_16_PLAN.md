# Sprint 16 Plan: Team Rocket Hideout & Saffron City Gate

**Sprint:** 16
**Theme:** Team Rocket Hideout (under Celadon Game Corner), Saffron City access
**Prerequisites:** Sprint 15 (Celadon City, Game Corner)

---

## Overview

The Team Rocket Hideout is a multi-floor underground base hidden beneath the Celadon Game Corner. The player discovers a secret staircase behind a poster and must navigate through the hideout, battling Rocket Grunts and solving puzzles to confront Giovanni. Defeating Giovanni earns the Silph Scope, enabling ghost identification in Pokemon Tower (retroactive unlock). Saffron City gates open after clearing the hideout.

## Story Arc

- Player investigates the poster in Celadon Game Corner
- Secret staircase leads to Rocket Hideout B1F
- Navigate 4 basement floors (B1F-B4F) with spin tile puzzles
- Battle Rocket Grunts and Rocket Admins
- Confront Giovanni on B4F
- Receive Silph Scope after defeating Giovanni
- Saffron City guard gates now let player through

---

## Backend Tasks

### B1: Maps Data
- rocket_hideout_b1f (14x14, interior) — entrance from game corner
- rocket_hideout_b2f (14x14, interior) — spin tile puzzle floor
- rocket_hideout_b3f (14x14, interior) — item storage floor
- rocket_hideout_b4f (14x14, interior) — Giovanni's office
- saffron_gate_north (8x6, interior), saffron_gate_south (8x6, interior)

### B2: Rocket Hideout Service (new service)
- State machine: not_entered → b1f_entered → b2f_cleared → b3f_cleared → giovanni_defeated
- Endpoints: get_state, enter_hideout, clear_floor, defeat_giovanni
- defeat_giovanni gives Silph Scope (item 54) and unlocks saffron gates

### B3: Trainers & NPCs
- Rocket Grunt x6 (2 per floor on B1F-B3F)
- Rocket Admin x1 (B3F boss)
- Giovanni (B4F)
- Saffron Gate Guards x2

### B4: Encounter Tables & Items
- No wild encounters (indoor hideout)
- Lift Key (id:58) — needed for elevator between floors
- Items found on floors: Rare Candy, TM inventory

### B5: Quest Definitions
- team_rocket_hideout (main) — defeat Giovanni, obtain Silph Scope

---

## Frontend Tasks

### F1: Rocket Hideout B1F-B4F floor layouts (14x14 each)
### F2: Spin tile puzzle mechanic (visual only — arrow tiles that auto-slide player)
### F3: Giovanni's office — desk, bookshelf aesthetic
### F4: Saffron gate interiors
### F5: Sprites: Giovanni, Rocket Admin
### F6: API wiring for Rocket Hideout service

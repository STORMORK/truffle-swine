# Sprint 23 Plan: Cerulean Cave & Mewtwo

**Sprint:** 23
**Theme:** Cerulean Cave (post-game dungeon) + Mewtwo & Mew
**Prerequisites:** Sprint 22 (Legendary Birds), Sprint 21 (Champion defeated)

---

## Overview

The ultimate post-game challenge. Cerulean Cave is only accessible after becoming Champion. It contains the most powerful wild Pokemon in Kanto, culminating in a confrontation with Mewtwo. Mew is a secret legendary accessible via special conditions.

## Story Arc

- Guard at Cerulean Cave entrance only lets Champion through
- Navigate 3 floors of challenging wild encounters
- Mewtwo at the deepest level (B1F)

---

## Backend Tasks

### B1: New Pokemon Species (2 new)
- Mewtwo (id:150) — Psychic
- Mew (id:151) — Psychic

### B2: Maps Data
- cerulean_cave_1f (16x16, cave)
- cerulean_cave_2f (16x16, cave)
- cerulean_cave_b1f (14x14, cave — Mewtwo chamber)

### B3: Encounter Tables
- cerulean_cave (high-level wild Pokemon: Golbat, Graveler, Kadabra, etc.)

### B4: NPCs
- Cave Guard NPC (blocks entrance until Champion)

### B5: Quests
- cerulean_cave (side — explore the cave)
- legendary_mewtwo (side — find and catch Mewtwo)

---

## Frontend Tasks

### F1: Cerulean Cave map builders (3 floors)
### F2: Map registrations and connections from Cerulean City
### F3: Guard NPC at entrance

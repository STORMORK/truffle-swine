# Sprint 21 Plan: Elite Four & Champion

**Sprint:** 21
**Theme:** Elite Four (Lorelei, Bruno, Agatha, Lance) + Champion Rival battle
**Prerequisites:** Sprint 20 (All 8 badges, Indigo Plateau reached)

---

## Overview

The Pokemon League at Indigo Plateau. The player must defeat four consecutive elite trainers and the Champion (rival) to become the Pokemon League Champion. This is the climax of the Gen 1 story.

## Story Arc

- Player enters the Pokemon League building
- Battles Lorelei (Ice), Bruno (Fighting), Agatha (Ghost), Lance (Dragon) in sequence
- Final battle against Champion (the rival)
- Hall of Fame ceremony upon victory

---

## Backend Tasks

### B1: New Pokemon Species (5 new)
- Dewgong (id:87) — Water/Ice
- Cloyster (id:91) — Water/Ice
- Lapras (id:131) — Water/Ice
- Dragonair (id:148) — Dragon
- Dragonite (id:149) — Dragon/Flying

### B2: Maps Data
- elite_four_lobby (10x10, interior)
- lorelei_room (12x12, interior)
- bruno_room (12x12, interior)
- agatha_room (12x12, interior)
- lance_room (12x14, interior)
- champion_room (14x14, interior)
- hall_of_fame (10x10, interior)

### B3: Elite Four & Champion
- Elite Four service: sequential battle state machine
- Lorelei: Ice specialist
- Bruno: Fighting specialist
- Agatha: Ghost specialist
- Lance: Dragon specialist
- Champion: mixed team

### B4: Items
- No new items needed

### B5: Quests
- elite_four (main)
- champion (main — final quest)

---

## Frontend Tasks

### F1: Elite Four rooms (themed by type)
### F2: Champion room
### F3: Hall of Fame
### F4: Sprites: Lorelei, Bruno, Agatha, Lance
### F5: Elite Four API wiring

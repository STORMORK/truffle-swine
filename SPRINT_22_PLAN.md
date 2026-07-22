# Sprint 22 Plan: Legendary Birds

**Sprint:** 22
**Theme:** Seafoam Islands (Articuno), Power Plant (Zapdos), Victory Road (Moltres)
**Prerequisites:** Sprint 21 (Elite Four complete)

---

## Overview

Post-game legendary Pokemon encounters. The three legendary birds are hidden in special dungeons across Kanto. Players must explore these areas to encounter and catch them.

## Locations

- Seafoam Islands: multi-floor ice cave on Routes 20/21 — Articuno at the bottom
- Power Plant: abandoned building east of Route 10 — Zapdos inside
- Victory Road: deep chamber accessible after beating Elite Four — Moltres

---

## Backend Tasks

### B1: New Pokemon Species (3 new)
- Articuno (id:144) — Ice/Flying
- Zapdos (id:145) — Electric/Flying
- Moltres (id:146) — Fire/Flying

### B2: Maps Data
- seafoam_islands_1f (14x14, cave)
- seafoam_islands_b1f (14x14, cave)
- seafoam_islands_b2f (14x14, cave — Articuno)
- power_plant (16x16, interior)
- moltres_chamber (10x10, cave — Victory Road extension)

### B3: Encounter Tables
- seafoam_islands (Seel, Dewgong, Shellder, etc.)
- power_plant (Voltorb, Electrode, Magnemite, etc.)

### B4: Items
- No new items needed

### B5: Quests
- legendary_articuno (side)
- legendary_zapdos (side)
- legendary_moltres (side)

---

## Frontend Tasks

### F1: Seafoam Islands map builders (3 floors)
### F2: Power Plant map builder
### F3: Moltres Chamber map builder
### F4: Map registrations and connections
### F5: Legendary encounter API wiring

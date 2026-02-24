# Mini Minecraft (Browser Prototype)

This repository contains a lightweight, no-build browser prototype inspired by Minecraft.

## What was added in this update

- Survival stats (health/hunger) with simple hunger drain and starvation/fall damage.
- Day/night visual cycle overlay.
- Basic game mode cycling (`Survival`, `Creative`, `Spectator`) via `G`.
- Additional block physics examples:
  - Gravity-like falling blocks (`Sand`)
  - Very simple fluid spread (`Water`, `Lava`)

> Important: This is still a compact prototype, **not** a full Minecraft parity implementation. Building complete parity (all biomes, dimensions, mobs, redstone behavior, multiplayer, mod API, etc.) requires a large multi-module engine project.

## Run

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Controls

- Move: `A/D` or `←/→`
- Jump/Fly up: `W` / `Space` / `↑`
- Fly down (spectator): `S` / `↓`
- Mine block: Click
- Place selected block: `Shift + Click`
- Change selected block: use inventory buttons
- Cycle game mode: `G`

## Suggested next step for your full request

If you want, I can now add a **complete engineering plan** in this repo for full-feature parity (world/chunks, redstone sim, entities/AI, dimensions, networking, save formats, plugin/mod interfaces), broken into milestones and staffing estimates.

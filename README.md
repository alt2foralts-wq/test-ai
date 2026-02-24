# Mini Minecraft (Browser Prototype)

This repository contains a lightweight, no-build browser prototype inspired by Minecraft, focused on being playable directly in a web browser.

## What was improved for browser playability

- Added **touch-friendly controls** for left/right/jump/down.
- Added an **Action toggle** (`Mine` / `Place`) so mobile users can place blocks without Shift.
- Added a **Restart** button for quick recovery if the player dies or gets stuck.
- Kept desktop controls (`A/D`, jump, `G` mode cycling, click/Shift+click) intact.

## Existing gameplay systems

- Survival stats (health/hunger) with simple hunger drain and starvation/fall damage.
- Day/night visual cycle overlay.
- Basic game mode cycling (`Survival`, `Creative`, `Spectator`) via `G`.
- Additional block physics examples:
  - Gravity-like falling blocks (`Sand`)
  - Very simple fluid spread (`Water`, `Lava`)

> Important: This is still a compact prototype, **not** a full Minecraft parity implementation.

## Run

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Controls

### Desktop
- Move: `A/D` or `←/→`
- Jump/Fly up: `W` / `Space` / `↑`
- Fly down (spectator): `S` / `↓`
- Mine block: Click
- Place selected block: `Shift + Click`
- Change selected block: inventory buttons
- Cycle game mode: `G`

### Mobile / Touch
- Use on-screen arrow/jump/down buttons
- Tap canvas to perform selected action (`Mine` or `Place`)
- Switch action with the **Action** button

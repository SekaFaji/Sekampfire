# Sekampfire

**Four seasons. One fire.**

A replayable, pixel-art survival game about collecting wood, tending a campfire and building a small woodland settlement before the cold catches up.

[**Play Sekampfire in your browser**](https://sekafaji.github.io/Sekampfire/) | [Report an issue](https://github.com/SekaFaji/Sekampfire/issues) | [Development history](docs/DEVELOPMENT_HISTORY.md)

[![Build and test](https://github.com/SekaFaji/Sekampfire/actions/workflows/ci.yml/badge.svg)](https://github.com/SekaFaji/Sekampfire/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/SekaFaji/Sekampfire/actions/workflows/pages.yml/badge.svg)](https://github.com/SekaFaji/Sekampfire/actions/workflows/pages.yml)

> **Development status:** Playable browser project under active development. The First Settlement progression and Long Night survival finale are implemented; further campaign content, mobile testing and balancing are ongoing. This is not yet a native Android or iOS release.

## The game

Chop trees, carry real logs home and keep your fire burning through changing days and nights. As you survive, expand your camp and invest earned Ash in improvements for future runs.

- **Fire and survival:** Feed Pine Logs to the campfire, manage fuel and Warmth, and survive changing weather and Cold exposure.
- **Build and craft:** Establish fences, a Workbench and Log Storage; improve camp stations and craft useful gear.
- **Progress between runs:** Bank Ash, buy permanent upgrades and gradually improve your starting conditions. Fire Capacity can grow from 100 to 500 fuel.
- **A living forest:** Four seasons, wildlife, environmental effects, auroras and shooting stars.
- **Companions and collectibles:** Bingsu, the loyal Dogo Argentino, helps retrieve logs; discover unique logs for the camp Museum.
- **Local progress:** Permanent progress and unfinished-run checkpoints use browser local storage.

### Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Move | `A` / `D` or Left / Right arrows | Hold the left or right edge |
| Chop, interact, tend fire | `E` or Space | `ACT` |
| Shop category | `C` while Upgrades is open | Tap a category |
| Navigate menus | Arrow keys and Enter | Tap on-screen controls |

An illustrated **How to Play** guide is available in the game.

## Run locally

**Requirements:** Node.js 22 or newer and npm.

```bash
npm ci
npm run dev
```

Vite prints the local development URL. To run all validation checks and build the production site:

```bash
npm run validate
npm run preview
```

The available individual commands are `npm run repo:check` (repository structure and local documentation links), `npm run check` (TypeScript), `npm run test` (Vitest), and `npm run build` (output in `dist/`). The production site is deployed from `main` through GitHub Actions to GitHub Pages.

## Project layout

| Location | Responsibility |
| --- | --- |
| `src/App.tsx` | React shell, Canvas lifecycle and browser integration |
| `src/game/` | Game simulation, mechanics, drawing, UI, audio and tests |
| `src/ui/` | Viewport and display scaling utilities |
| `public/` | Static published files, including the privacy policy |
| `docs/` | Architecture, design, roadmap and development archives |
| `.github/` | Automated checks, deployment and collaboration templates |

The game uses **TypeScript, React, Vite, Canvas 2D and Vitest**. Rendering uses a native 320 x 180 logical canvas, scaled for the viewport.

## Documentation

| Guide | What's inside |
| --- | --- |
| [Documentation index](docs/README.md) | Start here to find the right document |
| [Architecture](docs/ARCHITECTURE.md) | Codebase map, save boundaries and engineering rules |
| [Current backlog](docs/BACKLOG.md) | Next priorities and outstanding QA |
| [Design notes](docs/IDEAS.md) | Gameplay direction and decisions still open |
| [Mobile plan](docs/MOBILE.md) | Android-first packaging roadmap |
| [Changelog](CHANGELOG.md) | Concise recent milestones and links to verified pull requests |
| [Development history](docs/DEVELOPMENT_HISTORY.md) | Full archived patch-by-patch README history |
| [Contributing](CONTRIBUTING.md) | How to report issues and propose changes |
| [Privacy policy](public/privacy.html) | Published browser-game privacy information |

## Feedback and community

Bugs and suggestions belong in [GitHub Issues](https://github.com/SekaFaji/Sekampfire/issues). If you are changing code, read the [contribution guide](CONTRIBUTING.md) before opening a pull request.

Created by [SekaFaji](https://github.com/SekaFaji). Follow the project on [YouTube](https://youtube.com/@sekafajigames) or join the [community Discord](https://discord.gg/794QQWJEeP).

**License:** No open-source license is currently included in this repository. Public access to source code does not, by itself, grant permission to reuse the code or artwork.

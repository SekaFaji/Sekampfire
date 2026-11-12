# Contributing to Sekampfire

Thanks for helping improve Sekampfire. Bug reports, feedback and focused contributions are welcome.

## Before you start

- Check the [README](README.md) for the current game and [active backlog](docs/BACKLOG.md) for known priorities.
- Use the [bug report](https://github.com/SekaFaji/Sekampfire/issues/new/choose) or feature-request issue form to describe changes before proposing larger additions.
- Keep unrelated game logic, artwork and balance out of a documentation or maintenance patch.
- Do not treat old patch notes as current behavior. See the [architecture guide](docs/ARCHITECTURE.md) and source.

## Local development

You need Node.js 22 or newer and npm.

```bash
npm ci
npm run dev
```

Before requesting a review, run:

```bash
npm run validate
```

This executes TypeScript checks, Vitest tests and a production build. CI runs the same gates on pull requests.

## Pull requests

1. Create a branch for one clearly scoped change.
2. Explain the problem, the solution and any user-visible differences.
3. Add or update focused tests for affected gameplay, purchases, UI hit zones or persistence.
4. State whether `npm run validate` passed and link to relevant evidence.
5. Include actual screenshots for visual changes when available; never present a mockup as a screenshot of the running game.
6. Call out anything not tested on a real device instead of marking it verified.
7. Update the appropriate current documentation when behavior or plans change.

## Compatibility and project rules

- Keep the game at its 320 x 180 native rendering resolution and preserve touch/keyboard access.
- Respect existing permanent progress and unfinished-run save keys. Changes to save formats require deliberate, tested migrations.
- Use existing resources and gameplay systems; avoid unverified balance values or duplicate currency.
- Do not introduce analytics, ads, network calls or native plugins without explicit design and privacy review.
- Keep the root README concise. Detailed change rationale belongs in the PR and the relevant documents.
- Follow repository permissions and applicable rights for code, art and other contributions. **The repository currently has no open-source license.**

For a larger change, open an issue to discuss its intended behavior before implementing it.

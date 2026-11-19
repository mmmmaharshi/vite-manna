# Project

Bible reading app (manna) built with Vite+ and React 19. Offline-first: all data is stored locally in IndexedDB (Dexie); there is no backend.

## Coding Standards (must follow)

- Follow the `$coding-standards` skill — required reading, must follow for every change. Load it before starting work.
- Code style is enforced by [Ultracite](https://www.ultracite.ai/): `bun run check` verifies it, `bun run fix` applies it.

## Commands

- Run everything through the scripts in `package.json`.
- `vp` is the `vite-plus` runner behind those scripts (`bun run test` = `vp test run`).

## Branching

- Commit and push directly to `main`. No `dev` branch and no PR flow.

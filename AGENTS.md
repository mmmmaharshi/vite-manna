# Project

Bible reading app (manna) built with Vite + React 19.

## Tech Stack

- **Framework**: React 19, TypeScript 6, Vite 8
- **Styling**: Tailwind CSS v4, HeroUI v3 (React Aria), tailwind-merge, clsx
- **State**: Zustand, Dexie (IndexedDB)
- **Routing**: React Router 7
- **Icons**: @gravity-ui/icons, @fontsource-variable/google-sans
- **Utils**: date-fns, es-toolkit, @reactuses/core, html-to-image

## Scripts

- `bun run dev` — Start dev server
- `bun run build` — Typecheck + build
- `bun run test` — Run Vitest tests
- `bun run lint` — ESLint
- `bun run preview` — Preview production build

## Git Workflow

- Feature branches: `feat/<brief-description>`
- PR into `dev` for integration
- PR from `dev` into `main` for production releases
- No direct commits to `dev` or `main`
- Always run `bun run lint` and `bun run test` before committing
- **Bump `package.json` version** before every PR into `main` (use semver: `major.minor.patch`)

## Testing

- Vitest for unit/integration tests
- Playwright (via `webapp-testing` skill) for E2E smoke tests
- Test against relevant agent skills after implementing a feature, then commit

## Available Agent Skills

- `webapp-testing` — Playwright-based E2E browser testing
- `web-quality-audit`, `performance`, `accessibility`, `seo`, `core-web-vitals`, `best-practices` — Web quality optimization
- `heroui-react` — HeroUI v3 component docs
- `responsive-testing` — Multi-viewport layout verification
- `product-ux-expert`, `lean-ux` — UX review and design
- `vercel-composition-patterns`, `vercel-react-best-practices` — React architecture patterns
- `refactor` — Code refactoring
- `brainstorming`, `product-brainstorming` — Design exploration
- `ce-commit` — Git commit message generation
- `satori` — Persistent session memory
- `caveman` — Token-efficient communication mode
- `find-skills` — Discover additional skills from the ecosystem

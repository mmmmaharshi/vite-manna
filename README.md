# మన్నా · Manna

> **Offline-first Telugu Bible reader** — Read, highlight, search, and share scripture. Works fully offline. Built with React 19, HeroUI v3, and Tailwind CSS v4.

[![Live Demo](https://img.shields.io/badge/demo-holymanna.vercel.app-000?style=flat&logo=vercel)](https://holymanna.vercel.app)
[![GitHub](https://img.shields.io/badge/github-mmmmaharshi/vite--manna-181717?style=flat&logo=github)](https://github.com/mmmmaharshi/vite-manna)

---

## Features

- **Full Telugu Bible** — All 66 books, every verse, offline after first load
- **Verse actions** — Copy, share, highlight (5 colors), or export as a shareable image
- **Full-text search** — Instant debounced search across all verses
- **Daily verse** — Curated verse of the day that auto-opens on first visit
- **Reading progress** — Auto-tracked chapters, streaks, and per-book stats
- **Offline PWA** — Service worker + IndexedDB means zero-loading after setup
- **Dark mode** — Light, dark, or system theme with persisted preference
- **Adjustable font size** — 5 levels from S to 2XL
- **URL permalinks** — Every verse is linkable via `?book=X&chapter=Y&verse=Z`

## Quick start

```bash
git clone https://github.com/mmmmaharshi/vite-manna.git
cd vite-manna
bun install
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) — the app downloads the Bible text on first visit (~6 MB, cached in IndexedDB).

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start dev server |
| `bun run build` | Type-check + production build |
| `bun run test` | Run Vitest tests |
| `bun run lint` | ESLint |
| `bun run preview` | Preview production build |

## Tech stack

| Category | Libraries |
|---|---|
| **Framework** | React 19, TypeScript 6, Vite 8 |
| **UI** | HeroUI v3 (React Aria), Tailwind CSS v4, tailwind-merge, clsx |
| **State** | Zustand, Dexie (IndexedDB) |
| **Routing** | React Router 7 |
| **PWA** | vite-plugin-pwa, Workbox |
| **Icons** | @gravity-ui/icons |
| **Fonts** | Google Sans (variable) |
| **Utils** | date-fns, es-toolkit, @reactuses/core, html-to-image |

## Architecture

> **Note:** The app uses a tab-based SPA layout (reader, search, highlights, progress, settings) with no traditional route-based navigation. Reader position is synced to URL query params for permalinks.

- **Offline-first**: Bible data is fetched once, parsed in chunks, and stored in Dexie. Subsequent launches read entirely from IndexedDB.
- **Service worker**: Built with Workbox `injectManifest` — caches app shell, handles `periodicsync` for daily verse notifications.
- **Zustand stores**: Reader state (book, chapter, selection) + highlight data + search index.
- **Dark mode**: Toggled via `.dark` class on `<html>`, read before React mounts to prevent flash.

## Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mmmmaharshi/vite-manna)

The app is deployed on Vercel from the `main` branch. Auto-deploys on push.

## License

MIT

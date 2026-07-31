# మన్నా · Manna

Offline-first Telugu Bible reader. All 66 books, works with no internet. React 19 + HeroUI v3 + Tailwind v4.

[![Live Demo](https://img.shields.io/badge/demo-holymanna.vercel.app-000?style=flat&logo=vercel)](https://holymanna.vercel.app) [![GitHub](https://img.shields.io/badge/github-mmmmaharshi/vite--manna-181717?style=flat&logo=github)](https://github.com/mmmmaharshi/vite-manna)

## Run it in 3 minutes

```bash
git clone https://github.com/mmmmaharshi/vite-manna.git
cd vite-manna
bun install && bun run dev
```

1. Open http://localhost:5173
2. First visit downloads the Bible (~6 MB) into IndexedDB — once.
3. After that, everything loads offline.

## What you can do

- **Read** — any book, any chapter; swipe or arrow keys to move
- **Highlight** — one tap per verse, yellow; revisit them in the Highlights tab
- **Search** — full text, all 66 books, instant
- **Share** — native share sheet, or copy a permalink to any verse
- **Adjust** — font size S to 2XL, resets to S

## Scripts

| Command | What it does |
|---|---|
| `bun run dev` | Dev server |
| `bun run build` | Type-check + production build |
| `bun run test` | Vitest |
| `bun run lint` | ESLint |

## Stack

React 19 · TypeScript 6 · Vite 8 · HeroUI v3 · Tailwind v4 · Zustand · Dexie · React Router 7 · Workbox PWA · Google Sans

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mmmmaharshi/vite-manna)

Vercel, `main` branch, auto-deploys on push.

## License

MIT

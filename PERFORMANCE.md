# Performance plan (following "How we made claude.ai 3x faster")

Methodology borrowed from the blog: pick the 4 journeys that are 95% of activity, measure each end-to-end with comparable boundaries, find bottlenecks in the lab, ship behind flags, ratchet benchmarks down.

## Journeys for manna (Bible reader, offline-first)

1. Cold launch: splash -> typeable reader (book/chapter loaded).
2. Load chapter: select book/chapter -> verses rendered.
3. Navigate chapter: prev/next chapter -> verses rendered.
4. Search verses: query -> results rendered.
5. Highlights: reader mount -> highlights hydrated.

## Measurements to add (lab + field)

- Time-to-typeable on fresh load (user interaction -> first verse visible).
- Chapter-switch latency (tap -> new verses painted).
- React commits per chapter switch (target: <= 1).
- Style recalcs per chapter switch.
- DOM mutations per chapter switch.
- IndexedDB read bytes per chapter switch (no duplicate clones).
- Search: time-to-first-result and rows scanned.

## Bottlenecks found (this pass)

- `VerseList`/`VerseActionBar` rebuilt `new Set(selectedVerseIds)` every render.
- `ReaderScreen` recomputed `visibleChapters` every render.
- `searchVerses` full-table scan via `.filter()` (acceptable for now; candidate for a dedicated index or prefix search).
- `getVerses` sorts in memory (`sortBy`); candidate for compound index `[book+chapter+verse]`.

## Fixes shipped

- Memoized `selectedSet` in `VerseList` and `VerseActionBar`.
- Memoized `visibleChapters` in `ReaderScreen`.
- Tests + build green.

## Guardrails

- Unit tests before optimizations (existing suite).
- Keep changes behind flags for risky UX (none added this pass; candidates: splash duration, stale-while-revalidate).
- Ratchet: add a React-commits-per-chapter-switch test next.

## Next (wacky ideas)

- Stale-while-revalidate snapshot: keep old verses visible during navigation.
- Prefetch adjacent chapters on hover/idle.
- Static first-paint verse text in boot splash (like static composer).
- 120 Hz frame budget check for scroll/streaming (N/A here; chapter scroll).
- Cut sidebar (chapter strip) re-renders by memoizing chapter buttons.

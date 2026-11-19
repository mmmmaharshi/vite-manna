import { useEffect, useState } from "react";

import { getReaderSnapshot } from "../../../shared/bible";
import { useReaderStore } from "../store/reader-store";
import type { ReaderSnapshot } from "../types";

/** The prefetch layer is a best-effort read-ahead, so it stays small and
 * evicts the oldest entry instead of growing with every chapter visited. */
const MAX_SNAPSHOT_CACHE_SIZE = 8;

let preloadedSnapshot: ReaderSnapshot | null = null;

const snapshotCache = new Map<string, ReaderSnapshot>();

const cacheKey = (book: number, chapter: number) => `${book}:${chapter}`;

const cacheSnapshot = (key: string, snapshot: ReaderSnapshot) => {
  if (
    !snapshotCache.has(key) &&
    snapshotCache.size >= MAX_SNAPSHOT_CACHE_SIZE
  ) {
    const oldest = snapshotCache.keys().next();

    if (!oldest.done) {
      snapshotCache.delete(oldest.value);
    }
  }

  snapshotCache.set(key, snapshot);
};

export const setPreloadedSnapshot = (snapshot: ReaderSnapshot) => {
  preloadedSnapshot = snapshot;
};

export const getCachedSnapshot = (book: number, chapter: number) =>
  snapshotCache.get(cacheKey(book, chapter)) ?? null;

export const prefetchReaderSnapshot = async (
  book: number,
  chapter: number,
  chapterCount?: number
) => {
  const key = cacheKey(book, chapter);

  if (snapshotCache.has(key)) {
    return;
  }

  try {
    cacheSnapshot(key, await getReaderSnapshot(book, chapter, chapterCount));
  } catch {
    // Prefetch is best-effort; the reader hook below surfaces load failures.
  }
};

interface SnapshotSinks {
  setSnapshot: (snapshot: ReaderSnapshot | null) => void;
  setLoadError: (error: string | null) => void;
}

/** Shared by the auto-load effect and the manual retry: both apply a fetched
 * snapshot to explicit sinks instead of closing over component state. */
const applySnapshot = (
  next: ReaderSnapshot,
  chapter: number,
  sinks: SnapshotSinks
) => {
  sinks.setSnapshot(next);
  sinks.setLoadError(null);

  const { setChapter, clearPendingBook } = useReaderStore.getState();

  if (next.chapter !== undefined && next.chapter !== chapter) {
    setChapter(next.chapter);
  }

  if (useReaderStore.getState().pendingBook === next.book) {
    clearPendingBook();
  }
};

const SNAPSHOT_ERROR_MESSAGE = "Unable to load this chapter. Please try again.";

const failSnapshot = (sinks: SnapshotSinks) => {
  sinks.setSnapshot(null);
  sinks.setLoadError(SNAPSHOT_ERROR_MESSAGE);
  useReaderStore.getState().clearPendingBook();
};

export interface ReaderSnapshotResult {
  snapshot: ReaderSnapshot | null;
  loadError: string | null;
  retrySnapshot: () => void;
}

export const useReaderSnapshot = (
  book: number,
  chapter: number,
  chapterCount?: number
): ReaderSnapshotResult => {
  const [snapshot, setSnapshot] = useState<ReaderSnapshot | null>(() => {
    if (preloadedSnapshot !== null && preloadedSnapshot.book === book) {
      const stored = preloadedSnapshot;
      preloadedSnapshot = null;

      return stored;
    }

    const cached = getCachedSnapshot(book, chapter);

    if (cached !== null) {
      return cached;
    }

    return null;
  });

  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const next = await getReaderSnapshot(book, chapter, chapterCount);

        if (!cancelled) {
          applySnapshot(next, chapter, { setLoadError, setSnapshot });
        }
      } catch (error) {
        if (!cancelled) {
          if (import.meta.env.DEV) {
            console.error("[Bible] Unable to load reader snapshot", error);
          }

          failSnapshot({ setLoadError, setSnapshot });
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [book, chapter, chapterCount]);

  return {
    loadError,
    retrySnapshot: () => {
      setLoadError(null);

      const retry = async () => {
        try {
          const next = await getReaderSnapshot(book, chapter, chapterCount);

          applySnapshot(next, chapter, { setLoadError, setSnapshot });
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error("[Bible] Unable to load reader snapshot", error);
          }

          failSnapshot({ setLoadError, setSnapshot });
        }
      };

      void retry();
    },
    snapshot,
  };
};

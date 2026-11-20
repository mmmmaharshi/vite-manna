import { useEffect, useState } from "react";

import { getReaderSnapshot } from "../../../shared/bible";
import { recordLastCrash } from "../../../shared/lib/persistence";
import { useReaderStore } from "../store/reader-store";
import type { ReaderSnapshot } from "../types";

const MAX_SNAPSHOT_CACHE_SIZE = 8;

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

const getCachedSnapshot = (book: number, chapter: number) =>
  snapshotCache.get(cacheKey(book, chapter)) ?? null;

/**
 * Prefetches a chapter snapshot in the background; failures are ignored
 * because the reader hook surfaces load failures itself.
 *
 * @param book - The book number.
 * @param chapter - The chapter number.
 * @param chapterCount - The known chapter count, if any.
 * @returns A promise that resolves once the prefetch settles.
 */
export const prefetchReaderSnapshot = async (
  book: number,
  chapter: number,
  chapterCount?: number
) => {
  const key = cacheKey(book, chapter);

  if (snapshotCache.has(key)) {
    return;
  }

  const next = await getReaderSnapshot(book, chapter, chapterCount).catch(
    () => null
  );

  if (next !== null) {
    cacheSnapshot(key, next);
  }
};

interface SnapshotSinks {
  setSnapshot: (snapshot: ReaderSnapshot | null) => void;
  setLoadError: (error: string | null) => void;
}

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

/**
 * The snapshot state owned by the reader hook.
 */
export interface ReaderSnapshotResult {
  snapshot: ReaderSnapshot | null;
  loadError: string | null;
  retrySnapshot: () => void;
}

/**
 * Loads the chapter snapshot for the reader, serving cached data first and
 * surfacing load failures with a retry.
 *
 * @param book - The book number.
 * @param chapter - The chapter number.
 * @param chapterCount - The known chapter count, if any.
 * @param enabled - Whether loading may start yet.
 * @returns The snapshot state and a retry action.
 */
export const useReaderSnapshot = (
  book: number,
  chapter: number,
  chapterCount?: number,
  enabled = true
) => {
  const [snapshot, setSnapshot] = useState<ReaderSnapshot | null>(() =>
    getCachedSnapshot(book, chapter)
  );

  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!enabled) {
        return;
      }

      try {
        const next = await getReaderSnapshot(book, chapter, chapterCount);

        if (!cancelled) {
          applySnapshot(next, chapter, { setLoadError, setSnapshot });
        }
      } catch (error) {
        if (!cancelled) {
          recordLastCrash("Reader snapshot failed", String(error));

          failSnapshot({ setLoadError, setSnapshot });
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [book, chapter, chapterCount, enabled]);

  return {
    loadError,
    snapshot,
    retrySnapshot: () => {
      setLoadError(null);

      const retry = async () => {
        try {
          const next = await getReaderSnapshot(book, chapter, chapterCount);

          applySnapshot(next, chapter, { setLoadError, setSnapshot });
        } catch (error) {
          recordLastCrash("Reader snapshot retry failed", String(error));

          failSnapshot({ setLoadError, setSnapshot });
        }
      };

      void retry();
    },
  };
};

import { useEffect, useState } from "react";

import { getReaderSnapshot } from "../../../shared/bible";
import { useReaderStore } from "../store/reader-store";
import type { ReaderSnapshot } from "../types";

let preloadedSnapshot: ReaderSnapshot | null = null;

const snapshotCache = new Map<string, ReaderSnapshot>();

const cacheKey = (book: number, chapter: number) => `${book}:${chapter}`;

export const setPreloadedSnapshot = (snapshot: ReaderSnapshot) => {
  preloadedSnapshot = snapshot;
};

export const getCachedSnapshot = (book: number, chapter: number) =>
  snapshotCache.get(cacheKey(book, chapter)) ?? null;

export const prefetchReaderSnapshot = (
  book: number,
  chapter: number,
  chapterCount?: number
) => {
  const key = cacheKey(book, chapter);

  if (snapshotCache.has(key)) {
    return;
  }

  void getReaderSnapshot(book, chapter, chapterCount).then((next) => {
    snapshotCache.set(key, next);
  });
};

export const useReaderSnapshot = (
  book: number,
  chapter: number,
  chapterCount?: number
): ReaderSnapshot | null => {
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

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const next = await getReaderSnapshot(book, chapter, chapterCount);

        if (!mounted) {
          return;
        }

        snapshotCache.set(cacheKey(book, chapter), next);
        setSnapshot(next);

        const { setChapter, clearPendingBook } = useReaderStore.getState();

        if (next.chapter !== undefined && next.chapter !== chapter) {
          setChapter(next.chapter);
        }

        if (useReaderStore.getState().pendingBook === next.book) {
          clearPendingBook();
        }
      } catch (error) {
        if (!mounted) {
          return;
        }

        if (import.meta.env.DEV) {
          console.error("[Bible] Unable to load reader snapshot", error);
        }

        setSnapshot(null);
        useReaderStore.getState().clearPendingBook();
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [book, chapter, chapterCount]);

  return snapshot;
};

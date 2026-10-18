import { useEffect, useState } from "react";

import { getReaderSnapshot } from "../../../shared/bible";
import { useReaderStore } from "../store/reader-store";
import type { ReaderSnapshot } from "../types";

let preloadedSnapshot: ReaderSnapshot | null = null;

export const setPreloadedSnapshot = (snapshot: ReaderSnapshot) => {
  preloadedSnapshot = snapshot;
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

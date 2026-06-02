import { useEffect, useState } from "react";

import { getReaderSnapshot } from "../../../shared/bible";
import { useReaderStore } from "../store/readerStore";
import type { ReaderSnapshot } from "../types";

let preloadedSnapshot: ReaderSnapshot | null = null;

export function setPreloadedSnapshot(snapshot: ReaderSnapshot) {
  preloadedSnapshot = snapshot;
}

export function useReaderSnapshot(
  book: number,
  chapter: number,
  chapterCount?: number,
): ReaderSnapshot | null {
  const [snapshot, setSnapshot] = useState<ReaderSnapshot | null>(() => {
    if (preloadedSnapshot !== null && preloadedSnapshot.book === book) {
      const s = preloadedSnapshot;
      preloadedSnapshot = null;
      return s;
    }
    return null;
  });

  useEffect(() => {
    let mounted = true;

    void getReaderSnapshot(book, chapter, chapterCount)
      .then((next) => {
        if (!mounted) {
          return;
        }

        setSnapshot(next);

        const { setChapter, clearPendingBook } = useReaderStore.getState();

        if (next.chapter !== undefined && next.chapter !== chapter) {
          setChapter(next.chapter);
        }

        if (
          useReaderStore.getState().pendingBook === next.book
        ) {
          clearPendingBook();
        }
      })
      .catch((error) => {
        if (!mounted) {
          return;
        }
        console.error("[Bible] Unable to load reader snapshot", error);
        setSnapshot(null);
        useReaderStore.getState().clearPendingBook();
      });

    return () => {
      mounted = false;
    };
  }, [book, chapter, chapterCount]);

  return snapshot;
}

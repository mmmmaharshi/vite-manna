import { useEffect } from "react";

import type { NamedBook } from "../../../shared/bible";
import type { ReaderSnapshot } from "../types";
import { prefetchReaderSnapshot } from "./use-reader-snapshot";

/**
 * Warms the cache for the chapters next to the one being read.
 *
 * @param book - The current book number.
 * @param chapter - The current chapter number.
 * @param selectedBook - The current book summary, if loaded.
 * @param snapshot - The current reader snapshot, if any.
 * @returns Nothing.
 */
export const usePrefetchAdjacent = (
  book: number,
  chapter: number,
  selectedBook: NamedBook | undefined,
  snapshot: ReaderSnapshot | null
) => {
  useEffect(() => {
    if (!selectedBook) {
      return;
    }

    const { chapterCount } = selectedBook;
    const chapters = snapshot?.chapters ?? [];

    const currentIndex = chapters.indexOf(chapter);
    const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;

    const nextChapter =
      currentIndex !== -1 && currentIndex < chapters.length - 1
        ? chapters[currentIndex + 1]
        : null;

    if (prevChapter !== null) {
      void prefetchReaderSnapshot(book, prevChapter, chapterCount);
    }

    if (nextChapter !== null) {
      void prefetchReaderSnapshot(book, nextChapter, chapterCount);
    }
  }, [book, chapter, selectedBook, snapshot]);
};

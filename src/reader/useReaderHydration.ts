import { useEffect, useState } from "react";

import type { BibleBook, ReaderSnapshot } from "./useReader";
import { waitForOfflineReadiness } from "../lib/offlineReadiness";
import { waitForFonts } from "../lib/waitForFonts";

const MINIMUM_SPLASH_DURATION_MS = 500;

export interface UseReaderHydrationArgs {
  book: number;
  books: BibleBook[];
  chapter: number;
  hasLoadedBooks: boolean;
  onHydrated?: () => void;
  readerSnapshot: ReaderSnapshot | null;
}

export interface UseReaderHydrationResult {
  isHydrated: boolean;
}

export function useReaderHydration({
  book,
  books,
  chapter,
  hasLoadedBooks,
  onHydrated,
  readerSnapshot,
}: UseReaderHydrationArgs): UseReaderHydrationResult {
  const [areFontsReady, setAreFontsReady] = useState(false);
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    void waitForFonts().then(() => {
      if (mounted) {
        setAreFontsReady(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    void waitForOfflineReadiness().then(() => {
      if (mounted) {
        setIsOfflineReady(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (
      isHydrated ||
      !areFontsReady ||
      !isOfflineReady ||
      !hasLoadedBooks ||
      books.length === 0 ||
      !readerSnapshot ||
      readerSnapshot.book !== book ||
      readerSnapshot.chapter !== chapter ||
      readerSnapshot.chapters.length === 0 ||
      readerSnapshot.verses.length === 0
    ) {
      return;
    }

    const timeoutId = setTimeout(
      () => setIsHydrated(true),
      MINIMUM_SPLASH_DURATION_MS,
    );

    return () => clearTimeout(timeoutId);
  }, [
    areFontsReady,
    book,
    books,
    chapter,
    hasLoadedBooks,
    isHydrated,
    isOfflineReady,
    readerSnapshot,
  ]);

  useEffect(() => {
    if (isHydrated) {
      onHydrated?.();
    }
  }, [isHydrated, onHydrated]);

  return { isHydrated };
}

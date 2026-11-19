import { useEffect, useState } from "react";

import { attachBookNames, getReaderBootstrap } from "../../../shared/bible";
import type { BibleBook } from "../types";

/**
 * The book list result.
 */
export interface UseBooksResult {
  books: BibleBook[];
  hasLoadedBooks: boolean;
  reloadBooks: () => void;
}

let cachedBooks: BibleBook[] = [];
let cachedLoaded = false;

/**
 * Loads the book list once per session, sharing one module cache.
 *
 * @param enabled - Whether loading may start yet.
 * @returns The books, their load state, and a retry action.
 */
export const useBooks = (enabled = true) => {
  const [books, setBooks] = useState<BibleBook[]>(cachedBooks);
  const [hasLoadedBooks, setHasLoadedBooks] = useState(cachedLoaded);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!enabled) {
        return;
      }

      if (cachedLoaded && reloadToken === 0) {
        return;
      }

      try {
        const { books: bookSummaries } = await getReaderBootstrap(1, 1);

        if (!mounted) {
          return;
        }

        const mapped = attachBookNames(bookSummaries);

        cachedBooks = mapped;
        cachedLoaded = true;
        setBooks(mapped);
        setHasLoadedBooks(true);
      } catch (error) {
        if (!mounted) {
          return;
        }

        if (import.meta.env.DEV) {
          console.error("[Bible] Unable to load books", error);
        }

        cachedLoaded = true;
        setHasLoadedBooks(true);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [enabled, reloadToken]);

  return {
    books,
    hasLoadedBooks,
    reloadBooks: () => {
      cachedBooks = [];
      cachedLoaded = false;
      setBooks([]);
      setHasLoadedBooks(false);
      setReloadToken((token) => token + 1);
    },
  };
};

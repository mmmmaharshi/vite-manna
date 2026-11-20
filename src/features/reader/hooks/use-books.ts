import { useEffect, useState } from "react";

import { attachBookNames, getBookSummaries } from "../../../shared/bible";
import type { NamedBook } from "../../../shared/bible";
import { recordLastCrash } from "../../../shared/lib/persistence";

/**
 * The book list result.
 */
export interface UseBooksResult {
  books: Array<NamedBook>;
  hasLoadedBooks: boolean;
  reloadBooks: () => void;
}

let cachedBooks: Array<NamedBook> = [];
let cachedLoaded = false;

/**
 * Loads the book list once per session, sharing one module cache.
 *
 * @param enabled - Whether loading may start yet.
 * @returns The books, their load state, and a retry action.
 */
export const useBooks = (enabled = true) => {
  const [books, setBooks] = useState<Array<NamedBook>>(cachedBooks);
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
        const bookSummaries = await getBookSummaries();

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

        recordLastCrash("Book list load failed", String(error));

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

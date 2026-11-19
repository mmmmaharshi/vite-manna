import { useEffect, useState } from "react";

import { attachBookNames, getReaderBootstrap } from "../../../shared/bible";
import type { BibleBook } from "../types";

/**
 * The book list result.
 */
export interface UseBooksResult {
  books: BibleBook[];
  hasLoadedBooks: boolean;
}

let cachedBooks: BibleBook[] = [];
let cachedLoaded = false;

/**
 * Stages the book list outside React state for instant first paint.
 *
 * @param books - The books to stage.
 * @returns Nothing.
 */
export const setBooksCache = (books: BibleBook[]) => {
  cachedBooks = books;
  cachedLoaded = true;
};

/**
 * Loads the book list, preferring the staged snapshot when the shell already fetched it.
 *
 * @returns The books and their load state.
 */
export const useBooks = () => {
  const [books, setBooks] = useState<BibleBook[]>(cachedBooks);
  const [hasLoadedBooks, setHasLoadedBooks] = useState(cachedLoaded);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (cachedLoaded) {
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
        if (import.meta.env.DEV) {
          console.error("[Bible] Unable to load books", error);
        }

        if (mounted) {
          cachedLoaded = true;
          setHasLoadedBooks(true);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  return { books, hasLoadedBooks };
};

import { useEffect, useState } from "react";

import { getBibleBookName, getReaderBootstrap } from "../../../shared/bible";
import type { BibleBook } from "../types";

export interface UseBooksResult {
  books: BibleBook[];
  hasLoadedBooks: boolean;
}

let cachedBooks: BibleBook[] = [];
let cachedLoaded = false;

export const setBooksCache = (books: BibleBook[]) => {
  cachedBooks = books;
  cachedLoaded = true;
};

export const useBooks = (): UseBooksResult => {
  const [books, setBooks] = useState<BibleBook[]>(cachedBooks);
  const [hasLoadedBooks, setHasLoadedBooks] = useState(cachedLoaded);

  useEffect(() => {
    if (cachedLoaded) {
      return;
    }

    let mounted = true;

    const load = async () => {
      try {
        const { books: bookSummaries } = await getReaderBootstrap(1, 1);

        if (!mounted) {
          return;
        }

        const mapped = bookSummaries.map((book) => ({
          ...book,
          name: getBibleBookName(book.id),
        }));

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

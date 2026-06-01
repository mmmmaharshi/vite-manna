import { useEffect, useState } from "react";

import {
  getBibleBookName,
  getReaderBootstrap,
} from "../../../shared/bible";
import type { BibleBook } from "../types";

export interface UseBooksResult {
  books: BibleBook[];
  hasLoadedBooks: boolean;
}

export function useBooks(): UseBooksResult {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [hasLoadedBooks, setHasLoadedBooks] = useState(false);

  useEffect(() => {
    let mounted = true;

    void getReaderBootstrap(1, 1)
      .then(({ books: bookSummaries }) => {
        if (!mounted) {
          return;
        }

        setBooks(
          bookSummaries.map((book) => ({
            ...book,
            name: getBibleBookName(book.id),
          })),
        );
        setHasLoadedBooks(true);
      })
      .catch((error) => {
        console.error("[Bible] Unable to load books", error);

        if (mounted) {
          setHasLoadedBooks(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { books, hasLoadedBooks };
}

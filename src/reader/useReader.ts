import { useEffect, useRef, useState } from "react";

import { getBibleBookName } from "../bible/books";
import {
  getReaderBootstrap,
  getReaderSnapshot,
} from "../bible/bibleRepository";
import type { BibleVerse } from "../bible/db";

export interface BibleBook {
  chapterCount: number;
  id: number;
  name: string;
}

export interface ReaderSnapshot {
  book: number;
  chapter: number | undefined;
  chapters: number[];
  verses: BibleVerse[];
}

export interface UseReaderArgs {
  book: number;
  chapter: number;
  setBook: (book: number) => void;
  setChapter: (chapter: number) => void;
}

export interface UseReaderResult {
  books: BibleBook[];
  hasLoadedBooks: boolean;
  isBookSelectOpen: boolean;
  isReaderTransitioning: boolean;
  pendingBook: number | null;
  readerSnapshot: ReaderSnapshot | null;
  setIsBookSelectOpen: (isOpen: boolean) => void;
  setPendingBook: (book: number | null) => void;
  visibleBook: number;
  visibleBookSummary: BibleBook | undefined;
  visibleChapter: number;
  visibleChapters: number[];
}

export function useReader({
  book,
  chapter,
  setBook,
  setChapter,
}: UseReaderArgs): UseReaderResult {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [readerSnapshot, setReaderSnapshot] = useState<ReaderSnapshot | null>(
    null,
  );
  const [hasLoadedBooks, setHasLoadedBooks] = useState(false);
  const [isBookSelectOpen, setIsBookSelectOpen] = useState(false);
  const [pendingBook, setPendingBook] = useState<number | null>(null);
  const pendingBookRef = useRef<number | null>(null);
  const hasBootstrappedRef = useRef(false);
  const initialLocationRef = useRef({ book, chapter });

  useEffect(() => {
    let mounted = true;
    const initialLocation = initialLocationRef.current;

    hasBootstrappedRef.current = true;

    void getReaderBootstrap(initialLocation.book, initialLocation.chapter)
      .then(({ books: bookSummaries, snapshot }) => {
        if (!mounted) {
          return;
        }

        setBooks(
          bookSummaries.map((book) => ({
            ...book,
            name: getBibleBookName(book.id),
          })),
        );
        setReaderSnapshot(snapshot);
        setHasLoadedBooks(true);

        if (!snapshot) {
          return;
        }

        if (snapshot.book !== initialLocation.book) {
          setBook(snapshot.book);
          return;
        }

        if (
          snapshot.chapter !== undefined &&
          snapshot.chapter !== initialLocation.chapter
        ) {
          setChapter(snapshot.chapter);
        }
      })
      .catch((error) => {
        console.error("[Bible] Unable to bootstrap reader", error);

        if (mounted) {
          setHasLoadedBooks(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, [setBook, setChapter]);

  useEffect(() => {
    let mounted = true;

    if (!hasBootstrappedRef.current || !hasLoadedBooks) {
      return;
    }

    if (readerSnapshot?.book === book && readerSnapshot.chapter === chapter) {
      return;
    }

    const selectedBook = books.find((candidate) => candidate.id === book);

    void getReaderSnapshot(book, chapter, selectedBook?.chapterCount)
      .then((snapshot) => {
        if (mounted) {
          setReaderSnapshot(snapshot);

          if (pendingBookRef.current === snapshot.book) {
            pendingBookRef.current = null;
          }

          if (snapshot.chapter !== undefined && snapshot.chapter !== chapter) {
            setChapter(snapshot.chapter);
          }
        }
      })
      .catch((error) => {
        console.error("[Bible] Unable to load reader snapshot", error);
      });

    return () => {
      mounted = false;
    };
  }, [book, books, chapter, hasLoadedBooks, readerSnapshot, setChapter]);

  useEffect(() => {
    if (books.length > 0 && !books.some((candidate) => candidate.id === book)) {
      setBook(books[0].id);
    }
  }, [book, books, setBook]);

  const visibleBook = pendingBook ?? readerSnapshot?.book ?? book;
  const visibleBookSummary = books.find(
    (candidate) => candidate.id === visibleBook,
  );
  const visibleChapters =
    readerSnapshot?.book !== book && visibleBookSummary
      ? Array.from(
          { length: visibleBookSummary.chapterCount },
          (_, index) => index + 1,
        )
      : (readerSnapshot?.chapters ?? []);
  const isReaderTransitioning = readerSnapshot?.book !== book;
  const visibleChapter = isReaderTransitioning
    ? 1
    : (readerSnapshot?.chapter ?? chapter);

  return {
    books,
    hasLoadedBooks,
    isBookSelectOpen,
    isReaderTransitioning,
    pendingBook,
    readerSnapshot,
    setIsBookSelectOpen,
    setPendingBook,
    visibleBook,
    visibleBookSummary,
    visibleChapter,
    visibleChapters,
  };
}

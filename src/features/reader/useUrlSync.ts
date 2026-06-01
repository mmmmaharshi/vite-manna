import { useEffect } from "react";
import { useSearchParams } from "react-router";

import { useReaderStore } from "./store/readerStore";

const URL_PARAM_BOOK = "book";
const URL_PARAM_CHAPTER = "chapter";
const STORAGE_KEY = "manna.reader-location";
const STORAGE_VERSION = 1;

export function useUrlSync() {
  const [searchParams, setSearchParams] = useSearchParams();
  const book = useReaderStore((state) => state.book);
  const chapter = useReaderStore((state) => state.chapter);
  const chaptersByBook = useReaderStore((state) => state.chaptersByBook);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);

    next.set(URL_PARAM_BOOK, String(book));
    next.set(URL_PARAM_CHAPTER, String(chapter));

    if (
      next.get(URL_PARAM_BOOK) === searchParams.get(URL_PARAM_BOOK) &&
      next.get(URL_PARAM_CHAPTER) === searchParams.get(URL_PARAM_CHAPTER)
    ) {
      return;
    }

    setSearchParams(next, { replace: true });
  }, [book, chapter, searchParams, setSearchParams]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: STORAGE_VERSION,
          book,
          chapter,
          chaptersByBook,
        }),
      );
    } catch {
      // URL state remains authoritative when storage is unavailable.
    }
  }, [book, chapter, chaptersByBook]);
}

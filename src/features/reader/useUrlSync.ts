import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";

import { useReaderStore } from "./store/readerStore";

const URL_PARAM_BOOK = "book";
const URL_PARAM_CHAPTER = "chapter";
const URL_PARAM_VERSE = "verse";

export function useUrlSync() {
  const [searchParams, setSearchParams] = useSearchParams();
  const book = useReaderStore((state) => state.book);
  const chapter = useReaderStore((state) => state.chapter);
  const permalinkVerse = useReaderStore((state) => state.permalinkVerse);
  const chaptersByBook = useReaderStore((state) => state.chaptersByBook);
  const isExternalUpdate = useRef(false);

  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const bookParam = params.get(URL_PARAM_BOOK);
      const chapterParam = params.get(URL_PARAM_CHAPTER);
      const verseParam = params.get(URL_PARAM_VERSE);

      if (bookParam !== null && chapterParam !== null) {
        const state = useReaderStore.getState();
        isExternalUpdate.current = true;
        state.setBook(Number(bookParam));
        state.setChapter(Number(chapterParam));
        if (verseParam !== null) {
          state.setPermalinkVerse(Number(verseParam));
        }
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (isExternalUpdate.current) {
      isExternalUpdate.current = false;
      return;
    }

    const next = new URLSearchParams(searchParams);

    next.set(URL_PARAM_BOOK, String(book));
    next.set(URL_PARAM_CHAPTER, String(chapter));
    if (permalinkVerse !== null) {
      next.set(URL_PARAM_VERSE, String(permalinkVerse));
    } else {
      next.delete(URL_PARAM_VERSE);
    }

    if (
      next.get(URL_PARAM_BOOK) === searchParams.get(URL_PARAM_BOOK) &&
      next.get(URL_PARAM_CHAPTER) === searchParams.get(URL_PARAM_CHAPTER) &&
      next.get(URL_PARAM_VERSE) === searchParams.get(URL_PARAM_VERSE)
    ) {
      return;
    }

    setSearchParams(next, { replace: true });
  }, [book, chapter, permalinkVerse, searchParams, setSearchParams]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "manna.reader-location",
        JSON.stringify({
          version: 1,
          book,
          chapter,
          chaptersByBook,
        }),
      );
    } catch { /* localStorage write may fail */ }
  }, [book, chapter, chaptersByBook]);
}

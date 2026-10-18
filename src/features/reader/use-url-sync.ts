import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";

import { parsePositiveInteger } from "../../shared/lib/parse-positive-integer";
import { saveReaderLocation } from "../../shared/lib/persistence";
import {
  URL_PARAM_BOOK,
  URL_PARAM_CHAPTER,
  URL_PARAM_VERSE,
} from "../../shared/lib/reference";
import { useReaderStore } from "./store/reader-store";

export const useUrlSync = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const book = useReaderStore((state) => state.book);
  const chapter = useReaderStore((state) => state.chapter);
  const permalinkVerse = useReaderStore((state) => state.permalinkVerse);
  const chaptersByBook = useReaderStore((state) => state.chaptersByBook);
  const isExternalUpdate = useRef(false);

  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const nextBook = parsePositiveInteger(params.get(URL_PARAM_BOOK));
      const nextChapter = parsePositiveInteger(params.get(URL_PARAM_CHAPTER));

      if (nextBook === null || nextChapter === null) {
        return;
      }

      const state = useReaderStore.getState();
      isExternalUpdate.current = true;
      state.setBook(nextBook);
      state.setChapter(nextChapter);

      const nextVerse = parsePositiveInteger(params.get(URL_PARAM_VERSE));

      if (nextVerse !== null) {
        state.setPermalinkVerse(nextVerse);
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

    if (permalinkVerse === null) {
      next.delete(URL_PARAM_VERSE);
    } else {
      next.set(URL_PARAM_VERSE, String(permalinkVerse));
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
    saveReaderLocation({ book, chapter, chaptersByBook });
  }, [book, chapter, chaptersByBook]);
};

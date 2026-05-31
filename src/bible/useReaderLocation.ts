import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router";

const STORAGE_KEY = "manna.reader-location";

interface ReaderLocation {
  book: number;
  chapter: number;
}

function parsePositiveInteger(value: string | null) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function loadPersistedLocation(): ReaderLocation {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "");
    const book = parsePositiveInteger(String(value.book));
    const chapter = parsePositiveInteger(String(value.chapter));

    if (book !== null && chapter !== null) {
      return { book, chapter };
    }
  } catch {
    // Use the canonical starting location when storage is unavailable or invalid.
  }

  return { book: 1, chapter: 1 };
}

export function useReaderLocation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const persistedLocation = useMemo(() => loadPersistedLocation(), []);
  const urlBook = parsePositiveInteger(searchParams.get("book"));
  const urlChapter = parsePositiveInteger(searchParams.get("chapter"));
  const book = urlBook ?? persistedLocation.book;
  const chapter =
    urlChapter ??
    (urlBook === null || urlBook === persistedLocation.book
      ? persistedLocation.chapter
      : 1);

  const updateLocation = useCallback(
    (location: ReaderLocation) => {
      const nextParams = new URLSearchParams(searchParams);

      nextParams.set("book", String(location.book));
      nextParams.set("chapter", String(location.chapter));
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    if (urlBook !== book || urlChapter !== chapter) {
      updateLocation({ book, chapter });
    }
  }, [book, chapter, updateLocation, urlBook, urlChapter]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ book, chapter }));
    } catch {
      // URL state remains authoritative when storage is unavailable.
    }
  }, [book, chapter]);

  const setBook = useCallback(
    (nextBook: number) => updateLocation({ book: nextBook, chapter: 1 }),
    [updateLocation],
  );
  const setChapter = useCallback(
    (nextChapter: number) => updateLocation({ book, chapter: nextChapter }),
    [book, updateLocation],
  );

  return {
    book,
    chapter,
    setBook,
    setChapter,
  };
}

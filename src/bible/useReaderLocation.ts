import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router";

const STORAGE_KEY = "manna.reader-location";
const STORAGE_VERSION = 1;

interface ReaderLocation {
  book: number;
  chapter: number;
}

interface StoredReaderLocation extends ReaderLocation {
  chaptersByBook?: Record<string, number>;
  version: number;
}

interface PersistedReaderLocation extends ReaderLocation {
  chaptersByBook: Record<string, number>;
}

function parsePositiveInteger(value: string | null) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseChaptersByBook(value: unknown) {
  if (!value || typeof value !== "object") {
    return {};
  }

  const chaptersByBook: Record<string, number> = {};

  for (const [book, chapter] of Object.entries(value)) {
    const parsedBook = parsePositiveInteger(book);
    const parsedChapter = parsePositiveInteger(String(chapter));

    if (parsedBook !== null && parsedChapter !== null) {
      chaptersByBook[String(parsedBook)] = parsedChapter;
    }
  }

  return chaptersByBook;
}

function getRememberedChapter(
  chaptersByBook: Record<string, number>,
  book: number,
) {
  return chaptersByBook[String(book)] ?? 1;
}

function loadPersistedLocation(): PersistedReaderLocation {
  try {
    const value = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "",
    ) as StoredReaderLocation;

    const chaptersByBook = parseChaptersByBook(value.chaptersByBook);

    if (value.version !== STORAGE_VERSION) {
      return { book: 1, chapter: 1, chaptersByBook };
    }

    const book = parsePositiveInteger(String(value.book));
    const chapter = parsePositiveInteger(String(value.chapter));

    if (book !== null && chapter !== null) {
      return {
        book,
        chapter,
        chaptersByBook: {
          ...chaptersByBook,
          [book]: chapter,
        },
      };
    }
  } catch {
    // Use the canonical starting location when storage is unavailable or invalid.
  }

  return { book: 1, chapter: 1, chaptersByBook: {} };
}

export function useReaderLocation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const persistedLocation = useMemo(() => loadPersistedLocation(), []);
  const chaptersByBookRef = useRef({ ...persistedLocation.chaptersByBook });
  const urlBook = parsePositiveInteger(searchParams.get("book"));
  const urlChapter = parsePositiveInteger(searchParams.get("chapter"));
  const book = urlBook ?? persistedLocation.book;
  const chapter =
    urlChapter ??
    (urlBook === null
      ? persistedLocation.chapter
      : getRememberedChapter(chaptersByBookRef.current, urlBook));

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
    chaptersByBookRef.current[String(book)] = chapter;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          book,
          chapter,
          chaptersByBook: chaptersByBookRef.current,
          version: STORAGE_VERSION,
        }),
      );
    } catch {
      // URL state remains authoritative when storage is unavailable.
    }
  }, [book, chapter]);

  const setBook = useCallback(
    (nextBook: number) =>
      updateLocation({
        book: nextBook,
        chapter: getRememberedChapter(chaptersByBookRef.current, nextBook),
      }),
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

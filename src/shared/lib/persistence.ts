import { isFontSize } from "./font-size";
import type { FontSize } from "./font-size";
import { parsePositiveInteger } from "./parse-positive-integer";
import {
  URL_PARAM_BOOK,
  URL_PARAM_CHAPTER,
  URL_PARAM_VERSE,
} from "./reference";

const STORAGE_KEY = "manna.reader-location";
const FONT_SIZE_KEY = "manna.reader-font-size";

// localStorage throws in private mode and when the quota is full. Warn once so a
// "my position keeps resetting" report is diagnosable instead of silent.
let didWarnStorageFailure = false;

const warnStorageFailure = (operation: string, reason: string) => {
  if (didWarnStorageFailure) {
    return;
  }

  didWarnStorageFailure = true;
  console.warn(`[manna] localStorage ${operation} failed: ${reason}`);
};

const readStorage = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    warnStorageFailure("read", String(error));

    return null;
  }
};

const writeStorage = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    warnStorageFailure("write", String(error));
  }
};

interface StoredLocation {
  book?: number;
  chapter?: number;
  chaptersByBook?: Record<string, number>;
}

export interface ReaderInitState {
  book: number;
  chapter: number;
  chaptersByBook: Record<number, number>;
  permalinkVerse: number | null;
}

const isStoredLocation = (value: unknown): value is StoredLocation =>
  typeof value === "object" && value !== null;

const parseStoredLocation = (raw: string | null): StoredLocation | null => {
  try {
    const parsed: unknown = JSON.parse(raw ?? "");

    return isStoredLocation(parsed) ? parsed : null;
  } catch (error) {
    warnStorageFailure("parse", String(error));
  }

  return null;
};

const parseChaptersByBook = (value: Record<string, number> | undefined) => {
  const chapters = new Map<number, number>();

  for (const [book, chapter] of Object.entries(value ?? {})) {
    const parsedBook = parsePositiveInteger(book);
    const parsedChapter = parsePositiveInteger(String(chapter));

    if (parsedBook !== null && parsedChapter !== null) {
      chapters.set(parsedBook, parsedChapter);
    }
  }

  return chapters;
};

const readUrlLocation = (search: string) => {
  const params = new URLSearchParams(search);
  const book = parsePositiveInteger(params.get(URL_PARAM_BOOK));
  const chapter = parsePositiveInteger(params.get(URL_PARAM_CHAPTER));

  if (book === null || chapter === null) {
    return null;
  }

  return { book, chapter };
};

const readUrlVerse = (search: string) =>
  parsePositiveInteger(new URLSearchParams(search).get(URL_PARAM_VERSE));

/**
 * Pure so it can be tested without a browser: `search` is `location.search`
 * (with or without the leading `?`) and `storedRaw` is the raw localStorage value.
 */
export const resolveReaderLocation = (
  search: string,
  storedRaw: string | null
): ReaderInitState => {
  const fromUrl = readUrlLocation(search);
  const permalinkVerse = readUrlVerse(search);
  const stored = parseStoredLocation(storedRaw);

  const chaptersByBook = Object.fromEntries(
    parseChaptersByBook(stored?.chaptersByBook)
  );

  if (fromUrl !== null) {
    return {
      book: fromUrl.book,
      chapter: fromUrl.chapter,
      chaptersByBook: { ...chaptersByBook, [fromUrl.book]: fromUrl.chapter },
      permalinkVerse,
    };
  }

  const book = parsePositiveInteger(String(stored?.book));
  const chapter = parsePositiveInteger(String(stored?.chapter));

  if (book === null || chapter === null) {
    return { book: 1, chapter: 1, chaptersByBook: {}, permalinkVerse };
  }

  return {
    book,
    chapter,
    chaptersByBook: { ...chaptersByBook, [book]: chapter },
    permalinkVerse,
  };
};

export const loadInitialState = (): ReaderInitState =>
  resolveReaderLocation(window.location.search, readStorage(STORAGE_KEY));

export interface StoredReaderLocation {
  book: number;
  chapter: number;
  chaptersByBook: Record<number, number>;
}

export const saveReaderLocation = ({
  book,
  chapter,
  chaptersByBook,
}: StoredReaderLocation) => {
  writeStorage(STORAGE_KEY, JSON.stringify({ book, chapter, chaptersByBook }));
};

export const loadFontSize = (): FontSize => {
  const stored = readStorage(FONT_SIZE_KEY);

  return stored !== null && isFontSize(stored) ? stored : "sm";
};

export const setStoredFontSize = (fontSize: FontSize) => {
  writeStorage(FONT_SIZE_KEY, fontSize);
};

export const rememberChapter = (
  chaptersByBook: Record<number, number>,
  book: number
) => chaptersByBook[book] ?? 1;

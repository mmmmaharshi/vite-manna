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
const LAST_CRASH_KEY = "manna.last-crash";

let didWarnStorageFailure = false;

const warnStorageFailure = (operation: string, reason: string) => {
  if (didWarnStorageFailure) {
    return;
  }

  didWarnStorageFailure = true;
  recordLastCrash("Storage failure", `${operation}: ${reason}`);
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

const removeStorage = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    warnStorageFailure("remove", String(error));
  }
};

interface StoredLocation {
  book?: number;
  chapter?: number;
  chaptersByBook?: Record<string, number>;
}

const isStoredLocation = (value: unknown): value is StoredLocation =>
  typeof value === "object" && value !== null;

/**
 * The reader state restored at boot.
 */
export interface ReaderInitState {
  book: number;
  chapter: number;
  chaptersByBook: Record<number, number>;
  permalinkVerse: number | null;
}

const parseStoredLocation = (raw: string | null) => {
  if (raw === null) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

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
 *
 * @param search - The URL query string.
 * @param storedRaw - The raw stored location value.
 * @returns The resolved initial reader state.
 */
export const resolveReaderLocation = (
  search: string,
  storedRaw: string | null
) => {
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
    permalinkVerse,
    chaptersByBook: { ...chaptersByBook, [book]: chapter },
  };
};

/**
 * Reads the initial reader state from the URL and storage.
 *
 * @returns The resolved initial reader state.
 */
export const loadInitialState = () =>
  resolveReaderLocation(window.location.search, readStorage(STORAGE_KEY));

/**
 * The reader location persisted to storage.
 */
export interface StoredReaderLocation {
  book: number;
  chapter: number;
  chaptersByBook: Record<number, number>;
}

/**
 * Persists the reader location.
 *
 * @returns Nothing.
 */
export const saveReaderLocation = ({
  book,
  chapter,
  chaptersByBook,
}: StoredReaderLocation) => {
  writeStorage(STORAGE_KEY, JSON.stringify({ book, chapter, chaptersByBook }));
};

/**
 * Loads the stored font size, defaulting to small.
 *
 * @returns The stored font size, or `"sm"`.
 */
export const loadFontSize = () => {
  const stored = readStorage(FONT_SIZE_KEY);

  return stored !== null && isFontSize(stored) ? stored : "sm";
};

/**
 * Persists the font size choice.
 *
 * @param fontSize - The size token to store.
 * @returns Nothing.
 */
export const setStoredFontSize = (fontSize: FontSize) => {
  writeStorage(FONT_SIZE_KEY, fontSize);
};

/**
 * Recalls the last-read chapter of a book, defaulting to chapter one.
 *
 * @param chaptersByBook - The remembered chapter per book.
 * @param book - The book number.
 * @returns The chapter to open.
 */
export const rememberChapter = (
  chaptersByBook: Record<number, number>,
  book: number
) => chaptersByBook[book] ?? 1;

/**
 * A crash report persisted for on-device diagnostics.
 */
export interface LastCrash {
  message: string;
  detail?: string;
  time: number;
}

const isLastCrash = (value: unknown): value is LastCrash => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if (!("message" in value) || !("time" in value)) {
    return false;
  }

  if (typeof value.message !== "string" || typeof value.time !== "number") {
    return false;
  }

  return (
    !("detail" in value) ||
    value.detail === undefined ||
    typeof value.detail === "string"
  );
};

/** Crash telemetry for an offline app with no backend: the boundary writes,
 * Settings reads, the user reports.
 *
 * @param message - The error message.
 * @param detail - The component stack, if any.
 * @returns Nothing.
 */
export const recordLastCrash = (message: string, detail?: string) => {
  writeStorage(
    LAST_CRASH_KEY,
    JSON.stringify({ detail, message, time: Date.now() })
  );
};

/**
 * Reads the last persisted crash report, if any.
 *
 * @returns The crash report, or null when none was recorded.
 */
export const readLastCrash = () => {
  const raw = readStorage(LAST_CRASH_KEY);

  if (raw === null) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    return isLastCrash(parsed)
      ? {
          detail: parsed.detail,
          message: parsed.message,
          time: parsed.time,
        }
      : null;
  } catch (error) {
    warnStorageFailure("parse", String(error));
  }

  return null;
};

/**
 * Clears the persisted crash report.
 *
 * @returns Nothing.
 */
export const clearLastCrash = () => {
  removeStorage(LAST_CRASH_KEY);
};

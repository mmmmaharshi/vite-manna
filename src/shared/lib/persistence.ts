import { isFontSize } from "./font-size";
import type { FontSize } from "./font-size";
import { parsePositiveInteger } from "./parse-positive-integer";

const STORAGE_KEY = "manna.reader-location";
const FONT_SIZE_KEY = "manna.reader-font-size";
const STORAGE_VERSION = 1;

interface StoredLocation {
  book?: number;
  chapter?: number;
  chaptersByBook?: Record<string, number>;
  version?: number;
}

export interface ReaderInitState {
  book: number;
  chapter: number;
  chaptersByBook: Record<number, number>;
  permalinkVerse: number | null;
}

const isStoredLocation = (value: unknown): value is StoredLocation =>
  typeof value === "object" && value !== null;

const readStoredLocation = (): StoredLocation | null => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "");

    return isStoredLocation(parsed) ? parsed : null;
  } catch {
    /* localStorage read may fail */
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

const readUrlLocation = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const book = parsePositiveInteger(params.get("book"));
  const chapter = parsePositiveInteger(params.get("chapter"));

  if (book === null || chapter === null) {
    return null;
  }

  return { book, chapter };
};

const readUrlVerse = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const params = new URLSearchParams(window.location.search);

  return parsePositiveInteger(params.get("verse"));
};

export const loadInitialState = (): ReaderInitState => {
  const fromUrl = readUrlLocation();
  const permalinkVerse = readUrlVerse();
  const stored = readStoredLocation();

  const current =
    stored !== null && stored.version === STORAGE_VERSION ? stored : null;

  const chaptersByBook = Object.fromEntries(
    parseChaptersByBook(current?.chaptersByBook)
  );

  if (fromUrl !== null) {
    return {
      book: fromUrl.book,
      chapter: fromUrl.chapter,
      chaptersByBook: { ...chaptersByBook, [fromUrl.book]: fromUrl.chapter },
      permalinkVerse,
    };
  }

  const book = parsePositiveInteger(String(current?.book));
  const chapter = parsePositiveInteger(String(current?.chapter));

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

export const loadFontSize = (): FontSize => {
  try {
    const stored = localStorage.getItem(FONT_SIZE_KEY);

    if (stored !== null && isFontSize(stored)) {
      return stored;
    }
  } catch {
    /* localStorage read may fail */
  }

  return "sm";
};

export const setStoredFontSize = (fontSize: FontSize) => {
  try {
    localStorage.setItem(FONT_SIZE_KEY, fontSize);
  } catch {
    /* localStorage may be full */
  }
};

export const rememberChapter = (
  chaptersByBook: Record<number, number>,
  book: number
) => chaptersByBook[book] ?? 1;

export const STORAGE_KEY_LOCATION = STORAGE_KEY;

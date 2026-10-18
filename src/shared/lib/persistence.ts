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

const parseChaptersByBook = (value: unknown): Record<number, number> => {
  if (!value || typeof value !== "object") {
    return {};
  }

  const result: Record<number, number> = {};

  for (const [book, chapter] of Object.entries(value)) {
    const parsedBook = parsePositiveInteger(book);
    const parsedChapter = parsePositiveInteger(String(chapter));

    if (parsedBook !== null && parsedChapter !== null) {
      result[parsedBook] = parsedChapter;
    }
  }

  return result;
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

  if (fromUrl !== null) {
    let chaptersByBook: Record<number, number> = {};

    try {
      const stored = JSON.parse(
        localStorage.getItem(STORAGE_KEY) ?? ""
      ) as StoredLocation;

      if (stored.version === STORAGE_VERSION) {
        chaptersByBook = parseChaptersByBook(stored.chaptersByBook);
      }
    } catch {
      /* localStorage read may fail */
    }

    return {
      book: fromUrl.book,
      chapter: fromUrl.chapter,
      chaptersByBook: { ...chaptersByBook, [fromUrl.book]: fromUrl.chapter },
      permalinkVerse,
    };
  }

  let book = 1;
  let chapter = 1;
  let chaptersByBook: Record<number, number> = {};

  try {
    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? ""
    ) as StoredLocation;

    if (stored.version === STORAGE_VERSION) {
      const storedBook = parsePositiveInteger(String(stored.book));
      const storedChapter = parsePositiveInteger(String(stored.chapter));
      const storedChaptersByBook = parseChaptersByBook(stored.chaptersByBook);

      if (storedBook !== null && storedChapter !== null) {
        book = storedBook;
        chapter = storedChapter;
        chaptersByBook = {
          ...storedChaptersByBook,
          [storedBook]: storedChapter,
        };
      }
    }
  } catch {
    /* localStorage read may fail */
  }

  return { book, chapter, chaptersByBook, permalinkVerse };
};

export const loadFontSize = (): FontSize => {
  const valid: FontSize[] = ["sm", "base", "lg", "xl", "2xl"];
  try {
    const stored = localStorage.getItem(FONT_SIZE_KEY) as FontSize | null;
    if (stored && valid.includes(stored)) {
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

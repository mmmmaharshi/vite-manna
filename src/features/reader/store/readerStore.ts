import { create } from "zustand";

const PENDING_BOOK_SAFETY_TIMEOUT = 15_000;
const MAX_REASONABLE_ID = 200;

export type FontSize = "sm" | "base" | "lg" | "xl" | "2xl";

export interface ReaderState {
  book: number;
  chapter: number;
  pendingBook: number | null;
  isBookSelectOpen: boolean;
  chaptersByBook: Record<number, number>;
  selectedVerseIds: number[];
  isSelectionMode: boolean;
  permalinkVerse: number | null;
  fontSize: FontSize;

  setBook: (book: number) => void;
  setChapter: (chapter: number) => void;
  selectBook: (bookId: number) => void;
  setBookSelectOpen: (open: boolean) => void;
  clearPendingBook: () => void;
  toggleVerseSelection: (verseId: number) => void;
  clearVerseSelection: () => void;
  setPermalinkVerse: (verse: number | null) => void;
  setFontSize: (fontSize: FontSize) => void;
  reset: () => void;
}

const STORAGE_KEY = "manna.reader-location";
const FONT_SIZE_KEY = "manna.reader-font-size";
const STORAGE_VERSION = 1;

interface StoredLocation {
  book?: number;
  chapter?: number;
  chaptersByBook?: Record<string, number>;
  version?: number;
}

function parsePositiveInteger(value: string | null) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 && parsed <= MAX_REASONABLE_ID ? parsed : null;
}

function parseChaptersByBook(value: unknown): Record<number, number> {
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
}

function readUrlLocation() {
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
}

function readUrlVerse() {
  if (typeof window === "undefined") {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  return parsePositiveInteger(params.get("verse"));
}

function loadInitialState() {
  const fromUrl = readUrlLocation();
  const permalinkVerse = readUrlVerse();

  if (fromUrl !== null) {
    let chaptersByBook: Record<number, number> = {};

    try {
      const stored = JSON.parse(
        localStorage.getItem(STORAGE_KEY) ?? "",
      ) as StoredLocation;

      if (stored.version === STORAGE_VERSION) {
        chaptersByBook = parseChaptersByBook(stored.chaptersByBook);
      }
    } catch {
      // Keep the URL-derived book/chapter when localStorage is unreadable.
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
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "") as StoredLocation;

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
    // Use the canonical starting location when storage is unavailable or invalid.
  }

  return { book, chapter, chaptersByBook, permalinkVerse };
}

function loadFontSize(): FontSize {
  const valid: FontSize[] = ["sm", "base", "lg", "xl", "2xl"];
  try {
    const stored = localStorage.getItem(FONT_SIZE_KEY) as FontSize | null;
    if (stored && valid.includes(stored)) return stored;
  } catch { /* noop */ }
  return "sm";
}

function rememberChapter(
  chaptersByBook: Record<number, number>,
  book: number,
) {
  return chaptersByBook[book] ?? 1;
}

const initial = loadInitialState();

export const useReaderStore = create<ReaderState>((set, get) => ({
  book: initial.book,
  chapter: initial.chapter,
  pendingBook: null,
  isBookSelectOpen: false,
  chaptersByBook: initial.chaptersByBook,
  selectedVerseIds: [],
  isSelectionMode: false,
  permalinkVerse: initial.permalinkVerse,
  fontSize: loadFontSize(),

  setBook: (book) => {
    const { chaptersByBook } = get();

    set({
      book,
      chapter: rememberChapter(chaptersByBook, book),
      selectedVerseIds: [],
      isSelectionMode: false,
      permalinkVerse: null,
    });
  },

  setChapter: (chapter) => {
    const { book, chaptersByBook } = get();

    const next: Partial<ReaderState> = {
      chapter,
      selectedVerseIds: [],
      isSelectionMode: false,
      permalinkVerse: null,
    };

    if (chaptersByBook[book] !== chapter) {
      next.chaptersByBook = { ...chaptersByBook, [book]: chapter };
    }

    set(next);
  },

  selectBook: (bookId) => {
    set({
      pendingBook: bookId,
      isBookSelectOpen: true,
      permalinkVerse: null,
    });
    get().setBook(bookId);

    setTimeout(() => {
      const { pendingBook } = get();
      if (pendingBook === bookId) {
        set({ pendingBook: null, isBookSelectOpen: false });
      }
    }, PENDING_BOOK_SAFETY_TIMEOUT);
  },

  setBookSelectOpen: (open) => {
    if (get().pendingBook !== null) {
      set({ isBookSelectOpen: true });
      return;
    }

    set({ isBookSelectOpen: open });
  },

  clearPendingBook: () => {
    if (get().pendingBook === null) {
      return;
    }

    set({ pendingBook: null, isBookSelectOpen: false });
  },

  toggleVerseSelection: (verseId) => {
    const { selectedVerseIds, isSelectionMode } = get();

    if (!isSelectionMode) {
      set({ isSelectionMode: true, selectedVerseIds: [verseId] });
      return;
    }

    const next = selectedVerseIds.includes(verseId)
      ? selectedVerseIds.filter((id) => id !== verseId)
      : [...selectedVerseIds, verseId];

    set({
      selectedVerseIds: next,
      isSelectionMode: next.length > 0,
    });
  },

  clearVerseSelection: () => {
    if (!get().isSelectionMode && get().selectedVerseIds.length === 0) {
      return;
    }

    set({ selectedVerseIds: [], isSelectionMode: false });
  },

  setFontSize: (fontSize) => {
    try { localStorage.setItem(FONT_SIZE_KEY, fontSize); } catch { /* noop */ }
    set({ fontSize });
  },

  setPermalinkVerse: (verse) => {
    if (get().permalinkVerse === verse) {
      return;
    }

    set({ permalinkVerse: verse });
  },

  reset: () => {
    const fresh = loadInitialState();
    set({
      book: fresh.book,
      chapter: fresh.chapter,
      pendingBook: null,
      isBookSelectOpen: false,
      chaptersByBook: fresh.chaptersByBook,
      selectedVerseIds: [],
      isSelectionMode: false,
      permalinkVerse: fresh.permalinkVerse,
      fontSize: loadFontSize(),
    });
  },
}));

export function getReaderStoreState() {
  return useReaderStore.getState();
}

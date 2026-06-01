import { create } from "zustand";

export interface ReaderState {
  book: number;
  chapter: number;
  pendingBook: number | null;
  isBookSelectOpen: boolean;
  chaptersByBook: Record<number, number>;
  selectedVerseIds: number[];
  isSelectionMode: boolean;
  permalinkVerse: number | null;

  setBook: (book: number) => void;
  setChapter: (chapter: number) => void;
  selectBook: (bookId: number) => void;
  setBookSelectOpen: (open: boolean) => void;
  clearPendingBook: () => void;
  toggleVerseSelection: (verseId: number) => void;
  clearVerseSelection: () => void;
  setPermalinkVerse: (verse: number | null) => void;
}

const STORAGE_KEY = "manna.reader-location";
const STORAGE_VERSION = 1;

interface StoredLocation {
  book?: number;
  chapter?: number;
  chaptersByBook?: Record<string, number>;
  version?: number;
}

function parsePositiveInteger(value: string | null) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
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

    set({
      chapter,
      chaptersByBook: { ...chaptersByBook, [book]: chapter },
      selectedVerseIds: [],
      isSelectionMode: false,
      permalinkVerse: null,
    });
  },

  selectBook: (bookId) => {
    set({
      pendingBook: bookId,
      isBookSelectOpen: true,
      permalinkVerse: null,
    });
    get().setBook(bookId);
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

  setPermalinkVerse: (verse) => {
    if (get().permalinkVerse === verse) {
      return;
    }

    set({ permalinkVerse: verse });
  },
}));

export function getReaderStoreState() {
  return useReaderStore.getState();
}

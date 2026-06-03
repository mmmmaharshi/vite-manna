import { create } from "zustand";

import { type FontSize } from "../../../shared/lib/fontSize";
import {
  loadInitialState,
  loadFontSize,
  setStoredFontSize,
  rememberChapter,
} from "../../../shared/lib/persistence";

const PENDING_BOOK_SAFETY_TIMEOUT = 15_000;

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
    setStoredFontSize(fontSize);
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



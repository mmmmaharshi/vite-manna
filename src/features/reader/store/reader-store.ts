import { create } from "zustand";

import type { FontSize } from "../../../shared/lib/font-size";
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
  chaptersByBook: initial.chaptersByBook,
  clearPendingBook: () => {
    if (get().pendingBook === null) {
      return;
    }

    set({ isBookSelectOpen: false, pendingBook: null });
  },
  clearVerseSelection: () => {
    if (!get().isSelectionMode && get().selectedVerseIds.length === 0) {
      return;
    }

    set({ isSelectionMode: false, selectedVerseIds: [] });
  },
  fontSize: loadFontSize(),
  isBookSelectOpen: false,
  isSelectionMode: false,
  pendingBook: null,
  permalinkVerse: initial.permalinkVerse,
  reset: () => {
    const fresh = loadInitialState();
    set({
      book: fresh.book,
      chapter: fresh.chapter,
      chaptersByBook: fresh.chaptersByBook,
      fontSize: loadFontSize(),
      isBookSelectOpen: false,
      isSelectionMode: false,
      pendingBook: null,
      permalinkVerse: fresh.permalinkVerse,
      selectedVerseIds: [],
    });
  },
  selectBook: (bookId) => {
    set({
      isBookSelectOpen: true,
      pendingBook: bookId,
      permalinkVerse: null,
    });
    get().setBook(bookId);

    setTimeout(() => {
      const { pendingBook } = get();

      if (pendingBook === bookId) {
        set({ isBookSelectOpen: false, pendingBook: null });
      }
    }, PENDING_BOOK_SAFETY_TIMEOUT);
  },
  selectedVerseIds: [],
  setBook: (book) => {
    const { chaptersByBook } = get();

    set({
      book,
      chapter: rememberChapter(chaptersByBook, book),
      isSelectionMode: false,
      permalinkVerse: null,
      selectedVerseIds: [],
    });
  },
  setBookSelectOpen: (open) => {
    if (get().pendingBook !== null) {
      set({ isBookSelectOpen: true });

      return;
    }

    set({ isBookSelectOpen: open });
  },
  setChapter: (chapter) => {
    const { book, chaptersByBook } = get();

    const next: Partial<ReaderState> = {
      chapter,
      isSelectionMode: false,
      permalinkVerse: null,
      selectedVerseIds: [],
    };

    if (chaptersByBook[book] !== chapter) {
      next.chaptersByBook = { ...chaptersByBook, [book]: chapter };
    }

    set(next);
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
      isSelectionMode: next.length > 0,
      selectedVerseIds: next,
    });
  },
}));

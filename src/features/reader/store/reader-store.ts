import { create } from "zustand";

import type { FontSize } from "../../../shared/lib/font-size";
import {
  loadInitialState,
  loadFontSize,
  setStoredFontSize,
  rememberChapter,
} from "../../../shared/lib/persistence";
import type { VerseRef } from "../../../shared/lib/reference";

/**
 * The reader navigation and selection state.
 */
export interface ReaderState {
  book: number;
  chapter: number;
  pendingBook: number | null;
  isBookSelectOpen: boolean;
  chaptersByBook: Record<number, number>;
  selectedVerseIds: number[];
  permalinkVerse: number | null;
  fontSize: FontSize;

  setBook: (book: number) => void;
  setChapter: (chapter: number) => void;
  goToVerse: (ref: VerseRef) => void;
  selectBook: (bookId: number) => void;
  openBookSelect: () => void;
  closeBookSelect: () => void;
  clearPendingBook: () => void;
  toggleVerseSelection: (verseId: number) => void;
  clearVerseSelection: () => void;
  setPermalinkVerse: (verse: number | null) => void;
  setFontSize: (fontSize: FontSize) => void;
  reset: () => void;
}

/**
 * Whether the reader is in verse-selection mode.
 *
 * @param state - The reader state.
 * @returns True when at least one verse is selected.
 */
export const selectIsSelectionMode = (state: ReaderState) =>
  state.selectedVerseIds.length > 0;

const initial = loadInitialState();

/**
 * The reader navigation and selection store.
 */
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
    if (get().selectedVerseIds.length === 0) {
      return;
    }

    set({ selectedVerseIds: [] });
  },
  closeBookSelect: () => {
    // WARNING: a pending book means a transition is in flight; the strip clears it.
    if (get().pendingBook !== null) {
      return;
    }

    set({ isBookSelectOpen: false });
  },
  fontSize: loadFontSize(),
  goToVerse: (ref) => {
    get().setBook(ref.book);
    get().setChapter(ref.chapter);
    get().setPermalinkVerse(ref.verse);
  },
  isBookSelectOpen: false,
  openBookSelect: () => {
    set({ isBookSelectOpen: true });
  },
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
  },
  selectedVerseIds: [],
  setBook: (book) => {
    const { chaptersByBook } = get();

    set({
      book,
      chapter: rememberChapter(chaptersByBook, book),
      permalinkVerse: null,
      selectedVerseIds: [],
    });
  },
  setChapter: (chapter) => {
    const { book, chaptersByBook } = get();

    const next: Partial<ReaderState> = {
      chapter,
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
    const { selectedVerseIds } = get();

    set({
      selectedVerseIds: selectedVerseIds.includes(verseId)
        ? selectedVerseIds.filter((id) => id !== verseId)
        : [...selectedVerseIds, verseId],
    });
  },
}));

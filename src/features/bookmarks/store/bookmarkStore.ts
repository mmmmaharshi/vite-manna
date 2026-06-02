import { create } from "zustand";
import type { Bookmark } from "../../../shared/bible";

export interface BookmarkStore {
  bookmarks: Bookmark[];
  bookmarkedIds: number[];
  loaded: boolean;
  hydrate: (bookmarks: Bookmark[]) => void;
  addLocal: (bookmark: Bookmark) => void;
  removeLocal: (verseId: number) => void;
  clearAllLocal: () => void;
  updateNoteLocal: (verseId: number, note: string) => void;
  updateTagsLocal: (verseId: number, tags: string[]) => void;
}

export const useBookmarkStore = create<BookmarkStore>((set) => ({
  bookmarks: [],
  bookmarkedIds: [],
  loaded: false,

  hydrate: (bookmarks) => {
    set({
      bookmarks,
      bookmarkedIds: bookmarks.map((b) => b.verseId),
      loaded: true,
    });
  },

  addLocal: (bookmark) => {
    set((state) => ({
      bookmarks: [bookmark, ...state.bookmarks],
      bookmarkedIds: [bookmark.verseId, ...state.bookmarkedIds],
    }));
  },

  removeLocal: (verseId) => {
    set((state) => ({
      bookmarks: state.bookmarks.filter((b) => b.verseId !== verseId),
      bookmarkedIds: state.bookmarkedIds.filter((id) => id !== verseId),
    }));
  },

  clearAllLocal: () => {
    set({ bookmarks: [], bookmarkedIds: [] });
  },

  updateNoteLocal: (verseId, note) => {
    set((state) => ({
      bookmarks: state.bookmarks.map((b) =>
        b.verseId === verseId ? { ...b, note } : b,
      ),
    }));
  },

  updateTagsLocal: (verseId, tags) => {
    set((state) => ({
      bookmarks: state.bookmarks.map((b) =>
        b.verseId === verseId ? { ...b, tags } : b,
      ),
    }));
  },
}));

import { useCallback, useEffect, useMemo } from "react";

import {
  addBookmark as addBm,
  clearBookmarks as clearBm,
  getBookmarkedVerseIds,
  getBookmarks,
  removeBookmark as removeBm,
  searchBookmarksByText,
  updateBookmarkNote as updateNoteBm,
  updateBookmarkTags as updateTagsBm,
  type BibleVerse,
  type Bookmark,
} from "../../../shared/bible";
import { useBookmarkStore } from "../store/bookmarkStore";

export function useBookmarks() {
  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const bookmarkedIdsArr = useBookmarkStore((s) => s.bookmarkedIds);
  const loaded = useBookmarkStore((s) => s.loaded);
  const hydrate = useBookmarkStore((s) => s.hydrate);
  const addLocal = useBookmarkStore((s) => s.addLocal);
  const removeLocal = useBookmarkStore((s) => s.removeLocal);
  const clearAllLocal = useBookmarkStore((s) => s.clearAllLocal);
  const updateNoteLocal = useBookmarkStore((s) => s.updateNoteLocal);
  const updateTagsLocal = useBookmarkStore((s) => s.updateTagsLocal);

  const bookmarkedIds = useMemo(() => new Set(bookmarkedIdsArr), [bookmarkedIdsArr]);

  useEffect(() => {
    if (loaded) return;

    let mounted = true;
    void Promise.all([getBookmarks(), getBookmarkedVerseIds()]).then(([bmList]) => {
      if (mounted) hydrate(bmList);
    });

    return () => { mounted = false; };
  }, [loaded, hydrate]);

  const add = useCallback(
    (verse: BibleVerse) => {
      void addBm(verse).then(() => {
        addLocal({
          verseId: verse.id,
          book: verse.book,
          chapter: verse.chapter,
          verse: verse.verse,
          text: verse.text,
          createdAt: Date.now(),
        });
      });
    },
    [addLocal],
  );

  const remove = useCallback(
    (verseId: number) => {
      void removeBm(verseId).then(() => removeLocal(verseId));
    },
    [removeLocal],
  );

  const toggle = useCallback(
    (verse: BibleVerse) => {
      if (bookmarkedIds.has(verse.id)) remove(verse.id);
      else add(verse);
    },
    [bookmarkedIds, add, remove],
  );

  const isBookmarked = useCallback(
    (verseId: number) => bookmarkedIds.has(verseId),
    [bookmarkedIds],
  );

  const clearAll = useCallback(() => {
    void clearBm().then(() => clearAllLocal());
  }, [clearAllLocal]);

  const updateNote = useCallback(
    (verseId: number, note: string) => {
      void updateNoteBm(verseId, note).then(() => updateNoteLocal(verseId, note));
    },
    [updateNoteLocal],
  );

  const updateTags = useCallback(
    (verseId: number, tags: string[]) => {
      void updateTagsBm(verseId, tags).then(() => updateTagsLocal(verseId, tags));
    },
    [updateTagsLocal],
  );

  const search = useCallback(async (query: string): Promise<Bookmark[]> => {
    if (!query.trim()) return bookmarks;
    return searchBookmarksByText(query);
  }, [bookmarks]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const bm of bookmarks) {
      for (const tag of bm.tags ?? []) set.add(tag);
    }
    return [...set].sort();
  }, [bookmarks]);

  return {
    bookmarks, bookmarkedIds, loaded, add, remove, toggle, isBookmarked,
    clearAll, updateNote, updateTags, search, allTags,
  };
}

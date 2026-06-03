import { useCallback, useEffect, useMemo } from "react";

import {
  addBookmark as addBm,
  clearBookmarks as clearBm,
  getBookmarkedVerseIds,
  getBookmarks,
  removeBookmark as removeBm,
  type BibleVerse,
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

  return {
    bookmarks, bookmarkedIds, loaded, add, remove, toggle, isBookmarked, clearAll,
  };
}

import { useCallback, useEffect } from "react";

import {
  getHighlightedVerseIds,
  getHighlights,
  removeHighlight as removeHl,
  upsertHighlight as upsertHl,
  updateHighlightNote as updateHlNote,
  type BibleVerse,
  type HighlightColor,
} from "../../../shared/bible";
import { useHighlightStore } from "../store/highlightStore";

export function useHighlights() {
  const highlights = useHighlightStore((s) => s.highlights);
  const highlightedMap = useHighlightStore((s) => s.highlightedMap);
  const loaded = useHighlightStore((s) => s.loaded);
  const hydrate = useHighlightStore((s) => s.hydrate);
  const upsertLocal = useHighlightStore((s) => s.upsertLocal);
  const removeLocal = useHighlightStore((s) => s.removeLocal);

  useEffect(() => {
    if (loaded) return;

    let mounted = true;
    void Promise.all([getHighlights(), getHighlightedVerseIds()]).then(
      ([hlList]) => {
        if (mounted)
          hydrate(
            hlList.map((h) => ({
              ...h,
              id: h.id!,
            })),
          );
      },
    );

    return () => {
      mounted = false;
    };
  }, [loaded, hydrate]);

  const add = useCallback(
    (verse: BibleVerse, color: HighlightColor, note = "") => {
      void upsertHl(verse.id, verse.book, verse.chapter, verse.verse, verse.text, color, note).then(
        () => {
          upsertLocal({
            id: verse.id,
            verseId: verse.id,
            book: verse.book,
            chapter: verse.chapter,
            verse: verse.verse,
            text: verse.text,
            color,
            note,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        },
      );
    },
    [upsertLocal],
  );

  const remove = useCallback(
    (verseId: number) => {
      void removeHl(verseId).then(() => removeLocal(verseId));
    },
    [removeLocal],
  );

  const toggle = useCallback(
    (verse: BibleVerse, color: HighlightColor) => {
      const existing = highlightedMap.get(verse.id);
      if (existing === color) {
        remove(verse.id);
      } else {
        add(verse, color);
      }
    },
    [highlightedMap, add, remove],
  );

  const getColor = useCallback(
    (verseId: number): HighlightColor | undefined => highlightedMap.get(verseId),
    [highlightedMap],
  );

  const updateNote = useCallback(
    (verseId: number, note: string) => {
      void updateHlNote(verseId, note).then(() => {
        const store = useHighlightStore.getState();
        const updated = store.highlights.map((h) =>
          h.verseId === verseId ? { ...h, note, updatedAt: Date.now() } : h,
        );
        useHighlightStore.setState({ highlights: updated });
      });
    },
    [],
  );

  return {
    highlights,
    highlightedMap,
    loaded,
    add,
    remove,
    toggle,
    getColor,
    updateNote,
  };
}

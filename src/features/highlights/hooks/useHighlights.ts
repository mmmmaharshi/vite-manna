import { useCallback, useEffect } from "react";

import {
  DEFAULT_HIGHLIGHT_COLOR,
  getHighlights,
  removeHighlight as removeHl,
  upsertHighlight as upsertHl,
  type BibleVerse,
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
    void getHighlights().then(
      (hlList) => {
        if (mounted) hydrate(hlList);
      },
    );

    return () => {
      mounted = false;
    };
  }, [loaded, hydrate]);

  const add = useCallback(
    (verse: BibleVerse) => {
      void upsertHl(
        verse.id,
        verse.book,
        verse.chapter,
        verse.verse,
        verse.text,
      ).then(() => {
        upsertLocal({
          verseId: verse.id,
          book: verse.book,
          chapter: verse.chapter,
          verse: verse.verse,
          text: verse.text,
          color: DEFAULT_HIGHLIGHT_COLOR,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });
    },
    [upsertLocal],
  );

  const remove = useCallback(
    (verseId: number) => {
      void removeHl(verseId).then(() => removeLocal(verseId));
    },
    [removeLocal],
  );

  return {
    highlights,
    highlightedMap,
    loaded,
    add,
    remove,
  };
}

import { useCallback, useEffect } from "react";

import {
  DEFAULT_HIGHLIGHT_COLOR,
  getHighlights,
  removeHighlight as removeHl,
  upsertHighlight as upsertHl,
} from "../../../shared/bible";
import type { BibleVerse } from "../../../shared/bible";
import { useHighlightStore } from "../store/highlight-store";

export const useHighlights = () => {
  const highlights = useHighlightStore((s) => s.highlights);
  const highlightedMap = useHighlightStore((s) => s.highlightedMap);
  const loaded = useHighlightStore((s) => s.loaded);
  const hydrate = useHighlightStore((s) => s.hydrate);
  const upsertLocal = useHighlightStore((s) => s.upsertLocal);
  const removeLocal = useHighlightStore((s) => s.removeLocal);

  useEffect(() => {
    if (loaded) {
      return;
    }

    let mounted = true;

    const load = async () => {
      const hlList = await getHighlights();

      if (mounted) {
        hydrate(hlList);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [loaded, hydrate]);

  const add = useCallback(
    async (verse: BibleVerse) => {
      await upsertHl(
        verse.id,
        verse.book,
        verse.chapter,
        verse.verse,
        verse.text
      );
      upsertLocal({
        book: verse.book,
        chapter: verse.chapter,
        color: DEFAULT_HIGHLIGHT_COLOR,
        createdAt: Date.now(),
        text: verse.text,
        updatedAt: Date.now(),
        verse: verse.verse,
        verseId: verse.id,
      });
    },
    [upsertLocal]
  );

  const remove = useCallback(
    async (verseId: number) => {
      await removeHl(verseId);
      removeLocal(verseId);
    },
    [removeLocal]
  );

  return {
    add,
    highlightedMap,
    highlights,
    loaded,
    remove,
  };
};

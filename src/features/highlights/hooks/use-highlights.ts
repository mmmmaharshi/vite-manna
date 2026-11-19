import { useCallback, useEffect, useMemo } from "react";

import {
  DEFAULT_HIGHLIGHT_COLOR,
  getHighlights,
  removeHighlight as removeHl,
  upsertHighlight as upsertHl,
} from "../../../shared/bible";
import type { BibleVerse } from "../../../shared/bible";
import { useHighlightStore } from "../store/highlight-store";

export const HIGHLIGHTS_LOAD_ERROR = "Unable to load highlights.";

/**
 * Loads highlight state and exposes add/remove actions backed by IndexedDB.
 *
 * @returns The highlight state and actions.
 */
export const useHighlights = () => {
  const highlights = useHighlightStore((s) => s.highlights);
  const highlightedIds = useMemo(
    () => new Set(highlights.map((highlight) => highlight.verseId)),
    [highlights]
  );
  const loaded = useHighlightStore((s) => s.loaded);
  const error = useHighlightStore((s) => s.error);
  const hydrate = useHighlightStore((s) => s.hydrate);
  const setError = useHighlightStore((s) => s.setError);
  const upsertLocal = useHighlightStore((s) => s.upsertLocal);
  const removeLocal = useHighlightStore((s) => s.removeLocal);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (loaded) {
        return;
      }

      try {
        const hlList = await getHighlights();

        if (mounted) {
          hydrate(hlList);
        }
      } catch {
        if (mounted) {
          setError(HIGHLIGHTS_LOAD_ERROR);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [loaded, hydrate, setError]);

  const add = useCallback(
    async (verse: BibleVerse) => {
      const now = Date.now();

      try {
        await upsertHl({
          book: verse.book,
          chapter: verse.chapter,
          text: verse.text,
          verse: verse.verse,
          verseId: verse.id,
        });
        upsertLocal({
          book: verse.book,
          chapter: verse.chapter,
          color: DEFAULT_HIGHLIGHT_COLOR,
          createdAt: now,
          text: verse.text,
          updatedAt: now,
          verse: verse.verse,
          verseId: verse.id,
        });

        return true;
      } catch {
        return false;
      }
    },
    [upsertLocal]
  );

  const remove = useCallback(
    async (verseId: number) => {
      try {
        await removeHl(verseId);
        removeLocal(verseId);

        return true;
      } catch {
        return false;
      }
    },
    [removeLocal]
  );

  return {
    add,
    error,
    highlightedIds,
    highlights,
    loaded,
    remove,
  };
};

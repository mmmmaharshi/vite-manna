import { useCallback, useEffect } from "react";

import {
  DEFAULT_HIGHLIGHT_COLOR,
  getHighlights,
  removeHighlight as removeHl,
  upsertHighlight as upsertHl,
} from "../../../shared/bible";
import type { BibleVerse } from "../../../shared/bible";
import { useHighlightStore } from "../store/highlight-store";

export const HIGHLIGHTS_LOAD_ERROR = "Unable to load highlights.";

export const useHighlights = () => {
  const highlights = useHighlightStore((s) => s.highlights);
  const highlightedMap = useHighlightStore((s) => s.highlightedMap);
  const loaded = useHighlightStore((s) => s.loaded);
  const error = useHighlightStore((s) => s.error);
  const hydrate = useHighlightStore((s) => s.hydrate);
  const setError = useHighlightStore((s) => s.setError);
  const upsertLocal = useHighlightStore((s) => s.upsertLocal);
  const removeLocal = useHighlightStore((s) => s.removeLocal);

  useEffect(() => {
    if (loaded) {
      return;
    }

    let mounted = true;

    const load = async () => {
      try {
        const hlList = await getHighlights();

        if (mounted) {
          hydrate(hlList);
        }
      } catch {
        // Without this the Highlights tab would sit on its loading placeholder forever.
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
      try {
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
    highlightedMap,
    highlights,
    loaded,
    remove,
  };
};

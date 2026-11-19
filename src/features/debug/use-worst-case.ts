import { useEffect } from "react";
import { useSearchParams } from "react-router";

import { isFontSize } from "../../shared/lib/font-size";
import { useFontSizeStore } from "../../shared/lib/font-size-store";
import { useReaderStore } from "../reader/store/reader-store";
import {
  clearStashedFont,
  clearWorstCaseHighlights,
  readStashedFont,
  seedWorstCaseHighlights,
  stashFontOnce,
  WORST_BOOK,
  WORST_CHAPTER,
  WORST_FONT,
} from "./worst-case";

/**
 * The worst-case harness states.
 */
export type WorstCaseMode = "demo" | "worst" | "huge";

const WORST_PARAM = "worst";

const readMode = (params: URLSearchParams) => {
  const raw = params.get(WORST_PARAM);

  if (raw === "worst" || raw === "huge") {
    return raw;
  }

  return "demo";
};

const restoreStashedFont = () => {
  const stashed = readStashedFont();

  if (stashed !== null && isFontSize(stashed)) {
    useFontSizeStore.getState().setFontSize(stashed);
  }

  clearStashedFont();
};

/**
 * Applies the worst-case state from the URL: biggest chapter, biggest type,
 * and optionally a huge synthetic highlight list. Dev only; inert in prod.
 *
 * @returns The active mode and a setter that persists it in the URL.
 */
export const useWorstCase = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = import.meta.env.DEV ? readMode(searchParams) : "demo";

  useEffect(() => {
    let cancelled = false;

    if (import.meta.env.DEV && mode !== "demo") {
      const store = useReaderStore.getState();
      const fontStore = useFontSizeStore.getState();

      stashFontOnce(fontStore.fontSize);
      fontStore.setFontSize(WORST_FONT);
      store.goToChapter(WORST_BOOK, WORST_CHAPTER);

      const seed = async () => {
        if (cancelled || mode !== "huge") {
          return;
        }

        await seedWorstCaseHighlights();
      };

      void seed();
    }

    return () => {
      cancelled = true;
    };
  }, [mode]);

  const selectMode = (next: WorstCaseMode) => {
    const params = new URLSearchParams(searchParams);

    if (next === "demo") {
      params.delete(WORST_PARAM);
      void clearWorstCaseHighlights().then(restoreStashedFont);
    } else {
      params.set(WORST_PARAM, next);
    }

    setSearchParams(params, { replace: true });
  };

  return { mode, selectMode };
};

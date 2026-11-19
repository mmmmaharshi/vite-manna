import { create } from "zustand";

import type { Highlight } from "../../../shared/bible";

/**
 * The highlight list state.
 */
export interface HighlightStore {
  highlights: Highlight[];
  highlightedIds: Set<number>;
  loaded: boolean;
  error: string | null;
  hydrate: (highlights: Highlight[]) => void;
  setError: (message: string | null) => void;
  upsertLocal: (highlight: Highlight) => void;
  removeLocal: (verseId: number) => void;
}

/**
 * The highlight list store.
 */
export const useHighlightStore = create<HighlightStore>((set) => ({
  error: null,
  highlightedIds: new Set(),
  highlights: [],
  hydrate: (highlights) => {
    set({
      error: null,
      highlightedIds: new Set(highlights.map((h) => h.verseId)),
      highlights,
      loaded: true,
    });
  },
  loaded: false,
  removeLocal: (verseId) => {
    set((state) => {
      const next = new Set(state.highlightedIds);
      next.delete(verseId);

      return {
        highlightedIds: next,
        highlights: state.highlights.filter((h) => h.verseId !== verseId),
      };
    });
  },
  setError: (message) => {
    set({ error: message });
  },
  upsertLocal: (highlight) => {
    set((state) => {
      const filtered = state.highlights.filter(
        (h) => h.verseId !== highlight.verseId
      );

      const next = new Set(state.highlightedIds);
      next.add(highlight.verseId);

      return {
        highlightedIds: next,
        highlights: [highlight, ...filtered],
      };
    });
  },
}));

import { create } from "zustand";

import type { Highlight, HighlightColor } from "../../../shared/bible";

export interface HighlightStore {
  highlights: Highlight[];
  highlightedMap: Map<number, HighlightColor>;
  loaded: boolean;
  error: string | null;
  hydrate: (highlights: Highlight[]) => void;
  setError: (message: string | null) => void;
  upsertLocal: (highlight: Highlight) => void;
  removeLocal: (verseId: number) => void;
}

export const useHighlightStore = create<HighlightStore>((set) => ({
  error: null,
  highlightedMap: new Map(),
  highlights: [],
  hydrate: (highlights) => {
    set({
      error: null,
      highlightedMap: new Map(highlights.map((h) => [h.verseId, h.color])),
      highlights,
      loaded: true,
    });
  },
  loaded: false,
  removeLocal: (verseId) => {
    set((state) => {
      const next = new Map(state.highlightedMap);
      next.delete(verseId);

      return {
        highlightedMap: next,
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

      const entries: [number, HighlightColor][] = [
        ...state.highlightedMap,
        [highlight.verseId, highlight.color],
      ];

      return {
        highlightedMap: new Map(entries),
        highlights: [highlight, ...filtered],
      };
    });
  },
}));

import { create } from "zustand";

import type { HighlightColor } from "../../../shared/bible";

export interface HighlightEntry {
  verseId: number;
  book: number;
  chapter: number;
  verse: number;
  text: string;
  color: HighlightColor;
  createdAt: number;
  updatedAt: number;
}

export interface HighlightStore {
  highlights: HighlightEntry[];
  highlightedMap: Map<number, HighlightColor>;
  loaded: boolean;
  hydrate: (highlights: HighlightEntry[]) => void;
  upsertLocal: (highlight: HighlightEntry) => void;
  removeLocal: (verseId: number) => void;
}

export const useHighlightStore = create<HighlightStore>((set) => ({
  highlightedMap: new Map(),
  highlights: [],
  hydrate: (highlights) => {
    set({
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

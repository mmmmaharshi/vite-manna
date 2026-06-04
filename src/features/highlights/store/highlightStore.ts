import { create } from "zustand";
import type { HighlightColor } from "../../../shared/bible";

export interface HighlightEntry {
  id: number;
  verseId: number;
  book: number;
  chapter: number;
  verse: number;
  text: string;
  color: HighlightColor;
  note: string;
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
  highlights: [],
  highlightedMap: new Map(),
  loaded: false,

  hydrate: (highlights) => {
    set({
      highlights,
      highlightedMap: new Map(highlights.map((h) => [h.verseId, h.color])),
      loaded: true,
    });
  },

  upsertLocal: (highlight) => {
    set((state) => {
      const filtered = state.highlights.filter(
        (h) => h.verseId !== highlight.verseId,
      );
      const next = new Map(state.highlightedMap);
      next.set(highlight.verseId, highlight.color);
      return {
        highlights: [highlight, ...filtered],
        highlightedMap: next,
      };
    });
  },

  removeLocal: (verseId) => {
    set((state) => {
      const next = new Map(state.highlightedMap);
      next.delete(verseId);
      return {
        highlights: state.highlights.filter((h) => h.verseId !== verseId),
        highlightedMap: next,
      };
    });
  },
}));

import { create } from "zustand";

import type { Highlight } from "../../../shared/bible";

/**
 * The highlight list state.
 */
export interface HighlightStore {
  highlights: Highlight[];
  loaded: boolean;
  error: string | null;
  hydrate: (highlights: Highlight[]) => void;
  setError: (message: string | null) => void;
  upsertLocal: (highlight: Highlight) => void;
  removeLocal: (verseId: number) => void;
}

/**
 * The highlight list store. Membership is derived from `highlights`, never
 * stored twice.
 */
export const useHighlightStore = create<HighlightStore>((set) => ({
  error: null,
  highlights: [],
  hydrate: (highlights) => {
    set({
      error: null,
      loaded: true,
      highlights,
    });
  },
  loaded: false,
  removeLocal: (verseId) => {
    set((state) => ({
      highlights: state.highlights.filter((h) => h.verseId !== verseId),
    }));
  },
  setError: (message) => {
    set({ error: message });
  },
  upsertLocal: (highlight) => {
    set((state) => ({
      highlights: [
        highlight,
        ...state.highlights.filter((h) => h.verseId !== highlight.verseId),
      ],
    }));
  },
}));

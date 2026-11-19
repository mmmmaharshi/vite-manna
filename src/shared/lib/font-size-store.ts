import { create } from "zustand";

import type { FontSize } from "./font-size";
import { loadFontSize, setStoredFontSize } from "./persistence";

interface FontSizeState {
  fontSize: FontSize;
  setFontSize: (fontSize: FontSize) => void;
}

/**
 * The reader font size, persisted across sessions.
 */
export const useFontSizeStore = create<FontSizeState>((set) => ({
  fontSize: loadFontSize(),
  setFontSize: (fontSize) => {
    setStoredFontSize(fontSize);
    set({ fontSize });
  },
}));

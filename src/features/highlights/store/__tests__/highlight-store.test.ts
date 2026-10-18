import { beforeEach, describe, expect, it } from "vite-plus/test";

import { useHighlightStore } from "../highlight-store";

const highlight = (verseId: number, color: "yellow" | "blue" = "yellow") => ({
  book: 1,
  chapter: 1,
  color,
  createdAt: verseId,
  text: `verse ${verseId}`,
  updatedAt: verseId,
  verse: verseId,
  verseId,
});

describe("highlight store", () => {
  beforeEach(() => {
    useHighlightStore.setState({
      error: null,
      highlightedMap: new Map(),
      highlights: [],
      loaded: false,
    });
  });

  describe("hydrate", () => {
    it("loads the highlights and their colors", () => {
      useHighlightStore
        .getState()
        .hydrate([highlight(1), highlight(2, "blue")]);

      const state = useHighlightStore.getState();

      expect(state.loaded).toBeTruthy();
      expect(state.highlights).toHaveLength(2);
      expect(state.highlightedMap.get(2)).toBe("blue");
    });
  });

  describe("upsertLocal", () => {
    it("prepends the highlight and replaces one for the same verse", () => {
      useHighlightStore.getState().hydrate([highlight(1)]);
      useHighlightStore.getState().upsertLocal(highlight(2, "blue"));
      useHighlightStore.getState().upsertLocal(highlight(1, "blue"));

      const state = useHighlightStore.getState();

      expect(state.highlights.map((h) => h.verseId)).toStrictEqual([1, 2]);
      expect(state.highlightedMap.get(1)).toBe("blue");
    });
  });

  describe("removeLocal", () => {
    it("drops the highlight and its color", () => {
      useHighlightStore.getState().hydrate([highlight(1), highlight(2)]);

      useHighlightStore.getState().removeLocal(1);

      const state = useHighlightStore.getState();

      expect(state.highlights.map((h) => h.verseId)).toStrictEqual([2]);
      expect(state.highlightedMap.has(1)).toBeFalsy();
    });
  });

  describe("setError", () => {
    it("stores and clears the message", () => {
      useHighlightStore.getState().setError("Unable to load highlights.");

      expect(useHighlightStore.getState().error).toBe(
        "Unable to load highlights."
      );

      useHighlightStore.getState().setError(null);

      expect(useHighlightStore.getState().error).toBeNull();
    });
  });
});

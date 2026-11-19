import { beforeEach, describe, expect, it } from "vite-plus/test";

import { useHighlightStore } from "./highlight-store";

const highlight = (verseId: number, color = "yellow") => ({
  book: 1,
  chapter: 1,
  createdAt: verseId,
  text: `verse ${verseId}`,
  updatedAt: verseId,
  verse: verseId,
  color,
  verseId,
});

describe("highlight store", () => {
  beforeEach(() => {
    useHighlightStore.setState({
      error: null,
      highlights: [],
      loaded: false,
    });
  });

  describe("hydrate", () => {
    it("loads the highlights and clears any error", () => {
      useHighlightStore.getState().setError("Unable to load highlights.");
      useHighlightStore.getState().hydrate([highlight(1), highlight(2)]);

      const state = useHighlightStore.getState();

      expect(state.loaded).toBeTruthy();
      expect(state.error).toBeNull();
      expect(state.highlights).toHaveLength(2);
    });
  });

  describe("upsertLocal", () => {
    it("prepends the highlight and replaces text for the same verse", () => {
      useHighlightStore.getState().hydrate([highlight(1)]);
      useHighlightStore.getState().upsertLocal(highlight(2));
      useHighlightStore
        .getState()
        .upsertLocal({ ...highlight(1), text: "updated" });

      const state = useHighlightStore.getState();

      expect(state.highlights.map((h) => h.verseId)).toStrictEqual([1, 2]);
      expect(state.highlights[0].text).toBe("updated");
    });
  });

  describe("removeLocal", () => {
    it("drops the highlight", () => {
      useHighlightStore.getState().hydrate([highlight(1), highlight(2)]);

      useHighlightStore.getState().removeLocal(1);

      const state = useHighlightStore.getState();

      expect(state.highlights.map((h) => h.verseId)).toStrictEqual([2]);
    });

    it("keeps the list when the id is missing", () => {
      useHighlightStore.getState().hydrate([highlight(1)]);

      useHighlightStore.getState().removeLocal(9);

      expect(useHighlightStore.getState().highlights).toHaveLength(1);
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

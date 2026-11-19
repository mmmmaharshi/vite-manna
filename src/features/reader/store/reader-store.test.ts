import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";

import type * as ReaderStoreApi from "./reader-store";

let useReaderStore: typeof ReaderStoreApi.useReaderStore;
let selectIsSelectionMode: typeof ReaderStoreApi.selectIsSelectionMode;

const createStorage = () => {
  const entries = new Map<string, string>();

  return {
    clear: () => entries.clear(),
    getItem: (key: string) => entries.get(key) ?? null,
    removeItem: (key: string) => entries.delete(key),
    setItem: (key: string, value: string) => entries.set(key, value),
  };
};

describe("reader store", () => {
  beforeAll(async () => {
    vi.stubGlobal("window", { location: { search: "" } });
    vi.stubGlobal("localStorage", createStorage());

    ({ selectIsSelectionMode, useReaderStore } =
      await import("./reader-store"));
  });

  beforeEach(() => {
    useReaderStore.setState({
      book: 1,
      chapter: 1,
      chaptersByBook: {},
      isBookSelectOpen: false,
      pendingBook: null,
      permalinkVerse: null,
      selectedVerseIds: [],
    });
  });

  describe("verse selection", () => {
    it("derives selection mode from the selected ids", () => {
      expect(selectIsSelectionMode(useReaderStore.getState())).toBeFalsy();

      useReaderStore.getState().toggleVerseSelection(7);

      expect(selectIsSelectionMode(useReaderStore.getState())).toBeTruthy();
      expect(useReaderStore.getState().selectedVerseIds).toStrictEqual([7]);
    });

    it("toggles an already selected verse off and leaves the mode", () => {
      useReaderStore.getState().toggleVerseSelection(7);
      useReaderStore.getState().toggleVerseSelection(7);

      expect(useReaderStore.getState().selectedVerseIds).toStrictEqual([]);
      expect(selectIsSelectionMode(useReaderStore.getState())).toBeFalsy();
    });

    it("clears the whole selection at once", () => {
      useReaderStore.getState().toggleVerseSelection(7);
      useReaderStore.getState().toggleVerseSelection(9);
      useReaderStore.getState().clearVerseSelection();

      expect(useReaderStore.getState().selectedVerseIds).toStrictEqual([]);
    });

    it("drops the selection when navigating", () => {
      useReaderStore.getState().toggleVerseSelection(7);
      useReaderStore.getState().setChapter(2);

      expect(useReaderStore.getState().selectedVerseIds).toStrictEqual([]);
      expect(selectIsSelectionMode(useReaderStore.getState())).toBeFalsy();
    });
  });

  describe("chapter memory", () => {
    it("remembers the last chapter per book", () => {
      useReaderStore.getState().setChapter(3);
      useReaderStore.getState().setBook(2);
      useReaderStore.getState().setBook(1);

      expect(useReaderStore.getState().chapter).toBe(3);
    });

    it("clears the permalink and selection when the book changes", () => {
      useReaderStore.getState().toggleVerseSelection(7);
      useReaderStore.getState().setPermalinkVerse(16);
      useReaderStore.getState().setBook(2);

      expect(useReaderStore.getState().permalinkVerse).toBeNull();
      expect(useReaderStore.getState().selectedVerseIds).toStrictEqual([]);
    });
  });

  describe("goToVerse", () => {
    it("moves to the verse in one step", () => {
      useReaderStore.getState().goToVerse({ book: 43, chapter: 3, verse: 16 });

      expect(useReaderStore.getState()).toMatchObject({
        book: 43,
        chapter: 3,
        permalinkVerse: 16,
      });
    });

    it("moves across books without a selection", () => {
      useReaderStore.getState().goToChapter(43, 3);

      expect(useReaderStore.getState()).toMatchObject({
        book: 43,
        chapter: 3,
        permalinkVerse: null,
      });
    });
  });

  describe("setPermalinkVerse", () => {
    it("ignores setting the same verse twice", () => {
      useReaderStore.getState().setPermalinkVerse(16);
      useReaderStore.getState().setPermalinkVerse(16);

      expect(useReaderStore.getState().permalinkVerse).toBe(16);
    });
  });

  describe("book select transition", () => {
    it("stays open while a book is pending and closes when cleared", () => {
      useReaderStore.getState().selectBook(5);

      expect(useReaderStore.getState()).toMatchObject({
        book: 5,
        isBookSelectOpen: true,
        pendingBook: 5,
      });

      useReaderStore.getState().closeBookSelect();

      expect(useReaderStore.getState().isBookSelectOpen).toBeTruthy();

      useReaderStore.getState().clearPendingBook();

      expect(useReaderStore.getState()).toMatchObject({
        isBookSelectOpen: false,
        pendingBook: null,
      });
    });
  });
});

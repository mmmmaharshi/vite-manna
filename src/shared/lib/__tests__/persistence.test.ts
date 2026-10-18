import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";

import {
  loadFontSize,
  loadInitialState,
  resolveReaderLocation,
  saveReaderLocation,
  setStoredFontSize,
} from "../persistence";

interface StoredFixture {
  book: number;
  chapter: number | string;
  chaptersByBook?: Record<string, number | string>;
}

const stored = (value: StoredFixture) => JSON.stringify(value);

const createStorage = () => {
  const entries = new Map<string, string>();

  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      entries.set(key, value);
    },
  };
};

describe(resolveReaderLocation, () => {
  it("falls back to Genesis 1 with no URL and no stored value", () => {
    expect(resolveReaderLocation("", null)).toStrictEqual({
      book: 1,
      chapter: 1,
      chaptersByBook: {},
      permalinkVerse: null,
    });
  });

  it("restores the stored book, chapter and per-book chapters", () => {
    const state = resolveReaderLocation(
      "",
      stored({
        book: 43,
        chapter: 3,
        chaptersByBook: { 19: 100, 43: 3 },
      })
    );

    expect(state.book).toBe(43);
    expect(state.chapter).toBe(3);
    expect(state.chaptersByBook).toStrictEqual({ 19: 100, 43: 3 });
    expect(state.permalinkVerse).toBeNull();
  });

  it("lets the URL win over the stored value and keeps the verse", () => {
    const state = resolveReaderLocation(
      "?book=66&chapter=22&verse=21",
      stored({ book: 1, chapter: 1 })
    );

    expect(state.book).toBe(66);
    expect(state.chapter).toBe(22);
    expect(state.permalinkVerse).toBe(21);
    expect(state.chaptersByBook).toStrictEqual({ 66: 22 });
  });

  it("survives corrupt or out-of-range values", () => {
    expect(resolveReaderLocation("", "not json").book).toBe(1);
    expect(resolveReaderLocation("", "[]").book).toBe(1);
    expect(
      resolveReaderLocation("", stored({ book: 999, chapter: 3 })).book
    ).toBe(1);
    expect(
      resolveReaderLocation("", stored({ book: 43, chapter: "x" })).book
    ).toBe(1);
    expect(resolveReaderLocation("?book=abc&chapter=3", null)).toStrictEqual({
      book: 1,
      chapter: 1,
      chaptersByBook: {},
      permalinkVerse: null,
    });
  });

  it("drops per-book chapters that are not positive integers", () => {
    const state = resolveReaderLocation(
      "",
      stored({
        book: 43,
        chapter: 3,
        chaptersByBook: { 19: "x", 43: 3, bad: 2 },
      })
    );

    expect(state.chaptersByBook).toStrictEqual({ 43: 3 });
  });
});

describe("stored reader state", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createStorage());
    vi.stubGlobal("window", { location: { search: "" } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("round-trips the reader location", () => {
    saveReaderLocation({ book: 43, chapter: 3, chaptersByBook: { 43: 3 } });

    expect(loadInitialState()).toStrictEqual({
      book: 43,
      chapter: 3,
      chaptersByBook: { 43: 3 },
      permalinkVerse: null,
    });
  });

  it("prefers the URL over the stored location", () => {
    saveReaderLocation({ book: 43, chapter: 3, chaptersByBook: {} });
    vi.stubGlobal("window", { location: { search: "?book=2&chapter=5" } });

    expect(loadInitialState()).toMatchObject({ book: 2, chapter: 5 });
  });

  it("defaults the font size and round-trips a stored one", () => {
    expect(loadFontSize()).toBe("sm");

    setStoredFontSize("xl");

    expect(loadFontSize()).toBe("xl");
  });

  it("ignores a stored font size that is not a size", () => {
    localStorage.setItem("manna.reader-font-size", "huge");

    expect(loadFontSize()).toBe("sm");
  });
});

describe("storage failures", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("warns once and falls back when localStorage is unavailable", async () => {
    const warn = vi.spyOn(console, "warn").mockReturnValue();

    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("quota");
      },
    });
    vi.stubGlobal("window", { location: { search: "" } });

    // A fresh module instance, so the warn-once flag has not been set yet.
    vi.resetModules();
    const persistence = await import("../persistence");

    expect(persistence.loadInitialState().book).toBe(1);
    expect(persistence.loadFontSize()).toBe("sm");
    persistence.saveReaderLocation({ book: 1, chapter: 1, chaptersByBook: {} });
    persistence.setStoredFontSize("lg");
    expect(persistence.resolveReaderLocation("", "not json").book).toBe(1);

    expect(warn).toHaveBeenCalledOnce();
  });
});

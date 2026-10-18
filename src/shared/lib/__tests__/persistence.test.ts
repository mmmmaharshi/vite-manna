import { describe, expect, it } from "vite-plus/test";

import { resolveReaderLocation } from "../persistence";

interface StoredFixture {
  book: number;
  chapter: number | string;
  chaptersByBook?: Record<string, number | string>;
  version: number;
}

const stored = (value: StoredFixture) => JSON.stringify(value);

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
        version: 1,
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
      stored({ book: 1, chapter: 1, version: 1 })
    );

    expect(state.book).toBe(66);
    expect(state.chapter).toBe(22);
    expect(state.permalinkVerse).toBe(21);
    expect(state.chaptersByBook).toStrictEqual({ 66: 22 });
  });

  it("ignores stored values written by another version", () => {
    const state = resolveReaderLocation(
      "",
      stored({ book: 43, chapter: 3, version: 0 })
    );

    expect(state.book).toBe(1);
    expect(state.chapter).toBe(1);
  });

  it("survives corrupt or out-of-range values", () => {
    expect(resolveReaderLocation("", "not json").book).toBe(1);
    expect(resolveReaderLocation("", "[]").book).toBe(1);
    expect(
      resolveReaderLocation("", stored({ book: 999, chapter: 3, version: 1 }))
        .book
    ).toBe(1);
    expect(
      resolveReaderLocation("", stored({ book: 43, chapter: "x", version: 1 }))
        .book
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
        version: 1,
      })
    );

    expect(state.chaptersByBook).toStrictEqual({ 43: 3 });
  });
});

import { describe, expect, it } from "vite-plus/test";

import type { NamedBook } from "../../../shared/bible";
import { navigateChapter } from "./navigate-chapter";

const books: Array<NamedBook> = [
  { chapterCount: 2, id: 1, name: "One" },
  { chapterCount: 3, id: 2, name: "Two" },
];

describe(navigateChapter, () => {
  it("steps within the same book", () => {
    expect(navigateChapter(books, 1, 1, "next")).toStrictEqual({
      book: 1,
      chapter: 2,
    });
    expect(navigateChapter(books, 2, 3, "prev")).toStrictEqual({
      book: 2,
      chapter: 2,
    });
  });

  it("crosses into the next book from its last chapter", () => {
    expect(navigateChapter(books, 1, 2, "next")).toStrictEqual({
      book: 2,
      chapter: 1,
    });
  });

  it("crosses into the previous book's last chapter from chapter one", () => {
    expect(navigateChapter(books, 2, 1, "prev")).toStrictEqual({
      book: 1,
      chapter: 2,
    });
  });

  it("returns null past either end of the canon", () => {
    expect(navigateChapter(books, 2, 3, "next")).toBeNull();
    expect(navigateChapter(books, 1, 1, "prev")).toBeNull();
  });

  it("returns null for an unknown book", () => {
    expect(navigateChapter(books, 9, 1, "next")).toBeNull();
  });
});

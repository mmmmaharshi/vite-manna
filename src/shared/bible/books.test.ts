import { describe, expect, it } from "vite-plus/test";

import {
  attachBookNames,
  BIBLE_BOOK_NAMES,
  getBibleBookName,
  OLD_TESTAMENT_BOOK_COUNT,
} from "./books";

describe(getBibleBookName, () => {
  it("falls back to a numbered name outside the canon", () => {
    expect(getBibleBookName(1)).toBe(BIBLE_BOOK_NAMES[0]);
    expect(getBibleBookName(67)).toBe("Book 67");
  });
});

describe(attachBookNames, () => {
  it("pairs each summary with its Telugu name", () => {
    expect(attachBookNames([{ chapterCount: 50, id: 19 }])).toStrictEqual([
      { chapterCount: 50, id: 19, name: BIBLE_BOOK_NAMES[18] },
    ]);
  });
});

describe("canon shape", () => {
  it("orders the Old Testament first", () => {
    expect(BIBLE_BOOK_NAMES).toHaveLength(66);
    expect(OLD_TESTAMENT_BOOK_COUNT).toBe(39);
  });
});

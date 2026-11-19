import { describe, expect, it } from "vite-plus/test";

import {
  attachBookNames,
  BIBLE_BOOK_NAMES,
  getBibleBookName,
  OLD_TESTAMENT_BOOK_COUNT,
} from "./books";

describe(getBibleBookName, () => {
  it("falls back to a numbered name outside the canon", () => {
    expect(getBibleBookName(1)).toBe("ఆదికాండము");
    expect(getBibleBookName(67)).toBe("Book 67");
  });
});

describe(attachBookNames, () => {
  it("pairs each summary with its Telugu name", () => {
    expect(attachBookNames([{ chapterCount: 50, id: 19 }])).toStrictEqual([
      { chapterCount: 50, id: 19, name: "కీర్తనలు" },
    ]);
  });
});

describe("canon shape", () => {
  it("orders the Old Testament first", () => {
    expect(BIBLE_BOOK_NAMES[0]).toBe("ఆదికాండము");
    expect(BIBLE_BOOK_NAMES[38]).toBe("మలాకీ");
    expect(BIBLE_BOOK_NAMES[39]).toBe("మత్తయి");
    expect(BIBLE_BOOK_NAMES[65]).toBe("ప్రకటన గ్రంథము");
  });

  it("counts sixty-six books with thirty-nine in the Old Testament", () => {
    expect(BIBLE_BOOK_NAMES).toHaveLength(66);
    expect(OLD_TESTAMENT_BOOK_COUNT).toBe(39);
  });
});

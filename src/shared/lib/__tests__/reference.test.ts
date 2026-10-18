import { describe, expect, it } from "vite-plus/test";

import { BIBLE_BOOK_NAMES } from "../../bible/books";
import { formatReference } from "../reference";

describe(formatReference, () => {
  it("names the book and chapter, and appends the verse when given", () => {
    expect(formatReference(1, 1)).toBe("ఆదికాండము 1");
    expect(formatReference(43, 3)).toBe(`${BIBLE_BOOK_NAMES[42]} 3`);
    expect(formatReference(43, 3, 16)).toBe(`${BIBLE_BOOK_NAMES[42]} 3:16`);
  });
});

import { describe, expect, it } from "vitest";
import { parseVerseref } from "../dailyVerseData";

describe("parseVerseref", () => {
  it("parses a simple verse reference", () => {
    const result = parseVerseref("John 3:16");
    expect(result).toEqual({ book: 43, chapter: 3, verse: 16 });
  });

  it("parses a verse with book prefix", () => {
    const result = parseVerseref("1 John 4:8");
    expect(result).toEqual({ book: 62, chapter: 4, verse: 8 });
  });

  it("strips suffixes after verse number", () => {
    const result = parseVerseref("James 3:7\u20138");
    expect(result).toEqual({ book: 59, chapter: 3, verse: 7 });
  });

  it("returns nulls for an unmatchable string", () => {
    const result = parseVerseref("");
    expect(result).toEqual({ book: null, chapter: null, verse: null });
  });
});

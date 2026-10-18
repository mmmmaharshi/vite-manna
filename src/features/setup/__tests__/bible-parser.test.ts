import { describe, expect, it } from "vite-plus/test";

import { parseBibleResponse, readBible } from "../bible-parser";

const FIXTURE = JSON.stringify({
  Book: [
    {
      Chapter: [
        {
          Verse: [
            { Verse: "ఆదియందు", Verseid: 1001 },
            { Verse: "రెండవ", Verseid: 1002 },
          ],
        },
        { Verse: [{ Verse: "మూడవ", Verseid: 2001 }] },
      ],
    },
    { Chapter: [{ Verse: [{ Verse: "నాలుగవ", Verseid: 3001 }] }] },
  ],
});

describe(readBible, () => {
  it("numbers books, chapters and verses from their position", () => {
    const { verses } = readBible(parseBibleResponse(FIXTURE));

    expect(verses.map((verse) => verse.book)).toStrictEqual([1, 1, 1, 2]);
    expect(verses.map((verse) => verse.chapter)).toStrictEqual([1, 1, 2, 1]);
    expect(verses.map((verse) => verse.verse)).toStrictEqual([1, 2, 1, 1]);
    expect(verses.map((verse) => verse.id)).toStrictEqual([
      1001, 1002, 2001, 3001,
    ]);
    expect(verses[0].text).toBe("ఆదియందు");
  });

  it("reports the chapter count of every book in order", () => {
    const { chapterCounts } = readBible(parseBibleResponse(FIXTURE));

    expect(chapterCounts).toStrictEqual([
      [1, 2],
      [2, 1],
    ]);
  });

  it("rejects JSON that is not a Bible response", () => {
    expect(() => parseBibleResponse("[]")).toThrow("unexpected shape");
    expect(() => parseBibleResponse("{}")).toThrow("unexpected shape");
    expect(() => parseBibleResponse("null")).toThrow("unexpected shape");
  });

  it("rejects invalid JSON", () => {
    expect(() => parseBibleResponse("{")).toThrow(/JSON/u);
  });
});

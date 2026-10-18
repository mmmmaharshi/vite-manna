import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vite-plus/test";

import {
  clearBibleSeed,
  getChapterNumbers,
  getHighlights,
  getReaderBootstrap,
  getReaderSnapshot,
  getVerses,
  isBibleSeeded,
  markBibleSeeded,
  putVerses,
  removeHighlight,
  searchVerses,
  upsertHighlight,
} from "../bible-repository";
import { db } from "../db";

const versesFor = (book: number, chapter: number, texts: string[]) =>
  texts.map((text, index) => ({
    book,
    chapter,
    id: book * 1_000_000 + chapter * 1000 + index + 1,
    text,
    verse: index + 1,
  }));

describe("bible repository", () => {
  beforeEach(async () => {
    await Promise.all([
      db.verses.clear(),
      db.meta.clear(),
      db.highlights.clear(),
    ]);
  });

  describe(isBibleSeeded, () => {
    it("reports unseeded until a seed is marked", async () => {
      await expect(isBibleSeeded()).resolves.toBeFalsy();

      await markBibleSeeded([
        [1, 3],
        [2, 1],
      ]);

      await expect(isBibleSeeded()).resolves.toBeTruthy();
    });
  });

  describe(clearBibleSeed, () => {
    it("drops the verses and the marker", async () => {
      await putVerses(versesFor(1, 1, ["a"]));
      await markBibleSeeded([[1, 1]]);

      await clearBibleSeed();

      await expect(isBibleSeeded()).resolves.toBeFalsy();
      await expect(getVerses(1, 1)).resolves.toStrictEqual([]);
      await expect(getChapterNumbers(1)).resolves.toStrictEqual([]);
    });
  });

  describe(getChapterNumbers, () => {
    it("counts up to the seeded chapter count", async () => {
      await markBibleSeeded([
        [1, 3],
        [2, 1],
      ]);

      await expect(getChapterNumbers(1)).resolves.toStrictEqual([1, 2, 3]);
      await expect(getChapterNumbers(66)).resolves.toStrictEqual([]);
    });

    it("ignores chapter counts that are not pairs of numbers", async () => {
      await db.meta.put({ key: "chapterCounts", value: [[1, "x"]] });

      await expect(getChapterNumbers(1)).resolves.toStrictEqual([]);
    });
  });

  describe(getVerses, () => {
    it("returns a chapter in verse order", async () => {
      await putVerses([
        { book: 1, chapter: 1, id: 3, text: "third", verse: 3 },
        { book: 1, chapter: 1, id: 1, text: "first", verse: 1 },
      ]);

      const verses = await getVerses(1, 1);

      expect(verses.map((v) => v.text)).toStrictEqual(["first", "third"]);
    });
  });

  describe(getReaderSnapshot, () => {
    it("returns the requested chapter", async () => {
      await markBibleSeeded([[1, 2]]);
      await putVerses(versesFor(1, 2, ["b1", "b2"]));

      const snapshot = await getReaderSnapshot(1, 2);

      expect(snapshot.chapters).toStrictEqual([1, 2]);
      expect(snapshot.chapter).toBe(2);
      expect(snapshot.verses.map((v) => v.text)).toStrictEqual(["b1", "b2"]);
    });

    it("falls back to the first chapter for a chapter the book does not have", async () => {
      await markBibleSeeded([[1, 2]]);

      await expect(getReaderSnapshot(1, 9)).resolves.toMatchObject({
        chapter: 1,
        verses: [],
      });
    });
  });

  describe(getReaderBootstrap, () => {
    it("returns every book and the requested place", async () => {
      await markBibleSeeded([
        [1, 2],
        [2, 1],
      ]);
      await putVerses(versesFor(2, 1, ["c"]));

      const { books, snapshot } = await getReaderBootstrap(2, 1);

      expect(books).toStrictEqual([
        { chapterCount: 2, id: 1 },
        { chapterCount: 1, id: 2 },
      ]);
      expect(snapshot?.book).toBe(2);
      expect(snapshot?.verses.map((v) => v.text)).toStrictEqual(["c"]);
    });

    it("falls back to the first book, and has nothing to show without a seed", async () => {
      await markBibleSeeded([[1, 1]]);

      await expect(getReaderBootstrap(66, 1)).resolves.toMatchObject({
        snapshot: { book: 1 },
      });

      await clearBibleSeed();

      await expect(getReaderBootstrap(1, 1)).resolves.toStrictEqual({
        books: [],
        snapshot: null,
      });
    });
  });

  describe(searchVerses, () => {
    it("matches case-insensitively and ignores a blank query", async () => {
      await putVerses([
        { book: 1, chapter: 1, id: 1, text: "In the beginning God", verse: 1 },
        { book: 1, chapter: 1, id: 2, text: "the darkness", verse: 2 },
      ]);

      const matches = await searchVerses("GOD");

      expect(matches.map((v) => v.id)).toStrictEqual([1]);
      await expect(searchVerses("   ")).resolves.toStrictEqual([]);
    });

    it("caps the results", async () => {
      await putVerses(
        versesFor(
          1,
          1,
          Array.from({ length: 60 }, () => "manna")
        )
      );

      const results = await searchVerses("manna");

      expect(results).toHaveLength(50);
    });
  });

  describe(upsertHighlight, () => {
    it("stores one highlight per verse with the default color", async () => {
      await upsertHighlight(7, 43, 3, 16, "For God so loved");
      await upsertHighlight(7, 43, 3, 16, "For God so loved the world");

      const highlights = await getHighlights();

      expect(highlights).toHaveLength(1);
      expect(highlights[0]).toMatchObject({
        color: "yellow",
        text: "For God so loved the world",
        verseId: 7,
      });
    });
  });

  describe(getHighlights, () => {
    it("returns the most recently updated first, and removes by verse", async () => {
      await db.highlights.bulkPut([
        {
          book: 1,
          chapter: 1,
          color: "yellow",
          createdAt: 1,
          text: "old",
          updatedAt: 1,
          verse: 1,
          verseId: 1,
        },
        {
          book: 1,
          chapter: 2,
          color: "blue",
          createdAt: 2,
          text: "new",
          updatedAt: 2,
          verse: 1,
          verseId: 2,
        },
      ]);

      const newestFirst = await getHighlights();

      expect(newestFirst.map((h) => h.verseId)).toStrictEqual([2, 1]);

      await removeHighlight(2);

      const afterRemove = await getHighlights();

      expect(afterRemove.map((h) => h.verseId)).toStrictEqual([1]);
    });
  });
});

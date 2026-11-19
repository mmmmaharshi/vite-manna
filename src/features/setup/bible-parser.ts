import type { BibleVerse, ChapterCounts } from "../../shared/bible";

interface BibleVerseRow {
  Verse: string;
  Verseid: number;
}

interface BibleChapter {
  Verse: BibleVerseRow[];
}

interface BibleBookShape {
  Chapter: BibleChapter[];
}

interface BibleResponse {
  Book: BibleBookShape[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isVerseRow = (value: unknown): value is BibleVerseRow => {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.Verse === "string" && typeof value.Verseid === "number";
};

const isChapter = (value: unknown): value is BibleChapter =>
  isRecord(value) &&
  Array.isArray(value.Verse) &&
  value.Verse.every(isVerseRow);

const isBook = (value: unknown): value is BibleBookShape =>
  isRecord(value) &&
  Array.isArray(value.Chapter) &&
  value.Chapter.every(isChapter);

const isBibleResponse = (value: unknown): value is BibleResponse =>
  isRecord(value) && Array.isArray(value.Book) && value.Book.every(isBook);

export const parseBibleResponse = (json: string): BibleResponse => {
  const parsed: unknown = JSON.parse(json);

  if (!isBibleResponse(parsed)) {
    throw new Error("Bible data has an unexpected shape");
  }

  return parsed;
};

/**
 * Flattens the nested JSON into rows. Book, chapter and verse numbers come from
 * position, so the first book is 1 and the first verse of a chapter is 1.
 */
export const readBible = (bible: BibleResponse) => {
  const verses: BibleVerse[] = [];
  const chapterCounts: ChapterCounts = [];

  for (const [bookIndex, book] of bible.Book.entries()) {
    const bookNumber = bookIndex + 1;

    chapterCounts.push([bookNumber, book.Chapter.length]);

    for (const [chapterIndex, chapter] of book.Chapter.entries()) {
      for (const [verseIndex, verse] of chapter.Verse.entries()) {
        verses.push({
          book: bookNumber,
          chapter: chapterIndex + 1,
          id: verse.Verseid,
          text: verse.Verse,
          verse: verseIndex + 1,
        });
      }
    }
  }

  return { chapterCounts, verses };
};

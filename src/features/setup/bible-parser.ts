import type { BibleVerse, ChapterCounts } from "../../shared/bible";

interface BibleVerseRow {
  Verse: string;
  Verseid: number;
}

interface BibleChapter {
  Verse: BibleVerseRow[];
}

interface BibleBookJson {
  Chapter: BibleChapter[];
}

interface BibleResponse {
  Book: BibleBookJson[];
}

const isVerseRow = (value: unknown): value is BibleVerseRow =>
  typeof value === "object" &&
  value !== null &&
  "Verse" in value &&
  "Verseid" in value &&
  typeof value.Verse === "string" &&
  typeof value.Verseid === "number";

const isChapter = (value: unknown): value is BibleChapter =>
  typeof value === "object" &&
  value !== null &&
  "Verse" in value &&
  Array.isArray(value.Verse) &&
  value.Verse.every(isVerseRow);

const isBook = (value: unknown): value is BibleBookJson =>
  typeof value === "object" &&
  value !== null &&
  "Chapter" in value &&
  Array.isArray(value.Chapter) &&
  value.Chapter.every(isChapter);

const isBibleResponse = (value: unknown): value is BibleResponse =>
  typeof value === "object" &&
  value !== null &&
  "Book" in value &&
  Array.isArray(value.Book) &&
  value.Book.every(isBook);

/**
 * Parses and validates the downloaded Bible JSON.
 *
 * @param json - The raw response text.
 * @returns The validated Bible response.
 */
export const parseBibleResponse = (json: string) => {
  const parsed: unknown = JSON.parse(json);

  if (!isBibleResponse(parsed)) {
    throw new Error("Bible data has an unexpected shape");
  }

  return parsed;
};

/**
 * Flattens the nested JSON into rows. Book, chapter and verse numbers come from
 * position, so the first book is 1 and the first verse of a chapter is 1.
 *
 * @param bible - The validated Bible response.
 * @returns The chapter counts and the verse rows.
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

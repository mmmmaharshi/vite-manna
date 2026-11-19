import { db, DEFAULT_HIGHLIGHT_COLOR } from "./db";
import type { BibleVerse, ChapterCounts } from "./db";

const META_CHAPTER_COUNTS = "chapterCounts";
const META_SEEDED = "bibleSeeded";

const isChapterCount = (value: unknown): value is [number, number] =>
  Array.isArray(value) &&
  value.length === 2 &&
  typeof value[0] === "number" &&
  typeof value[1] === "number";

const isChapterCounts = (value: unknown): value is ChapterCounts =>
  Array.isArray(value) && value.every(isChapterCount);

const readChapterCounts = async () => {
  const entry = await db.meta.get(META_CHAPTER_COUNTS);

  return isChapterCounts(entry?.value) ? entry.value : [];
};

/**
 * Whether the Bible text is seeded in IndexedDB.
 *
 * @returns True when the seed flag is set.
 */
export const isBibleSeeded = async () => {
  const entry = await db.meta.get(META_SEEDED);

  return entry?.value === true;
};

/**
 * Marks the Bible seeded with its per-book chapter counts.
 *
 * @param chapterCounts - The `[book, chapterCount]` pairs.
 * @returns A promise that resolves once the flag is stored.
 */
export const markBibleSeeded = (chapterCounts: ChapterCounts) =>
  db.meta.bulkPut([
    { key: META_CHAPTER_COUNTS, value: chapterCounts },
    { key: META_SEEDED, value: true },
  ]);

/**
 * Clears the seeded verses and the seed flag.
 *
 * @returns A promise that resolves once the store is empty.
 */
export const clearBibleSeed = async () => {
  await db.verses.clear();
  await db.meta.bulkDelete([META_CHAPTER_COUNTS, META_SEEDED]);
};

/**
 * Builds chapter numbers one-based from a count.
 *
 * @param chapterCount - How many chapters the book has.
 * @returns The numbers `1..chapterCount`.
 */
export const getContiguousChapterNumbers = (chapterCount: number) =>
  Array.from({ length: chapterCount }, (_, index) => index + 1);

const clampChapter = (chapters: number[], chapter: number) =>
  chapters.includes(chapter) ? chapter : chapters[0];

const readChapterSnapshot = async (
  book: number,
  chapters: number[],
  chapter: number
) => {
  const selectedChapter = clampChapter(chapters, chapter);

  return {
    chapters,
    chapter: selectedChapter,
    verses:
      selectedChapter === undefined
        ? []
        : await getVerses(book, selectedChapter),
  };
};

/**
 * Lists the chapter numbers of a book.
 *
 * @param book - The book number.
 * @returns The chapter numbers, empty when the book is unknown.
 */
export const getChapterNumbers = async (book: number) => {
  const counts = await readChapterCounts();
  const chapterCount = counts.find(([bookId]) => bookId === book)?.[1] ?? 0;

  return getContiguousChapterNumbers(chapterCount);
};

/**
 * Reads every verse of a chapter in verse order.
 *
 * @param book - The book number.
 * @param chapter - The chapter number.
 * @returns The chapter verses.
 */
export const getVerses = (book: number, chapter: number) =>
  db.verses.where("[book+chapter]").equals([book, chapter]).sortBy("verse");

/**
 * Loads the chapter data the reader renders, clamping to a valid chapter.
 *
 * @param book - The book number.
 * @param chapter - The requested chapter number.
 * @param chapterCount - The known chapter count, if any.
 * @returns The snapshot with chapters and verses.
 */
export const getReaderSnapshot = async (
  book: number,
  chapter: number,
  chapterCount?: number
) => {
  const chapters =
    chapterCount === undefined
      ? await getChapterNumbers(book)
      : getContiguousChapterNumbers(chapterCount);

  return {
    book,
    ...(await readChapterSnapshot(book, chapters, chapter)),
  };
};

/**
 * Loads the book list plus the snapshot for the boot chapter.
 *
 * @param book - The requested book number.
 * @param chapter - The requested chapter number.
 * @returns The books and the boot snapshot.
 */
export const getReaderBootstrap = async (book: number, chapter: number) => {
  const counts = await readChapterCounts();
  const books = counts.map(([id, chapterCount]) => ({ chapterCount, id }));

  const selectedBook = books.some((candidate) => candidate.id === book)
    ? book
    : books[0]?.id;

  const selectedChapterCount =
    books.find((candidate) => candidate.id === selectedBook)?.chapterCount ?? 0;

  const chapters = getContiguousChapterNumbers(selectedChapterCount);

  return {
    books,
    snapshot:
      selectedBook === undefined
        ? null
        : {
            book: selectedBook,
            ...(await readChapterSnapshot(selectedBook, chapters, chapter)),
          },
  };
};

/**
 * Stores parsed verses in bulk.
 *
 * @param verses - The verses to store.
 * @returns A promise that resolves once the verses are stored.
 */
export const putVerses = (verses: BibleVerse[]) => db.verses.bulkPut(verses);

/**
 * Searches verse text across all books.
 *
 * @param query - The search text.
 * @returns Up to 50 matching verses.
 */
export const searchVerses = (query: string) => {
  const needle = query.trim().toLowerCase();

  if (!needle) {
    return Promise.resolve([]);
  }

  return db.verses
    .filter((v) => v.text.toLowerCase().includes(needle))
    .limit(50)
    .toArray();
};

/**
 * The fields needed to store a highlight.
 */
export interface HighlightInput {
  verseId: number;
  book: number;
  chapter: number;
  verse: number;
  text: string;
}

/**
 * Stores one highlight per verse, replacing any previous highlight.
 *
 * @returns A promise that resolves once the highlight is stored.
 */
export const upsertHighlight = ({
  verseId,
  book,
  chapter,
  verse,
  text,
}: HighlightInput) =>
  db.highlights.put({
    book,
    chapter,
    text,
    verse,
    verseId,
    color: DEFAULT_HIGHLIGHT_COLOR,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

/**
 * Removes a verse highlight.
 *
 * @param verseId - The verse id.
 * @returns A promise that resolves once the highlight is removed.
 */
export const removeHighlight = (verseId: number) =>
  db.highlights.delete(verseId);

/**
 * Lists highlights newest first.
 *
 * @returns The highlights in reverse chronological order.
 */
export const getHighlights = async () => {
  const highlights = await db.highlights.orderBy("updatedAt").toArray();

  return highlights.toReversed();
};

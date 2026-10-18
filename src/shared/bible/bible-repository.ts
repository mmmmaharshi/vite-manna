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

export const isBibleSeeded = async () => {
  const entry = await db.meta.get(META_SEEDED);

  return entry?.value === true;
};

export const markBibleSeeded = (chapterCounts: ChapterCounts) =>
  db.meta.bulkPut([
    { key: META_CHAPTER_COUNTS, value: chapterCounts },
    { key: META_SEEDED, value: true },
  ]);

export const clearBibleSeed = async () => {
  await db.verses.clear();
  await db.meta.bulkDelete([META_CHAPTER_COUNTS, META_SEEDED]);
};

const getContiguousChapterNumbers = (chapterCount: number) =>
  Array.from({ length: chapterCount }, (_, index) => index + 1);

export const getChapterNumbers = async (book: number) => {
  const counts = await readChapterCounts();
  const chapterCount = counts.find(([bookId]) => bookId === book)?.[1] ?? 0;

  return getContiguousChapterNumbers(chapterCount);
};

export const getVerses = (book: number, chapter: number) =>
  db.verses.where("[book+chapter]").equals([book, chapter]).sortBy("verse");

export const getReaderSnapshot = async (
  book: number,
  chapter: number,
  chapterCount?: number
) => {
  const chapters =
    chapterCount === undefined
      ? await getChapterNumbers(book)
      : getContiguousChapterNumbers(chapterCount);

  const selectedChapter = chapters.includes(chapter) ? chapter : chapters[0];

  return {
    book,
    chapter: selectedChapter,
    chapters,
    verses:
      selectedChapter === undefined
        ? []
        : await getVerses(book, selectedChapter),
  };
};

export const getReaderBootstrap = async (book: number, chapter: number) => {
  const counts = await readChapterCounts();
  const books = counts.map(([id, chapterCount]) => ({ chapterCount, id }));

  const selectedBook = books.some((candidate) => candidate.id === book)
    ? book
    : books[0]?.id;

  const selectedChapterCount =
    books.find((candidate) => candidate.id === selectedBook)?.chapterCount ?? 0;

  const chapters = getContiguousChapterNumbers(selectedChapterCount);
  const selectedChapter = chapters.includes(chapter) ? chapter : chapters[0];

  return {
    books,
    snapshot:
      selectedBook === undefined
        ? null
        : {
            book: selectedBook,
            chapter: selectedChapter,
            chapters,
            verses:
              selectedChapter === undefined
                ? []
                : await getVerses(selectedBook, selectedChapter),
          },
  };
};

export const putVerses = (verses: BibleVerse[]) => db.verses.bulkPut(verses);

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

export const upsertHighlight = (
  verseId: number,
  book: number,
  chapter: number,
  verse: number,
  text: string
) =>
  db.highlights.put({
    book,
    chapter,
    color: DEFAULT_HIGHLIGHT_COLOR,
    createdAt: Date.now(),
    text,
    updatedAt: Date.now(),
    verse,
    verseId,
  });

export const removeHighlight = (verseId: number) =>
  db.highlights.delete(verseId);

export const getHighlights = async () => {
  const highlights = await db.highlights.orderBy("updatedAt").toArray();

  return highlights.toReversed();
};

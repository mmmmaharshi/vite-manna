import { db, DEFAULT_HIGHLIGHT_COLOR } from "./db";
import type { BibleVerse } from "./db";

export const countVerses = () => db.verses.count();

export const getChapterNumbers = async (book: number) => {
  const verses = await db.verses.where("book").equals(book).toArray();

  return [...new Set(verses.map((verse) => verse.chapter))];
};

export const getVerses = (book: number, chapter: number) =>
  db.verses.where("[book+chapter]").equals([book, chapter]).sortBy("verse");

const getContiguousChapterNumbers = (chapterCount: number) =>
  Array.from({ length: chapterCount }, (_, index) => index + 1);

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
  const verses = await db.verses.orderBy("book").toArray();
  const chapterNumbersByBook = new Map<number, Set<number>>();

  for (const verse of verses) {
    const chapterNumbers = chapterNumbersByBook.get(verse.book) ?? new Set();
    chapterNumbers.add(verse.chapter);
    chapterNumbersByBook.set(verse.book, chapterNumbers);
  }

  const books = [...chapterNumbersByBook].map(([id, chapterNumbers]) => ({
    chapterCount: chapterNumbers.size,
    id,
  }));

  const selectedBook = books.some((candidate) => candidate.id === book)
    ? book
    : books[0]?.id;

  const chapters =
    selectedBook === undefined
      ? []
      : [...(chapterNumbersByBook.get(selectedBook) ?? [])];

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
                : verses
                    .filter(
                      (verse) =>
                        verse.book === selectedBook &&
                        verse.chapter === selectedChapter
                    )
                    .toSorted((first, second) => first.verse - second.verse),
          },
  };
};

export const putVerses = (verses: BibleVerse[]) => db.verses.bulkPut(verses);

export const searchVerses = (query: string) => {
  if (!query.trim()) {
    return Promise.resolve([]);
  }

  return db.verses
    .filter((v) => v.text.toLowerCase().includes(query.toLowerCase()))
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

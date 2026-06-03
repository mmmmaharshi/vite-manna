import { db, type BibleVerse } from "./db";

export function countVerses() {
  return db.verses.count();
}

export async function getBooks() {
  const verses = await db.verses.orderBy("book").toArray();
  const chapterNumbersByBook = new Map<number, Set<number>>();

  for (const verse of verses) {
    const chapterNumbers = chapterNumbersByBook.get(verse.book) ?? new Set();
    chapterNumbers.add(verse.chapter);
    chapterNumbersByBook.set(verse.book, chapterNumbers);
  }

  return [...chapterNumbersByBook].map(([id, chapterNumbers]) => ({
    chapterCount: chapterNumbers.size,
    id,
  }));
}

export async function getChapterNumbers(book: number) {
  const verses = await db.verses.where("book").equals(book).toArray();
  return [...new Set(verses.map((verse) => verse.chapter))];
}

export function getVerses(book: number, chapter: number) {
  return db.verses.where("[book+chapter]").equals([book, chapter]).sortBy("verse");
}

function getContiguousChapterNumbers(chapterCount: number) {
  return Array.from({ length: chapterCount }, (_, index) => index + 1);
}

export async function getReaderSnapshot(
  book: number,
  chapter: number,
  chapterCount?: number,
) {
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
      selectedChapter === undefined ? [] : await getVerses(book, selectedChapter),
  };
}

export async function getReaderBootstrap(book: number, chapter: number) {
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
                        verse.chapter === selectedChapter,
                    )
                    .sort((first, second) => first.verse - second.verse),
          },
  };
}

export function putVerses(verses: BibleVerse[]) {
  return db.verses.bulkPut(verses);
}

/* ───── Bookmark CRUD ───── */

export function addBookmark(verse: BibleVerse) {
  return db.bookmarks.put({
    verseId: verse.id,
    book: verse.book,
    chapter: verse.chapter,
    verse: verse.verse,
    text: verse.text,
    createdAt: Date.now(),
  });
}

export function removeBookmark(verseId: number) {
  return db.bookmarks.delete(verseId);
}

export function clearBookmarks() {
  return db.bookmarks.clear();
}

export function getBookmarks() {
  return db.bookmarks.orderBy("createdAt").reverse().toArray();
}

export async function getBookmarkedVerseIds(): Promise<Set<number>> {
  const ids = await db.bookmarks.orderBy("verseId").keys();
  return new Set(ids as number[]);
}

export function isBookmarked(verseId: number) {
  return db.bookmarks.get(verseId).then((entry) => entry !== undefined);
}

export async function getBookmarkedChapters(book: number): Promise<Set<number>> {
  const entries = await db.bookmarks.where("book").equals(book).toArray();
  return new Set(entries.map((e) => e.chapter));
}

export function searchVerses(query: string) {
  return db.verses
    .filter((v) => v.text.toLowerCase().includes(query.toLowerCase()))
    .limit(50)
    .toArray();
}

export { parseVerseref } from "./dailyVerseData";



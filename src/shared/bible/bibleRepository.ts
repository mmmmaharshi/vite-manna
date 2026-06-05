import { db, type BibleVerse } from "./db";

export function countVerses() {
  return db.verses.count();
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

export function searchVerses(query: string) {
  if (!query.trim()) return Promise.resolve([]);
  return db.verses
    .filter((v) => v.text.toLowerCase().includes(query.toLowerCase()))
    .limit(50)
    .toArray();
}

/* ───── Highlight CRUD ───── */

import type { HighlightColor } from "./db";

export function upsertHighlight(
  verseId: number,
  book: number,
  chapter: number,
  verse: number,
  text: string,
  color: HighlightColor,
  note = "",
) {
  return db.highlights.put({
    verseId,
    book,
    chapter,
    verse,
    text,
    color,
    note,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}

export function removeHighlight(verseId: number) {
  return db.highlights.where("verseId").equals(verseId).delete();
}

export function getHighlights() {
  return db.highlights.orderBy("updatedAt").reverse().toArray();
}

export async function getHighlightsForChapter(
  book: number,
  chapter: number,
): Promise<Map<number, HighlightColor>> {
  const all = await db.highlights
    .where("[book+chapter]")
    .equals([book, chapter])
    .toArray();
  return new Map(all.map((h) => [h.verseId, h.color]));
}

export function updateHighlightNote(verseId: number, note: string) {
  return db.highlights.where("verseId").equals(verseId).modify({ note, updatedAt: Date.now() });
}

/* ───── Reading History ───── */

export function recordChapterRead(book: number, chapter: number) {
  return db.readingHistory.put({ book, chapter, lastReadAt: Date.now() });
}

export function getReadChapters(book: number) {
  return db.readingHistory.where("book").equals(book).toArray();
}

export function getAllReadChapters() {
  return db.readingHistory.toArray();
}

export interface ReadingStreak {
  count: number;
  readToday: boolean;
}

export async function getReadingStreak(): Promise<ReadingStreak> {
  const all = await db.readingHistory.toArray();
  if (all.length === 0) return { count: 0, readToday: false };

  const dates = new Set<number>();
  for (const entry of all) {
    const d = new Date(entry.lastReadAt);
    dates.add(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  }

  const sorted = [...dates].sort((a, b) => b - a);
  const today = new Date();
  const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayUTC = todayUTC - 86_400_000;
  const readToday = sorted[0] === todayUTC;

  if (sorted[0] !== todayUTC && sorted[0] !== yesterdayUTC) return { count: 0, readToday };

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i - 1] - sorted[i] === 86_400_000) {
      streak++;
    } else {
      break;
    }
  }
  return { count: streak, readToday };
}

export async function getLastReadChapter() {
  const all = await db.readingHistory.orderBy("lastReadAt").reverse().limit(1).toArray();
  return all[0] ?? null;
}

export async function getBookProgress(book: number, totalChapters: number) {
  const read = await db.readingHistory.where("book").equals(book).count();
  return { read, total: totalChapters, percentage: totalChapters > 0 ? read / totalChapters : 0 };
}

export async function getBookChapterCounts(): Promise<Map<number, number>> {
  const keys = await db.verses.orderBy("[book+chapter]").uniqueKeys();
  const counts = new Map<number, number>();
  for (const [book] of keys as unknown as [number, number][]) {
    counts.set(book, (counts.get(book) ?? 0) + 1);
  }
  return counts;
}

export async function getOverallProgress(): Promise<{ read: number; total: number; percentage: number }> {
  const [readCount, counts] = await Promise.all([
    db.readingHistory.count(),
    getBookChapterCounts(),
  ]);
  const total = [...counts.values()].reduce((sum, c) => sum + c, 0);
  return { read: readCount, total, percentage: total > 0 ? readCount / total : 0 };
}

export { parseVerseref } from "./dailyVerseData";

const OFFSET_KEY = "daily-verse-offset";

export function getCachedUserOffset(): number | null {
  try {
    const raw = localStorage.getItem(OFFSET_KEY);
    return raw ? parseInt(raw, 10) : null;
  } catch {
    return null;
  }
}

export function setCachedUserOffset(offset: number) {
  try { localStorage.setItem(OFFSET_KEY, String(offset)); } catch { /* localStorage may be full */ }
}

export async function getUserOffset(): Promise<number> {
  const cached = getCachedUserOffset();
  if (cached !== null) return cached;

  try {
    const stored = await db.meta.get(OFFSET_KEY);
    if (stored?.value !== undefined) {
      const val = Number(stored.value);
      if (!isNaN(val)) {
        setCachedUserOffset(val);
        return val;
      }
    }
  } catch { /* DB read failed, use random */ }

  const offset = Math.floor(Math.random() * 365);
  setCachedUserOffset(offset);
  try { await db.meta.put({ key: OFFSET_KEY, value: offset }); } catch { /* DB write failed */ }
  return offset;
}



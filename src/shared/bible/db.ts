import { Dexie } from "dexie";
import type { Table } from "dexie";

export interface BibleVerse {
  id: number;
  book: number;
  chapter: number;
  verse: number;
  text: string;
}

export interface MetaEntry {
  key: string;
  value: unknown;
}

/** `[book, chapterCount]` pairs in book order, stored under the `chapterCounts` meta key. */
export type ChapterCounts = [number, number][];

export type HighlightColor = "yellow" | "green" | "blue" | "pink" | "orange";

export const DEFAULT_HIGHLIGHT_COLOR: HighlightColor = "yellow";

export interface Highlight {
  verseId: number;
  book: number;
  chapter: number;
  verse: number;
  text: string;
  color: HighlightColor;
  createdAt: number;
  updatedAt: number;
}

class BibleDB extends Dexie {
  verses!: Table<BibleVerse, number>;
  meta!: Table<MetaEntry, string>;
  highlights!: Table<Highlight, number>;

  constructor() {
    super("BibleDB");

    this.version(1).stores({
      highlights: "++id, verseId, book, [book+chapter], updatedAt",
      meta: "key",
      verses: "id, book, [book+chapter]",
    });
    this.version(11).stores({ readingHistory: null });
    this.version(12)
      .stores({ highlightsV12: "verseId, updatedAt" })
      .upgrade(async (tx) => {
        const rows = await tx.table("highlights").toArray();
        const latestByVerse = new Map<number, Highlight>();

        for (const row of rows) {
          const prev = latestByVerse.get(row.verseId);

          if (prev === undefined || row.updatedAt > prev.updatedAt) {
            latestByVerse.set(row.verseId, row);
          }
        }

        await tx.table("highlightsV12").bulkPut(
          [...latestByVerse.values()].map((row) => ({
            book: row.book,
            chapter: row.chapter,
            color: row.color,
            createdAt: row.createdAt,
            text: row.text,
            updatedAt: row.updatedAt,
            verse: row.verse,
            verseId: row.verseId,
          }))
        );
      });
    this.version(13).stores({ highlights: null });
    this.version(14)
      .stores({ highlights: "verseId, updatedAt" })
      .upgrade(async (tx) => {
        const rows = await tx.table("highlightsV12").toArray();
        await tx.table("highlights").bulkPut(rows);
      });
    this.version(15).stores({ highlightsV12: null });
  }
}

export const db = new BibleDB();

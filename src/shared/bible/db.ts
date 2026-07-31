import Dexie, { type Table } from "dexie";

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

export const DB_NAME = "BibleDB";

class BibleDB extends Dexie {
  verses!: Table<BibleVerse, number>;
  meta!: Table<MetaEntry, string>;
  highlights!: Table<Highlight, number>;

  constructor() {
    super("BibleDB");

    this.version(1).stores({ verses: "id, book, [book+chapter]", meta: "key", highlights: "++id, verseId, book, [book+chapter], updatedAt" });
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
            verseId: row.verseId,
            book: row.book,
            chapter: row.chapter,
            verse: row.verse,
            text: row.text,
            color: row.color,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
          })),
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

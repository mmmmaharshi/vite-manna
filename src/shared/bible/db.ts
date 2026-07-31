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

export interface Highlight {
  id?: number;
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
  }
}

export const db = new BibleDB();

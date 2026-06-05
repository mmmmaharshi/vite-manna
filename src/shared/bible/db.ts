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

export interface ReadingEntry {
  book: number;
  chapter: number;
  lastReadAt: number;
}

export interface Highlight {
  id?: number;
  verseId: number;
  book: number;
  chapter: number;
  verse: number;
  text: string;
  color: HighlightColor;
  note: string;
  createdAt: number;
  updatedAt: number;
}

export const HIGHLIGHT_COLORS: HighlightColor[] = [
  "yellow",
  "green",
  "blue",
  "pink",
  "orange",
];

export const HIGHLIGHT_COLOR_VALUES: Record<HighlightColor, string> = {
  yellow: "var(--highlight-yellow)",
  green: "var(--highlight-green)",
  blue: "var(--highlight-blue)",
  pink: "var(--highlight-pink)",
  orange: "var(--highlight-orange)",
};

export const DB_NAME = "BibleDB";

class BibleDB extends Dexie {
  verses!: Table<BibleVerse, number>;
  meta!: Table<MetaEntry, string>;
  highlights!: Table<Highlight, number>;
  readingHistory!: Table<ReadingEntry, [number, number]>;

  constructor() {
    super("BibleDB");

    this.version(1).stores({ verses: "Verseid" });
    this.version(2).stores({ verses: null });
    this.version(3).stores({ verses: "id" });
    this.version(4).stores({ verses: "id, book" });
    this.version(5).stores({ verses: "id, book, [book+chapter]" });
    this.version(6).stores({ meta: "key" });
    this.version(8).stores({ highlights: "++id, verseId, book, [book+chapter], updatedAt" });
    this.version(9).stores({ readingHistory: "[book+chapter], book" });
    this.version(10).stores({ readingHistory: "[book+chapter], book, lastReadAt" });
  }
}

export const db = new BibleDB();

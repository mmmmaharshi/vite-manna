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

/** The product highlights in one color; rows carry the value so older installs
 * keep working with no migration. */
export const DEFAULT_HIGHLIGHT_COLOR = "yellow";

/** Pre-v12 rows were written by older app versions, so verify the fields the
 * migration reads instead of crashing mid-upgrade on a corrupt row. */
const asStringOr = (value: unknown, fallback: string) =>
  typeof value === "string" ? value : fallback;

const numberOr = (value: unknown, fallback: number) =>
  typeof value === "number" ? value : fallback;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asMigratableHighlight = (row: unknown): Highlight | null => {
  if (!isRecord(row)) {
    return null;
  }

  const { verseId, updatedAt } = row;

  if (typeof verseId !== "number" || typeof updatedAt !== "number") {
    return null;
  }

  return {
    book: numberOr(row.book, 0),
    chapter: numberOr(row.chapter, 0),
    color: asStringOr(row.color, DEFAULT_HIGHLIGHT_COLOR),
    createdAt: numberOr(row.createdAt, updatedAt),
    text: typeof row.text === "string" ? row.text : "",
    updatedAt,
    verse: numberOr(row.verse, 0),
    verseId,
  };
};

export interface Highlight {
  verseId: number;
  book: number;
  chapter: number;
  verse: number;
  text: string;
  color: string;
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
          const highlight = asMigratableHighlight(row);

          if (highlight === null) {
            continue;
          }

          const prev = latestByVerse.get(highlight.verseId);

          if (prev === undefined || highlight.updatedAt > prev.updatedAt) {
            latestByVerse.set(highlight.verseId, highlight);
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
        const valid: Highlight[] = [];

        for (const row of rows) {
          const highlight = asMigratableHighlight(row);

          if (highlight !== null) {
            valid.push(highlight);
          }
        }

        await tx.table("highlights").bulkPut(valid);
      });
    this.version(15).stores({ highlightsV12: null });
  }
}

export const db = new BibleDB();

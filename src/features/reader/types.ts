import type { BibleVerse } from "../../shared/bible";

/**
 * The chapter data rendered by the reader.
 */
export interface ReaderSnapshot {
  book: number;
  chapter: number | undefined;
  chapters: Array<number>;
  verses: Array<BibleVerse>;
}

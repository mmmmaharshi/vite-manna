import type { BibleVerse } from "../../shared/bible";

/**
 * A book row shown in the book picker.
 */
export interface BibleBook {
  chapterCount: number;
  id: number;
  name: string;
}

/**
 * The chapter data rendered by the reader.
 */
export interface ReaderSnapshot {
  book: number;
  chapter: number | undefined;
  chapters: number[];
  verses: BibleVerse[];
}

import type { BibleVerse } from "../../shared/bible";

export interface BibleBook {
  chapterCount: number;
  id: number;
  name: string;
}

export interface ReaderSnapshot {
  book: number;
  chapter: number | undefined;
  chapters: number[];
  verses: BibleVerse[];
}

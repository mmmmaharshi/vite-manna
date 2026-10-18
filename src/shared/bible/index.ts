export { getBibleBookName, BIBLE_BOOK_NAMES } from "./books";

export {
  db,
  DEFAULT_HIGHLIGHT_COLOR,
  type BibleVerse,
  type ChapterCounts,
  type Highlight,
  type HighlightColor,
} from "./db";

export {
  clearBibleSeed,
  getHighlights,
  getReaderBootstrap,
  getReaderSnapshot,
  isBibleSeeded,
  markBibleSeeded,
  putVerses,
  removeHighlight,
  searchVerses,
  upsertHighlight,
} from "./bible-repository";

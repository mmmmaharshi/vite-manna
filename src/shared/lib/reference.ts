import { getBibleBookName } from "../bible/books";

/** Query parameters that identify a place in the reader. */
export const URL_PARAM_BOOK = "book";
export const URL_PARAM_CHAPTER = "chapter";
export const URL_PARAM_VERSE = "verse";

/**
 * Formats a reference: `యోహాను 3`, or `యోహాను 3:16` when a verse is given.
 *
 * @param book - The book number.
 * @param chapter - The chapter number.
 * @param verse - The verse number, if any.
 * @returns The formatted reference.
 */
export const formatReference = (
  book: number,
  chapter: number,
  verse?: number
) =>
  verse === undefined
    ? `${getBibleBookName(book)} ${chapter}`
    : `${getBibleBookName(book)} ${chapter}:${verse}`;

/** A stable pointer to one verse, passed as a unit instead of three numbers. */
export interface VerseRef {
  book: number;
  chapter: number;
  verse: number;
}

/**
 * A link to a verse on the current origin, without any hash or stale params.
 *
 * @param book - The book number.
 * @param chapter - The chapter number.
 * @param verse - The verse number.
 * @returns The absolute permalink URL.
 */
export const buildPermalinkUrl = (
  book: number,
  chapter: number,
  verse: number
) => {
  const url = new URL(window.location.href);

  url.searchParams.set(URL_PARAM_BOOK, String(book));
  url.searchParams.set(URL_PARAM_CHAPTER, String(chapter));
  url.searchParams.set(URL_PARAM_VERSE, String(verse));
  url.hash = "";

  return url.toString();
};

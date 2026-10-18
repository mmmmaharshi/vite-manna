import { getBibleBookName } from "../bible/books";

/** Query parameters that identify a place in the reader. */
export const URL_PARAM_BOOK = "book";
export const URL_PARAM_CHAPTER = "chapter";
export const URL_PARAM_VERSE = "verse";

/** `యోహాను 3`, or `యోహాను 3:16` when a verse is given. */
export const formatReference = (
  book: number,
  chapter: number,
  verse?: number
) =>
  verse === undefined
    ? `${getBibleBookName(book)} ${chapter}`
    : `${getBibleBookName(book)} ${chapter}:${verse}`;

/** A link to a verse on the current origin, without any hash or stale params. */
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

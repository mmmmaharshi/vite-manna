import type { NamedBook } from "../../../shared/bible";

/**
 * Steps one chapter forward or back across book boundaries.
 *
 * @param books - The books with their chapter counts.
 * @param book - The current book number.
 * @param chapter - The current chapter number.
 * @param direction - The step direction.
 * @returns The destination, or null past either end.
 */
export const navigateChapter = (
  books: NamedBook[],
  book: number,
  chapter: number,
  direction: "prev" | "next"
) => {
  const bookIndex = books.findIndex((b) => b.id === book);

  if (bookIndex === -1) {
    return null;
  }

  const currentBook = books[bookIndex];

  if (direction === "next") {
    if (chapter < currentBook.chapterCount) {
      return { book, chapter: chapter + 1 };
    }

    const nextBook = books[bookIndex + 1];

    if (nextBook) {
      return { book: nextBook.id, chapter: 1 };
    }

    return null;
  }

  if (chapter > 1) {
    return { book, chapter: chapter - 1 };
  }

  const prevBook = books[bookIndex - 1];

  if (prevBook) {
    return { book: prevBook.id, chapter: prevBook.chapterCount };
  }

  return null;
};

import type { BibleBook } from "../types";

export function navigateChapter(
  books: BibleBook[],
  book: number,
  chapter: number,
  direction: "prev" | "next",
): { book: number; chapter: number } | null {
  const bookIndex = books.findIndex((b) => b.id === book);
  if (bookIndex === -1) return null;

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
}

import { useEffect } from "react";
import { Surface } from "@heroui/react";
import { Navigate } from "react-router";

import { useBooks } from "./hooks/useBooks";
import { useReaderSnapshot } from "./hooks/useReaderSnapshot";
import BookSelect from "./components/BookSelect";
import ChapterStrip from "./components/ChapterStrip";
import VerseActionBar from "./components/VerseActionBar";
import VerseList from "./components/VerseList";
import { useReaderStore } from "./store/readerStore";
import { useUrlSync } from "./useUrlSync";

const ReaderScreen = () => {
  useUrlSync();
  const { books, hasLoadedBooks } = useBooks();
  const book = useReaderStore((state) => state.book);
  const chapter = useReaderStore((state) => state.chapter);
  const pendingBook = useReaderStore((state) => state.pendingBook);
  const isSelectionMode = useReaderStore((state) => state.isSelectionMode);
  const setBook = useReaderStore((state) => state.setBook);
  const setChapter = useReaderStore((state) => state.setChapter);

  useEffect(() => {
    if (books.length > 0 && !books.some((candidate) => candidate.id === book)) {
      setBook(books[0].id);
    }
  }, [book, books, setBook]);

  const selectedBookSummary = books.find((candidate) => candidate.id === book);
  const snapshot = useReaderSnapshot(
    book,
    chapter,
    selectedBookSummary?.chapterCount,
  );

  const visibleBook = pendingBook ?? snapshot?.book ?? book;
  const visibleBookSummary = books.find(
    (candidate) => candidate.id === visibleBook,
  );
  const isReaderTransitioning = snapshot !== null && snapshot.book !== book;
  const visibleChapters =
    isReaderTransitioning && visibleBookSummary
      ? Array.from(
          { length: visibleBookSummary.chapterCount },
          (_, index) => index + 1,
        )
      : (snapshot?.chapters ??
          (visibleBookSummary
            ? Array.from(
                { length: visibleBookSummary.chapterCount },
                (_, index) => index + 1,
              )
            : []));
  const visibleChapter = isReaderTransitioning ? 1 : chapter;

  if (hasLoadedBooks && books.length === 0) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="pb-16">
      <Surface className="sticky top-0 z-30 bg-surface py-2.5 pt-3.5 border border-b">
        <div className="max-w-sm flex flex-col gap-2 w-full px-2 mx-auto">
          <BookSelect
            books={books}
            value={visibleBook}
            visibleBookSummary={visibleBookSummary}
          />
          <ChapterStrip
            chapters={visibleChapters}
            currentBook={visibleBook}
            isReaderTransitioning={isReaderTransitioning}
            onSelectChapter={setChapter}
            visibleChapter={visibleChapter}
          />
        </div>
      </Surface>

      <section
        className={[
          "max-w-sm w-full px-2 py-4 mx-auto",
          isSelectionMode ? "pb-24" : "",
        ].join(" ")}
      >
        {!isReaderTransitioning && snapshot && (
          <VerseList verses={snapshot.verses} />
        )}
      </section>

      {snapshot && <VerseActionBar verses={snapshot.verses} />}
    </main>
  );
};

export default ReaderScreen;

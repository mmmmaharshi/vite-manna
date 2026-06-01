import { useEffect } from "react";
import { Surface } from "@heroui/react";
import { Navigate } from "react-router";

import { SplashView } from "../../shared/ui";
import { useBooks } from "./hooks/useBooks";
import { useReaderSnapshot } from "./hooks/useReaderSnapshot";
import BookSelect from "./components/BookSelect";
import ChapterStrip from "./components/ChapterStrip";
import VerseList from "./components/VerseList";
import { useReaderStore } from "./store/readerStore";
import { useUrlSync } from "./useUrlSync";

const ReaderScreen = () => {
  useUrlSync();
  const { books, hasLoadedBooks } = useBooks();
  const book = useReaderStore((state) => state.book);
  const chapter = useReaderStore((state) => state.chapter);
  const pendingBook = useReaderStore((state) => state.pendingBook);
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
  const isReaderTransitioning = snapshot?.book !== book;
  const visibleChapters =
    isReaderTransitioning && visibleBookSummary
      ? Array.from(
          { length: visibleBookSummary.chapterCount },
          (_, index) => index + 1,
        )
      : (snapshot?.chapters ?? []);
  const visibleChapter = isReaderTransitioning ? 1 : chapter;

  const isReaderReady =
    hasLoadedBooks &&
    books.length > 0 &&
    !!snapshot &&
    snapshot.book === book &&
    snapshot.chapters.length > 0 &&
    snapshot.verses.length > 0;

  if (hasLoadedBooks && books.length === 0) {
    return <Navigate to="/" replace />;
  }

  if (!isReaderReady) {
    return <SplashView message="Preparing reader..." progress={null} />;
  }

  return (
    <main>
      <Surface className="py-2.5 pt-3.5 border border-b">
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

      <section className="max-w-sm w-full px-2 py-4 mx-auto">
        {!isReaderTransitioning && snapshot && (
          <VerseList verses={snapshot.verses} />
        )}
      </section>
    </main>
  );
};

export default ReaderScreen;

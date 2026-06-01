import { Surface } from "@heroui/react";
import { Navigate } from "react-router";

import BookSelect from "../components/BookSelect";
import ChapterStrip from "../components/ChapterStrip";
import VerseList from "../components/VerseList";
import SplashView from "../components/SplashView";
import { useReaderLocation } from "../bible/useReaderLocation";
import { useChapterStripScroll } from "../reader/useChapterStripScroll";
import { useReader } from "../reader/useReader";
import { useReaderHydration } from "../reader/useReaderHydration";

interface AppProps {
  onHydrated?: () => void;
  showSplash?: boolean;
}

const App = ({ onHydrated, showSplash = true }: AppProps) => {
  const { book, chapter, setBook, setChapter } = useReaderLocation();
  const {
    books,
    hasLoadedBooks,
    isBookSelectOpen,
    isReaderTransitioning,
    pendingBook,
    readerSnapshot,
    setIsBookSelectOpen,
    setPendingBook,
    visibleBook,
    visibleBookSummary,
    visibleChapter,
    visibleChapters,
  } = useReader({ book, chapter, setBook, setChapter });
  const { isHydrated } = useReaderHydration({
    book,
    books,
    chapter,
    hasLoadedBooks,
    onHydrated,
    readerSnapshot,
  });
  const {
    activeChapterRef,
    chapterStripRef,
    rememberChapterStripScroll,
  } = useChapterStripScroll({
    isHydrated,
    isReaderTransitioning,
    pendingBook,
    readerSnapshot,
    setIsBookSelectOpen,
    setPendingBook,
    visibleBook,
    visibleChapter,
    visibleChaptersLength: visibleChapters.length,
  });

  if (hasLoadedBooks && books.length === 0) {
    return <Navigate to="/" replace />;
  }

  if (!isHydrated) {
    return showSplash ? <SplashView /> : null;
  }

  return (
    <main>
      <Surface className="py-2.5 pt-3.5 border border-b">
        <div className="max-w-sm flex flex-col gap-2 w-full px-2 mx-auto">
          <BookSelect
            books={books}
            isOpen={isBookSelectOpen || pendingBook !== null}
            onOpenChange={setIsBookSelectOpen}
            onSelectBook={(nextBook) => {
              rememberChapterStripScroll();
              setPendingBook(nextBook);
              setIsBookSelectOpen(true);
              setBook(nextBook);
            }}
            pendingBook={pendingBook}
            value={visibleBook}
            visibleBookSummary={visibleBookSummary}
          />

          <ChapterStrip
            activeChapterRef={activeChapterRef}
            chapterStripRef={chapterStripRef}
            chapters={visibleChapters}
            onScroll={rememberChapterStripScroll}
            onSelectChapter={setChapter}
            visibleChapter={visibleChapter}
          />
        </div>
      </Surface>

      <section className="max-w-sm w-full px-2 py-4 mx-auto">
        {!isReaderTransitioning && readerSnapshot && (
          <VerseList verses={readerSnapshot.verses} />
        )}
      </section>
    </main>
  );
};

export default App;

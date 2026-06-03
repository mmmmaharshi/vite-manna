import { useEffect, useRef } from "react";
import { Button, ScrollShadow, Surface, Typography } from "@heroui/react";

import { getBibleBookName } from "../../shared/bible";
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

  const scrollRef = useRef<HTMLDivElement>(null);

  const prevBookChapter = useRef({ book, chapter });
  useEffect(() => {
    const prev = prevBookChapter.current;
    if (prev.book !== book || prev.chapter !== chapter) {
      scrollRef.current?.scrollTo(0, 0);
      prevBookChapter.current = { book, chapter };
    }
  }, [book, chapter]);

  const selectedBookSummary = books.find((candidate) => candidate.id === book);

  useEffect(() => {
    const name = selectedBookSummary ? getBibleBookName(selectedBookSummary.id) : "";
    document.title = name ? `మన్నా - ${name} ${chapter}` : "మన్నా - తెలుగు బైబిల్";
  }, [selectedBookSummary, chapter]);
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
    return (
      <main className="flex flex-col items-center justify-center gap-4 px-4 pb-16 min-h-dvh">
        <Typography className="text-center">
          Unable to load Bible books. Please try again.
        </Typography>
        <Button variant="primary" onPress={() => window.location.reload()}>
          Retry
        </Button>
      </main>
    );
  }

  return (
    <ScrollShadow ref={scrollRef} hideScrollBar className="h-dvh pb-16">
      <Typography.Heading level={1} className="sr-only">
        {selectedBookSummary ? `${getBibleBookName(selectedBookSummary.id)} ${chapter}` : "Bible Reader"}
      </Typography.Heading>
      <Surface className="sticky top-0 z-30 py-2.5 pt-3.5 border border-b">
        <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl flex flex-col gap-2 w-full px-2 mx-auto">
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
          "max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full px-2 py-4 mx-auto",
          isSelectionMode ? "pb-24" : "",
        ].join(" ")}
        aria-label={selectedBookSummary ? `${getBibleBookName(selectedBookSummary.id)} ${chapter}` : "Bible reader"}
      >
        {snapshot && (
          <VerseList verses={snapshot.verses} />
        )}
        {!snapshot && hasLoadedBooks && (
          <div className="flex flex-col gap-3" aria-busy="true">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="h-5 rounded bg-surface-secondary animate-pulse"
                style={{ width: `${60 + Math.random() * 35}%` }}
              />
            ))}
          </div>
        )}
      </section>

      {snapshot && <VerseActionBar verses={snapshot.verses} />}
    </ScrollShadow>
  );
};

export default ReaderScreen;

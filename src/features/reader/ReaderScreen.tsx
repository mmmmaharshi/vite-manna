import { useEffect, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "@gravity-ui/icons";
import { Button, ScrollShadow, Skeleton, Surface, Typography } from "@heroui/react";

import { cn } from "../../shared/lib/cn";
import { getBibleBookName, recordChapterRead } from "../../shared/bible";
import { navigateChapter } from "./hooks/navigateChapter";

import { useBooks } from "./hooks/useBooks";
import { useReaderSnapshot } from "./hooks/useReaderSnapshot";
import BookSelect from "./components/BookSelect";
import ChapterStrip from "./components/ChapterStrip";
import VerseActionBar from "./components/VerseActionBar";
import VerseList from "./components/VerseList";
import { useReaderStore } from "./store/readerStore";
import { useUrlSync } from "./useUrlSync";
import { useSwipeAndKeyboard } from "./hooks/useSwipeAndKeyboard";

const SKELETON_WIDTHS = [75, 85, 65, 90, 70, 80, 60, 95];

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

  const verseSectionRef = useRef<HTMLElement>(null);
  useSwipeAndKeyboard({
    elementRef: verseSectionRef,
    books,
    book,
    chapter,
    setChapter,
    setBook,
    isSelectionMode,
    isBookSelectOpen: useReaderStore((state) => state.isBookSelectOpen),
  });

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

  const recordedRef = useRef<{ book: number; chapter: number } | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    recordedRef.current = null;
  }, [book, chapter]);

  useEffect(() => {
    if (!snapshot || !sentinelRef.current) return;

    const sentinel = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        const prev = recordedRef.current;
        if (prev && prev.book === book && prev.chapter === chapter) return;
        recordedRef.current = { book, chapter };
        recordChapterRead(book, chapter);
      },
      { threshold: 0.5 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [snapshot, book, chapter]);

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

  const isFirstChapter = useMemo(() => {
    const first = books.at(0);
    return book === first?.id && chapter === 1;
  }, [books, book, chapter]);

  const isLastChapter = useMemo(() => {
    const last = books.at(-1);
    return book === last?.id && chapter === last?.chapterCount;
  }, [books, book, chapter]);

  const handlePrevChapter = () => {
    const next = navigateChapter(books, book, chapter, "prev");
    if (next) {
      if (next.book !== book) setBook(next.book);
      setChapter(next.chapter);
    }
  };

  const handleNextChapter = () => {
    const next = navigateChapter(books, book, chapter, "next");
    if (next) {
      if (next.book !== book) setBook(next.book);
      setChapter(next.chapter);
    }
  };

  if (hasLoadedBooks && books.length === 0) {
    return (
      <main className="flex flex-col items-center justify-center gap-4 px-4 pb-16 min-h-dvh">
        <Typography role="alert" className="text-center">
          Unable to load Bible books. Please try again.
        </Typography>
        <Button variant="primary" onPress={() => window.location.reload()}>
          Retry
        </Button>
      </main>
    );
  }

  return (
    <main id="main-content" className="h-dvh flex flex-col">
      <Surface className="sticky top-0 z-30 py-2.5 pt-3.5 border border-b">
        <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl flex flex-col gap-2 w-full px-2 mx-auto">
          <div className="flex items-stretch gap-1">
            <Button variant="tertiary" aria-label="Previous chapter" size="sm"
              isDisabled={isFirstChapter}
              onPress={handlePrevChapter}
              className="px-1.5 h-auto"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <BookSelect
              books={books}
              value={visibleBook}
              visibleBookSummary={visibleBookSummary}
              className="flex-1"
            />
            <Button variant="tertiary" aria-label="Next chapter"
              isDisabled={isLastChapter} size="sm"
              onPress={handleNextChapter}
              className="px-1.5 h-auto"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <ChapterStrip
            chapters={visibleChapters}
            currentBook={visibleBook}
            isReaderTransitioning={isReaderTransitioning}
            onSelectChapter={setChapter}
            visibleChapter={visibleChapter}
          />
        </div>
      </Surface>

      <ScrollShadow ref={scrollRef} hideScrollBar className="flex-1">
        <Typography.Heading level={1} className="sr-only">
          {selectedBookSummary ? `${getBibleBookName(selectedBookSummary.id)} ${chapter}` : "Bible Reader"}
        </Typography.Heading>
        <section
          ref={verseSectionRef}
          className={cn(
            "max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full px-2 py-4 mx-auto",
            isSelectionMode && "pb-24",
          )}
          aria-label={selectedBookSummary ? `${getBibleBookName(selectedBookSummary.id)} ${chapter}` : "Bible reader"}
        >
          {snapshot && (
            <>
              <VerseList verses={snapshot.verses} />
              <div ref={sentinelRef} className="h-4" />
            </>
          )}
          {!snapshot && hasLoadedBooks && (
            <div className="flex flex-col gap-3" aria-busy="true">
              {SKELETON_WIDTHS.map((w, i) => (
                <Skeleton key={i} className="h-5 rounded-lg" style={{ width: `${w}%` }} />
              ))}
            </div>
          )}
        </section>

        {snapshot && <VerseActionBar verses={snapshot.verses} />}
        <div className="h-[calc(4rem+env(safe-area-inset-bottom))]" />
      </ScrollShadow>
    </main>
  );
};

export default ReaderScreen;

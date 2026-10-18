import { ChevronLeft, ChevronRight } from "@gravity-ui/icons";
import {
  Button,
  ScrollShadow,
  Skeleton,
  Surface,
  Typography,
} from "@heroui/react";
import { useEffect, useRef } from "react";

import { getBibleBookName } from "../../shared/bible";
import { cn } from "../../shared/lib/cn";
import BookSelect from "./components/book-select";
import ChapterStrip from "./components/chapter-strip";
import VerseActionBar from "./components/verse-action-bar";
import VerseList from "./components/verse-list";
import { useBooks } from "./hooks/use-books";
import { useReaderSnapshot } from "./hooks/use-reader-snapshot";
import { useSwipeAndKeyboard } from "./hooks/use-swipe-and-keyboard";
import { useReaderStore } from "./store/reader-store";
import type { BibleBook, ReaderSnapshot } from "./types";
import { useUrlSync } from "./use-url-sync";

const SKELETON_WIDTHS = [75, 85, 65, 90, 70, 80, 60, 95];

const buildChapterNumbers = (chapterCount: number) =>
  Array.from({ length: chapterCount }, (_, index) => index + 1);

const resolveVisibleChapters = (
  isReaderTransitioning: boolean,
  visibleBookSummary: BibleBook | undefined,
  snapshot: ReaderSnapshot | null
) => {
  if (!visibleBookSummary) {
    return snapshot?.chapters ?? [];
  }

  if (isReaderTransitioning) {
    return buildChapterNumbers(visibleBookSummary.chapterCount);
  }

  return (
    snapshot?.chapters ?? buildChapterNumbers(visibleBookSummary.chapterCount)
  );
};

const ReaderScreen = () => {
  useUrlSync();
  const { books, hasLoadedBooks } = useBooks();
  const book = useReaderStore((state) => state.book);
  const chapter = useReaderStore((state) => state.chapter);
  const pendingBook = useReaderStore((state) => state.pendingBook);
  const isSelectionMode = useReaderStore((state) => state.isSelectionMode);
  const setBook = useReaderStore((state) => state.setBook);
  const setChapter = useReaderStore((state) => state.setChapter);
  const selectBook = useReaderStore((state) => state.selectBook);

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
    book,
    books,
    chapter,
    elementRef: verseSectionRef,
    isBookSelectOpen: useReaderStore((state) => state.isBookSelectOpen),
    isSelectionMode,
    setBook,
    setChapter,
  });

  const selectedBookSummary = books.find((candidate) => candidate.id === book);

  useEffect(() => {
    const name = selectedBookSummary
      ? getBibleBookName(selectedBookSummary.id)
      : "";
    document.title = name ? `మన్నా - ${name} ${chapter}` : "మన్నా - తెలుగు బైబిల్";
  }, [selectedBookSummary, chapter]);
  const snapshot = useReaderSnapshot(
    book,
    chapter,
    selectedBookSummary?.chapterCount
  );

  const visibleBook = pendingBook ?? snapshot?.book ?? book;
  const visibleBookSummary = books.find(
    (candidate) => candidate.id === visibleBook
  );
  const isReaderTransitioning = snapshot !== null && snapshot.book !== book;
  const visibleChapters = resolveVisibleChapters(
    isReaderTransitioning,
    visibleBookSummary,
    snapshot
  );
  const visibleChapter = isReaderTransitioning ? 1 : chapter;

  const bookIndex = books.findIndex((candidate) => candidate.id === book);
  const isFirstBook = bookIndex <= 0;
  const isLastBook = bookIndex >= books.length - 1;

  const handlePrevBook = () => {
    const next = books[bookIndex - 1];
    if (next) {
      selectBook(next.id);
    }
  };

  const handleNextBook = () => {
    const next = books[bookIndex + 1];
    if (next) {
      selectBook(next.id);
    }
  };

  if (hasLoadedBooks && books.length === 0) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 pb-16">
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
    <main id="main-content" className="flex h-dvh flex-col">
      <Surface className="sticky top-0 z-30 border border-b py-2.5 pt-3.5">
        <div className="mx-auto flex w-full max-w-md flex-col gap-2 px-2 sm:max-w-lg md:max-w-xl lg:max-w-2xl">
          <div className="flex items-stretch gap-1">
            <Button
              variant="tertiary"
              aria-label="Previous book"
              size="sm"
              isDisabled={isFirstBook}
              onPress={handlePrevBook}
              className="h-auto px-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <BookSelect
              books={books}
              value={visibleBook}
              visibleBookSummary={visibleBookSummary}
              className="flex-1"
            />
            <Button
              variant="tertiary"
              aria-label="Next book"
              isDisabled={isLastBook}
              size="sm"
              onPress={handleNextBook}
              className="h-auto px-1.5"
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
          {selectedBookSummary
            ? `${getBibleBookName(selectedBookSummary.id)} ${chapter}`
            : "Bible Reader"}
        </Typography.Heading>
        <section
          ref={verseSectionRef}
          className={cn(
            "mx-auto w-full max-w-md px-2 py-4 sm:max-w-lg md:max-w-xl lg:max-w-2xl",
            isSelectionMode && "pb-24"
          )}
          aria-label={
            selectedBookSummary
              ? `${getBibleBookName(selectedBookSummary.id)} ${chapter}`
              : "Bible reader"
          }
        >
          {snapshot && <VerseList verses={snapshot.verses} />}
          {!snapshot && hasLoadedBooks && (
            <div className="flex flex-col gap-3" aria-busy="true">
              {SKELETON_WIDTHS.map((w, i) => (
                <Skeleton
                  key={i}
                  className="h-5 rounded-lg"
                  style={{ width: `${w}%` }}
                />
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

import { ChevronLeft, ChevronRight } from "@gravity-ui/icons";
import { Button, ScrollShadow, Skeleton, Typography } from "@heroui/react";
import { useEffect, useMemo, useRef } from "react";

import { getContiguousChapterNumbers } from "../../shared/bible";
import { cn } from "../../shared/lib/cn";
import { formatReference } from "../../shared/lib/reference";
import {
  BottomSpacer,
  Page,
  PageHeader,
  PageMessage,
  PageSection,
} from "../../shared/ui";
import BookSelect from "./components/book-select";
import ChapterStrip from "./components/chapter-strip";
import VerseActionBar from "./components/verse-action-bar";
import VerseList from "./components/verse-list";
import { useBooks } from "./hooks/use-books";
import {
  prefetchReaderSnapshot,
  useReaderSnapshot,
} from "./hooks/use-reader-snapshot";
import { useSwipeAndKeyboard } from "./hooks/use-swipe-and-keyboard";
import { selectIsSelectionMode, useReaderStore } from "./store/reader-store";
import type { NamedBook } from "../../shared/bible"; import type { ReaderSnapshot } from "./types";
import { useUrlSync } from "./use-url-sync";

const SKELETON_LINES = [
  "w-3/4",
  "w-17/20",
  "w-13/20",
  "w-9/10",
  "w-7/10",
  "w-4/5",
  "w-3/5",
  "w-19/20",
];

const resolveVisibleChapters = (
  isReaderTransitioning: boolean,
  visibleBookSummary: NamedBook | undefined,
  snapshot: ReaderSnapshot | null
) => {
  if (!visibleBookSummary) {
    return snapshot?.chapters ?? [];
  }

  if (isReaderTransitioning) {
    return getContiguousChapterNumbers(visibleBookSummary.chapterCount);
  }

  return (
    snapshot?.chapters ??
    getContiguousChapterNumbers(visibleBookSummary.chapterCount)
  );
};

const ReaderScreen = () => {
  useUrlSync();
  const { books, hasLoadedBooks } = useBooks();
  const book = useReaderStore((state) => state.book);
  const chapter = useReaderStore((state) => state.chapter);
  const pendingBook = useReaderStore((state) => state.pendingBook);
  const isSelectionMode = useReaderStore(selectIsSelectionMode);
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

  useSwipeAndKeyboard({ elementRef: verseSectionRef });

  const selectedBookSummary = books.find((candidate) => candidate.id === book);

  useEffect(() => {
    document.title = selectedBookSummary
      ? `మన్నా - ${formatReference(selectedBookSummary.id, chapter)}`
      : "మన్నా - తెలుగు బైబిల్";
  }, [selectedBookSummary, chapter]);

  const { snapshot, loadError, retrySnapshot } = useReaderSnapshot(
    book,
    chapter,
    selectedBookSummary?.chapterCount
  );

  useEffect(() => {
    if (!selectedBookSummary) {
      return;
    }

    const { chapterCount } = selectedBookSummary;
    const chapters = snapshot?.chapters ?? [];

    const currentIndex = chapters.indexOf(chapter);
    const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;

    const nextChapter =
      currentIndex !== -1 && currentIndex < chapters.length - 1
        ? chapters[currentIndex + 1]
        : null;

    if (prevChapter !== null) {
      void prefetchReaderSnapshot(book, prevChapter, chapterCount);
    }

    if (nextChapter !== null) {
      void prefetchReaderSnapshot(book, nextChapter, chapterCount);
    }
  }, [book, chapter, selectedBookSummary, snapshot]);

  const visibleBook = pendingBook ?? snapshot?.book ?? book;

  const visibleBookSummary = books.find(
    (candidate) => candidate.id === visibleBook
  );

  const isReaderTransitioning = snapshot !== null && snapshot.book !== book;

  const visibleChapters = useMemo(
    () =>
      resolveVisibleChapters(
        isReaderTransitioning,
        visibleBookSummary,
        snapshot
      ),
    [isReaderTransitioning, visibleBookSummary, snapshot]
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
    <Page>
      <PageHeader
        className="py-2.5 pt-3.5"
        innerClassName="flex flex-col gap-2"
      >
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
      </PageHeader>

      <ScrollShadow ref={scrollRef} hideScrollBar className="flex-1">
        <Typography.Heading level={1} className="sr-only">
          {selectedBookSummary
            ? formatReference(selectedBookSummary.id, chapter)
            : "Bible Reader"}
        </Typography.Heading>
        <PageSection
          ref={verseSectionRef}
          className={cn("py-4", isSelectionMode && "pb-24")}
          aria-label={
            selectedBookSummary
              ? formatReference(selectedBookSummary.id, chapter)
              : "Bible reader"
          }
        >
          {snapshot && <VerseList verses={snapshot.verses} />}
          {loadError !== null && snapshot === null && hasLoadedBooks && (
            <PageMessage title={loadError} tone="danger" announce="alert">
              <Button variant="primary" onPress={retrySnapshot}>
                Retry
              </Button>
            </PageMessage>
          )}
          {snapshot === null && loadError === null && hasLoadedBooks && (
            <PageMessage announce="live" className="items-stretch gap-3">
              {SKELETON_LINES.map((width) => (
                <Skeleton key={width} className={cn("h-5 rounded-lg", width)} />
              ))}
            </PageMessage>
          )}
        </PageSection>

        {snapshot && <VerseActionBar verses={snapshot.verses} />}
        <BottomSpacer />
      </ScrollShadow>
    </Page>
  );
};

export default ReaderScreen;

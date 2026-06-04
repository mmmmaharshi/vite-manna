import { useCallback, useEffect, useRef, useState } from "react";
import { Button, ScrollShadow, Surface, Typography } from "@heroui/react";

import { getBibleBookName, getVerses } from "../../shared/bible";
import { useBooks } from "./hooks/useBooks";
import { useReaderSnapshot } from "./hooks/useReaderSnapshot";
import BookSelect from "./components/BookSelect";
import ChapterStrip from "./components/ChapterStrip";
import VerseActionBar from "./components/VerseActionBar";
import VerseList from "./components/VerseList";
import { useReaderStore } from "./store/readerStore";
import { useUrlSync } from "./useUrlSync";
import type { BibleVerse } from "../../shared/bible";

interface ExtraChapter {
  book: number;
  chapter: number;
  verses: BibleVerse[];
}

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
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isLoadingExtra = useRef(false);

  const prevBookChapter = useRef({ book, chapter });
  useEffect(() => {
    const prev = prevBookChapter.current;
    if (prev.book !== book || prev.chapter !== chapter) {
      scrollRef.current?.scrollTo(0, 0);
      prevBookChapter.current = { book, chapter };
    }
  }, [book, chapter]);

  const [extraChapters, setExtraChapters] = useState<ExtraChapter[]>([]);

  useEffect(() => {
    setExtraChapters([]);
  }, [book, chapter]);

  const loadNextChapter = useCallback(async () => {
    if (isLoadingExtra.current) return;
    isLoadingExtra.current = true;

    try {
      const lastExtra = extraChapters[extraChapters.length - 1];
      const currentBook = lastExtra ? lastExtra.book : book;
      const currentChapter = lastExtra ? lastExtra.chapter : chapter;
      const chapters = snapshot?.chapters ?? [];
      const chapterIdx = chapters.indexOf(currentChapter);

      let nextBook: number;
      let nextChapter: number;

      if (chapterIdx >= 0 && chapterIdx < chapters.length - 1) {
        nextBook = currentBook;
        nextChapter = chapters[chapterIdx + 1];
      } else {
        const next = books.find((b) => b.id > currentBook);
        if (!next) { isLoadingExtra.current = false; return; }
        nextBook = next.id;
        nextChapter = 1;
      }

      const verses = await getVerses(nextBook, nextChapter);
      if (verses.length === 0) { isLoadingExtra.current = false; return; }

      setExtraChapters((prev) => [...prev, { book: nextBook, chapter: nextChapter, verses }]);
    } finally {
      isLoadingExtra.current = false;
    }
  }, [book, chapter, books, extraChapters, snapshot?.chapters]);

  const snapshot = useReaderSnapshot(
    book,
    chapter,
    selectedBookSummary?.chapterCount,
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadNextChapter();
      },
      { rootMargin: "300px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadNextChapter]);

  const selectedBookSummary = books.find((candidate) => candidate.id === book);

  useEffect(() => {
    const name = selectedBookSummary ? getBibleBookName(selectedBookSummary.id) : "";
    document.title = name ? `మన్నా - ${name} ${chapter}` : "మన్నా - తెలుగు బైబిల్";
  }, [selectedBookSummary, chapter]);

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
    <div className="h-dvh flex flex-col">
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

      <ScrollShadow ref={scrollRef} hideScrollBar className="flex-1">
        <Typography.Heading level={1} className="sr-only">
          {selectedBookSummary ? `${getBibleBookName(selectedBookSummary.id)} ${chapter}` : "Bible Reader"}
        </Typography.Heading>
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

          {extraChapters.map((ec) => (
            <div key={`${ec.book}-${ec.chapter}`}>
              <Typography className="text-xs text-muted text-center py-3 border-t border-b my-4">
                {getBibleBookName(ec.book)} {ec.chapter}
              </Typography>
              <VerseList verses={ec.verses} />
            </div>
          ))}

          <div ref={sentinelRef} className="h-4" />
        </section>

        {snapshot && <VerseActionBar verses={snapshot.verses} />}
        <div className="h-16" />
      </ScrollShadow>
    </div>
  );
};

export default ReaderScreen;

import { lazy, memo, Suspense, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { Sparkles } from "@gravity-ui/icons";
import { Button, ScrollShadow } from "@heroui/react";

import { useReaderStore } from "../store/readerStore";

const DailyVerseModal = lazy(() => import("./DailyVerseModal"));

interface ChapterStripProps {
  chapters: number[];
  currentBook: number;
  isReaderTransitioning: boolean;
  onSelectChapter: (chapter: number) => void;
  visibleChapter: number;
}

function useChapterStripScroll({
  activeChapterRef,
  chapterStripRef,
  currentBook,
  isReaderTransitioning,
  visibleChapter,
  visibleChaptersLength,
}: {
  activeChapterRef: RefObject<HTMLButtonElement | null>;
  chapterStripRef: RefObject<HTMLDivElement | null>;
  currentBook: number;
  isReaderTransitioning: boolean;
  visibleChapter: number;
  visibleChaptersLength: number;
}) {
  const scrollByBookRef = useRef(new Map<number, number>());
  const lastScrollRestoreKeyRef = useRef<string | null>(null);
  const clearPendingBook = useReaderStore((state) => state.clearPendingBook);

  useLayoutEffect(() => {
    if (isReaderTransitioning) return;

    const activeChapter = activeChapterRef.current;
    const chapterStrip = chapterStripRef.current;

    if (!activeChapter || !chapterStrip) return;

    const scrollRestoreKey = `${currentBook}:ready`;

    if (lastScrollRestoreKeyRef.current === scrollRestoreKey) return;

    lastScrollRestoreKeyRef.current = scrollRestoreKey;

    const savedScrollLeft = scrollByBookRef.current.get(currentBook);

    chapterStrip.scrollLeft =
      savedScrollLeft ??
      activeChapter.offsetLeft -
        (chapterStrip.clientWidth - activeChapter.offsetWidth) / 2;

    if (savedScrollLeft === undefined) {
      activeChapter.scrollIntoView({
        block: "nearest",
        inline: "center",
      });
    }
  }, [
    activeChapterRef,
    chapterStripRef,
    currentBook,
    isReaderTransitioning,
    visibleChapter,
    visibleChaptersLength,
  ]);

  useLayoutEffect(() => {
    if (isReaderTransitioning) return;

    const pendingBook = useReaderStore.getState().pendingBook;

    if (pendingBook === null || pendingBook !== currentBook) return;

    const frameId = requestAnimationFrame(() => {
      clearPendingBook();
    });

    return () => cancelAnimationFrame(frameId);
  }, [
    clearPendingBook,
    currentBook,
    isReaderTransitioning,
    visibleChapter,
    visibleChaptersLength,
  ]);

  return {
    rememberChapterStripScroll: () => {
      const chapterStrip = chapterStripRef.current;
      if (!chapterStrip) return;
      scrollByBookRef.current.set(currentBook, chapterStrip.scrollLeft);
    },
  };
}

const ChapterStrip = memo(({
  chapters,
  currentBook,
  isReaderTransitioning,
  onSelectChapter,
  visibleChapter,
}: ChapterStripProps) => {
  const chapterStripRef = useRef<HTMLDivElement>(null);
  const activeChapterRef = useRef<HTMLButtonElement>(null);

  const { rememberChapterStripScroll } = useChapterStripScroll({
    activeChapterRef,
    chapterStripRef,
    currentBook,
    isReaderTransitioning,
    visibleChapter,
    visibleChaptersLength: chapters.length,
  });

  const [isDailyVerseOpen, setIsDailyVerseOpen] = useState(false);
  const handleDailyVerseNavigate = (book: number, chapter: number, verse: number) => {
    setIsDailyVerseOpen(false);
    useReaderStore.getState().setBook(book);
    useReaderStore.getState().setChapter(chapter);
    useReaderStore.getState().setPermalinkVerse(verse);
  };

  if (chapters.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <Button isIconOnly size="sm" variant="tertiary" aria-label="Verse of the Day"
        className="shrink-0" onPress={() => setIsDailyVerseOpen(true)}>
        <Sparkles aria-hidden="true" className="h-4 w-4" />
      </Button>
    <ScrollShadow
      ref={chapterStripRef}
      hideScrollBar
      orientation="horizontal"
      onScroll={rememberChapterStripScroll}
    >
      <div className="flex gap-2 py-1">
        {chapters.map((chapterNumber) => (
          <Button
            ref={visibleChapter === chapterNumber ? activeChapterRef : null}
            key={chapterNumber}
            aria-label={`Chapter ${chapterNumber}`}
            size="sm"
            variant={
              visibleChapter === chapterNumber ? "primary" : "secondary"
            }
            onPress={() => onSelectChapter(chapterNumber)}
          >
            {chapterNumber}
          </Button>
        ))}
      </div>
    </ScrollShadow>
      <Suspense fallback={null}>
        <DailyVerseModal
          isOpen={isDailyVerseOpen}
          onOpenChange={setIsDailyVerseOpen}
          onNavigateToChapter={handleDailyVerseNavigate}
        />
      </Suspense>
    </div>
  );
});

export default ChapterStrip;

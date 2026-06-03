import { useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Sparkles } from "@gravity-ui/icons";
import { Button, ScrollShadow } from "@heroui/react";

import { useBookmarks } from "../../bookmarks/hooks/useBookmarks";
import { useReaderStore } from "../store/readerStore";
import DailyVerseModal from "./DailyVerseModal";

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

const ChapterStrip = ({
  chapters,
  currentBook,
  isReaderTransitioning,
  onSelectChapter,
  visibleChapter,
}: ChapterStripProps) => {
  const chapterStripRef = useRef<HTMLDivElement>(null);
  const activeChapterRef = useRef<HTMLButtonElement>(null);

  const { bookmarks } = useBookmarks();

  const bookmarkedChapters = useMemo(() => {
    const set = new Set<number>();
    for (const bm of bookmarks) {
      if (bm.book === currentBook) set.add(bm.chapter);
    }
    return set;
  }, [bookmarks, currentBook]);

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
        <Sparkles className="h-4 w-4" />
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
            {bookmarkedChapters.has(chapterNumber) && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-accent" role="img" aria-label="Bookmarked" />
            )}
          </Button>
        ))}
      </div>
    </ScrollShadow>
      <DailyVerseModal
        isOpen={isDailyVerseOpen}
        onOpenChange={setIsDailyVerseOpen}
        onNavigateToChapter={handleDailyVerseNavigate}
      />
    </div>
  );
};

export default ChapterStrip;

import { useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import { Button, ScrollShadow } from "@heroui/react";

import { useBookmarks } from "../../bookmarks/hooks/useBookmarks";
import { useReaderStore } from "../store/readerStore";

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

  if (chapters.length === 0) return null;

  return (
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
            size="sm"
            variant={
              visibleChapter === chapterNumber ? "primary" : "secondary"
            }
            onPress={() => onSelectChapter(chapterNumber)}
          >
            {chapterNumber}
            {bookmarkedChapters.has(chapterNumber) && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-accent" />
            )}
          </Button>
        ))}
      </div>
    </ScrollShadow>
  );
};

export default ChapterStrip;

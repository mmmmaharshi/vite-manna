import { Button, ScrollShadow } from "@heroui/react";
import { memo, useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";

import { useReaderStore } from "../store/reader-store";

interface ChapterStripProps {
  chapters: number[];
  currentBook: number;
  isReaderTransitioning: boolean;
  onSelectChapter: (chapter: number) => void;
  visibleChapter: number;
}

const useChapterStripScroll = ({
  activeChapterRef,
  chapterStripRef,
  currentBook,
  isReaderTransitioning,
}: {
  activeChapterRef: RefObject<HTMLButtonElement | null>;
  chapterStripRef: RefObject<HTMLDivElement | null>;
  currentBook: number;
  isReaderTransitioning: boolean;
}) => {
  const scrollByBookRef = useRef(new Map<number, number>());
  const lastScrollRestoreKeyRef = useRef<string | null>(null);
  const clearPendingBook = useReaderStore((state) => state.clearPendingBook);

  useLayoutEffect(() => {
    if (isReaderTransitioning) {
      return;
    }

    const activeChapter = activeChapterRef.current;
    const chapterStrip = chapterStripRef.current;

    if (!activeChapter || !chapterStrip) {
      return;
    }

    const scrollRestoreKey = `${currentBook}:ready`;

    if (lastScrollRestoreKeyRef.current === scrollRestoreKey) {
      return;
    }

    lastScrollRestoreKeyRef.current = scrollRestoreKey;

    const savedScrollLeft = scrollByBookRef.current.get(currentBook);
    const targetScrollLeft =
      savedScrollLeft ??
      activeChapter.offsetLeft -
        (chapterStrip.clientWidth - activeChapter.offsetWidth) / 2;

    chapterStrip.scrollLeft = targetScrollLeft;

    if (savedScrollLeft === undefined) {
      activeChapter.scrollIntoView({
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeChapterRef, chapterStripRef, currentBook, isReaderTransitioning]);

  useLayoutEffect(() => {
    if (isReaderTransitioning) {
      return;
    }

    const { pendingBook } = useReaderStore.getState();

    if (pendingBook === null || pendingBook !== currentBook) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      clearPendingBook();
    });

    return () => cancelAnimationFrame(frameId);
  }, [clearPendingBook, currentBook, isReaderTransitioning]);

  return {
    rememberChapterStripScroll: () => {
      const chapterStrip = chapterStripRef.current;
      if (!chapterStrip) {
        return;
      }
      scrollByBookRef.current.set(currentBook, chapterStrip.scrollLeft);
    },
  };
};

const ChapterStripComponent = ({
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
  });

  if (chapters.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
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
              aria-label={`${chapterNumber}వ అధ్యాయం`}
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
    </div>
  );
};

const ChapterStrip = memo(ChapterStripComponent);

export default ChapterStrip;

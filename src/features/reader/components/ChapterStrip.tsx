import {
  useLayoutEffect,
  useRef,
  type RefObject,
} from "react";
import { Button, ScrollShadow } from "@heroui/react";

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
    const activeChapter = activeChapterRef.current;
    const chapterStrip = chapterStripRef.current;

    if (!activeChapter || !chapterStrip) {
      return;
    }

    const scrollRestoreKey = `${currentBook}:${isReaderTransitioning ? "loading" : "ready"}`;

    if (lastScrollRestoreKeyRef.current === scrollRestoreKey) {
      return;
    }

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
    if (isReaderTransitioning) {
      return;
    }

    const pendingBook = useReaderStore.getState().pendingBook;

    if (pendingBook === null || pendingBook !== currentBook) {
      return;
    }

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

      if (!chapterStrip) {
        return;
      }

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

  const { rememberChapterStripScroll } = useChapterStripScroll({
    activeChapterRef,
    chapterStripRef,
    currentBook,
    isReaderTransitioning,
    visibleChapter,
    visibleChaptersLength: chapters.length,
  });

  if (chapters.length === 0) {
    return null;
  }

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
            ref={
              visibleChapter === chapterNumber ? activeChapterRef : null
            }
            key={chapterNumber}
            size="md"
            className="rounded-md"
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
  );
};

export default ChapterStrip;

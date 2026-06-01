import { useLayoutEffect, useRef } from "react";

import type { ReaderSnapshot } from "./useReader";

export interface UseChapterStripScrollArgs {
  isHydrated: boolean;
  isReaderTransitioning: boolean;
  pendingBook: number | null;
  readerSnapshot: ReaderSnapshot | null;
  setIsBookSelectOpen: (isOpen: boolean) => void;
  setPendingBook: (book: number | null) => void;
  visibleBook: number;
  visibleChapter: number;
  visibleChaptersLength: number;
}

export interface UseChapterStripScrollResult {
  activeChapterRef: React.RefObject<HTMLButtonElement | null>;
  chapterStripRef: React.RefObject<HTMLDivElement | null>;
  rememberChapterStripScroll: () => void;
}

export function useChapterStripScroll({
  isHydrated,
  isReaderTransitioning,
  pendingBook,
  readerSnapshot,
  setIsBookSelectOpen,
  setPendingBook,
  visibleBook,
  visibleChapter,
  visibleChaptersLength,
}: UseChapterStripScrollArgs): UseChapterStripScrollResult {
  const chapterStripRef = useRef<HTMLDivElement>(null);
  const activeChapterRef = useRef<HTMLButtonElement>(null);
  const chapterStripScrollByBookRef = useRef(new Map<number, number>());
  const lastScrollRestoreKeyRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    const activeChapter = activeChapterRef.current;
    const chapterStrip = chapterStripRef.current;
    const renderedBook = isReaderTransitioning
      ? visibleBook
      : readerSnapshot?.book;

    if (
      !isHydrated ||
      !activeChapter ||
      !chapterStrip ||
      renderedBook === undefined
    ) {
      return;
    }

    const scrollRestoreKey = `${renderedBook}:${isReaderTransitioning ? "loading" : "ready"}`;

    if (lastScrollRestoreKeyRef.current === scrollRestoreKey) {
      return;
    }

    lastScrollRestoreKeyRef.current = scrollRestoreKey;

    const savedScrollLeft =
      pendingBook === renderedBook
        ? chapterStripScrollByBookRef.current.get(renderedBook)
        : undefined;

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

    if (!isReaderTransitioning && pendingBook === renderedBook) {
      const frameId = requestAnimationFrame(() => {
        setPendingBook(null);
        setIsBookSelectOpen(false);
      });

      return () => cancelAnimationFrame(frameId);
    }
  }, [
    isHydrated,
    isReaderTransitioning,
    pendingBook,
    readerSnapshot,
    setIsBookSelectOpen,
    setPendingBook,
    visibleBook,
    visibleChapter,
    visibleChaptersLength,
  ]);

  const rememberChapterStripScroll = () => {
    const chapterStrip = chapterStripRef.current;
    const snapshotBook = readerSnapshot?.book;

    if (!chapterStrip || snapshotBook === undefined) {
      return;
    }

    chapterStripScrollByBookRef.current.set(
      snapshotBook,
      chapterStrip.scrollLeft,
    );
  };

  return {
    activeChapterRef,
    chapterStripRef,
    rememberChapterStripScroll,
  };
}

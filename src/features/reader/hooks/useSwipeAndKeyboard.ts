import { useEffect, useRef } from "react";

import type { BibleBook } from "../types";
import { navigateChapter } from "./navigateChapter";

const SWIPE_THRESHOLD = 50;
const SWIPE_TIME_MAX = 400;

interface UseSwipeAndKeyboardOptions {
  elementRef: React.RefObject<HTMLElement | null>;
  books: BibleBook[];
  book: number;
  chapter: number;
  setChapter: (chapter: number) => void;
  setBook: (book: number) => void;
  isSelectionMode: boolean;
  isBookSelectOpen: boolean;
}

export function useSwipeAndKeyboard({
  elementRef,
  books,
  book,
  chapter,
  setChapter,
  setBook,
  isSelectionMode,
  isBookSelectOpen,
}: UseSwipeAndKeyboardOptions) {
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (isSelectionMode || isBookSelectOpen) return;
      const t = e.touches[0];
      touchStart.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;
      if (isSelectionMode || isBookSelectOpen) return;

      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.current.x;
      const dy = t.clientY - touchStart.current.y;
      const dt = Date.now() - touchStart.current.time;

      touchStart.current = null;

      if (dt > SWIPE_TIME_MAX) return;
      if (Math.abs(dx) < SWIPE_THRESHOLD) return;
      if (Math.abs(dy) > Math.abs(dx) * 0.5) return;

      const dir = dx > 0 ? "prev" : "next";
      const next = navigateChapter(books, book, chapter, dir);
      if (next) {
        if (next.book !== book) setBook(next.book);
        setChapter(next.chapter);
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [elementRef, books, book, chapter, setChapter, setBook, isSelectionMode, isBookSelectOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isSelectionMode || isBookSelectOpen) return;

      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = navigateChapter(books, book, chapter, "next");
        if (next) {
          if (next.book !== book) setBook(next.book);
          setChapter(next.chapter);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const next = navigateChapter(books, book, chapter, "prev");
        if (next) {
          if (next.book !== book) setBook(next.book);
          setChapter(next.chapter);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [books, book, chapter, setChapter, setBook, isSelectionMode, isBookSelectOpen]);
}

import { useEffect, useRef } from "react";

import { selectIsSelectionMode, useReaderStore } from "../store/reader-store";
import { navigateChapter } from "./navigate-chapter";
import { useBooks } from "./use-books";

const SWIPE_THRESHOLD = 50;
const SWIPE_TIME_MAX = 400;

interface UseSwipeAndKeyboardOptions {
  elementRef: React.RefObject<HTMLElement | null>;
}

/**
 * Drives chapter navigation from touch swipes and arrow keys.
 *
 * @param options - The element to listen on.
 * @returns Nothing.
 */
export const useSwipeAndKeyboard = ({
  elementRef,
}: UseSwipeAndKeyboardOptions) => {
  const { books } = useBooks();
  const book = useReaderStore((state) => state.book);
  const chapter = useReaderStore((state) => state.chapter);
  const isSelectionMode = useReaderStore(selectIsSelectionMode);
  const isBookSelectOpen = useReaderStore((state) => state.isBookSelectOpen);
  const goToChapter = useReaderStore((state) => state.goToChapter);
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(
    null
  );

  useEffect(() => {
    const el = elementRef.current;

    const onTouchStart = (e: TouchEvent) => {
      if (isSelectionMode || isBookSelectOpen) {
        return;
      }

      const [touch] = e.touches;
      touchStart.current = {
        time: Date.now(),
        x: touch.clientX,
        y: touch.clientY,
      };
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) {
        return;
      }

      if (isSelectionMode || isBookSelectOpen) {
        return;
      }

      const [touch] = e.changedTouches;
      const dx = touch.clientX - touchStart.current.x;
      const dy = touch.clientY - touchStart.current.y;
      const dt = Date.now() - touchStart.current.time;

      touchStart.current = null;

      if (dt > SWIPE_TIME_MAX) {
        return;
      }

      if (Math.abs(dx) < SWIPE_THRESHOLD) {
        return;
      }

      if (Math.abs(dy) > Math.abs(dx) * 0.5) {
        return;
      }

      const dir = dx > 0 ? "prev" : "next";
      const next = navigateChapter(books, book, chapter, dir);

      if (next) {
        goToChapter(next.book, next.chapter);
      }
    };

    if (el) {
      el.addEventListener("touchstart", onTouchStart, { passive: true });
      el.addEventListener("touchend", onTouchEnd, { passive: true });
    }

    return () => {
      el?.removeEventListener("touchstart", onTouchStart);
      el?.removeEventListener("touchend", onTouchEnd);
    };
  }, [
    elementRef,
    books,
    book,
    chapter,
    goToChapter,
    isSelectionMode,
    isBookSelectOpen,
  ]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isSelectionMode || isBookSelectOpen) {
        return;
      }

      const tag = e.target instanceof HTMLElement ? e.target.tagName : "";

      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = navigateChapter(books, book, chapter, "next");

        if (next) {
          goToChapter(next.book, next.chapter);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const next = navigateChapter(books, book, chapter, "prev");

        if (next) {
          goToChapter(next.book, next.chapter);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [books, book, chapter, goToChapter, isSelectionMode, isBookSelectOpen]);
};

import { useLayoutEffect, useRef } from "react";
import { Typography } from "@heroui/react";

import { useBookmarks } from "../../bookmarks/hooks/useBookmarks";
import { useReaderStore } from "../store/readerStore";
import { SIZE_PROPS } from "../../../shared/lib/fontSize";
import type { BibleVerse } from "../../../shared/bible";
import "./verseList.css";

interface VerseListProps {
  verses: BibleVerse[];
}

const VerseList = ({ verses }: VerseListProps) => {
  const selectedVerseIds = useReaderStore((state) => state.selectedVerseIds);
  const toggleVerseSelection = useReaderStore(
    (state) => state.toggleVerseSelection,
  );
  const permalinkVerse = useReaderStore((state) => state.permalinkVerse);

  const permalinkRef = useRef<HTMLLIElement | null>(null);
  const lastScrolledVerseRef = useRef<number | null>(null);

  const fontSize = useReaderStore((state) => state.fontSize);
  const { bookmarkedIds } = useBookmarks();
  const selectedSet = new Set(selectedVerseIds);

  useLayoutEffect(() => {
    if (permalinkVerse === null) {
      lastScrolledVerseRef.current = null;
      return;
    }

    if (lastScrolledVerseRef.current === permalinkVerse) {
      return;
    }

    if (!verses.some((verse) => verse.verse === permalinkVerse)) {
      return;
    }

    const target = permalinkRef.current;

    if (target === null) {
      return;
    }

    target.scrollIntoView({ block: "center", behavior: "smooth" });
    lastScrolledVerseRef.current = permalinkVerse;
  }, [permalinkVerse, verses]);

  return (
    <ol className="flex flex-col gap-1">
      {verses.map((verse) => {
        const isSelected = selectedSet.has(verse.id);
        const isPermalink = verse.verse === permalinkVerse;
        const isBookmarked = bookmarkedIds.has(verse.id);

        return (
          <li
            key={verse.id}
            ref={isPermalink ? permalinkRef : null}
          >
            <button
              type="button"
              aria-pressed={isSelected}
              className={[
                "block w-full rounded-md px-2 py-1.5 text-left transition-colors",
                isSelected
                  ? "bg-accent/15 hover:bg-accent/20"
                  : "hover:bg-surface-secondary",
                isPermalink ? "animate-permalink-flash" : "",
                isBookmarked ? "bg-amber-100/90 dark:bg-amber-900/60" : "",
              ].join(" ")}
              onClick={() => toggleVerseSelection(verse.id)}
            >
              <Typography {...SIZE_PROPS[fontSize]} render={({ children, ...dp }) => <span {...dp}>{children}</span>}>
                <sup className="me-1 text-[0.65em] text-muted">{verse.verse}</sup>
                {verse.text}
              </Typography>
            </button>
          </li>
        );
      })}
    </ol>
  );
};

export default VerseList;

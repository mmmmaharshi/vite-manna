import { memo, useLayoutEffect, useRef } from "react";

import type { BibleVerse } from "../../../shared/bible";
import { cn } from "../../../shared/lib/cn";
import { fontSizeClass } from "../../../shared/lib/font-size";
import { useHighlights } from "../../highlights/hooks/use-highlights";
import { useReaderStore } from "../store/reader-store";

import "./verseList.css";

interface VerseListProps {
  verses: BibleVerse[];
}

const VerseListComponent = ({ verses }: VerseListProps) => {
  const selectedVerseIds = useReaderStore((state) => state.selectedVerseIds);

  const toggleVerseSelection = useReaderStore(
    (state) => state.toggleVerseSelection
  );

  const permalinkVerse = useReaderStore((state) => state.permalinkVerse);

  const permalinkRef = useRef<HTMLLIElement | null>(null);
  const lastScrolledVerseRef = useRef<number | null>(null);

  const fontSize = useReaderStore((state) => state.fontSize);
  const selectedSet = new Set(selectedVerseIds);

  const { highlightedMap } = useHighlights();

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

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    lastScrolledVerseRef.current = permalinkVerse;
  }, [permalinkVerse, verses]);

  return (
    <ol className="flex flex-col gap-0">
      {verses.map((verse) => {
        const isSelected = selectedSet.has(verse.id);
        const isPermalink = verse.verse === permalinkVerse;
        const highlightColor = highlightedMap.get(verse.id);

        return (
          <li
            key={verse.id}
            ref={isPermalink ? permalinkRef : null}
            className="verse-row relative"
          >
            {highlightColor && (
              <div
                aria-hidden="true"
                className={cn("highlight-strip", `highlight-${highlightColor}`)}
              />
            )}
            <button
              type="button"
              aria-pressed={isSelected}
              className={cn(
                "relative z-[1] block min-h-11 w-full rounded-md px-2 py-2.5 text-left transition-colors",
                isSelected
                  ? "bg-accent/15 hover:bg-accent/20"
                  : "hover:bg-surface-secondary",
                isPermalink && "motion-safe:animate-permalink-flash"
              )}
              onClick={() => toggleVerseSelection(verse.id)}
            >
              <span className={cn(fontSizeClass(fontSize), "leading-relaxed")}>
                <sup className="text-muted text-superscript me-1">
                  {verse.verse}
                </sup>
                {verse.text}
                {highlightColor && (
                  <span
                    aria-hidden="true"
                    className={cn("hl-dot", `hl-dot-${highlightColor}`)}
                  />
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
};

const VerseList = memo(VerseListComponent);

export default VerseList;

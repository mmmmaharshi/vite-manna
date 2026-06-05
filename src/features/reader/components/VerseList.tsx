import { memo, useLayoutEffect, useRef } from "react";
import { cn } from "../../../shared/lib/cn";
import { useHighlights } from "../../highlights/hooks/useHighlights";
import { useReaderStore } from "../store/readerStore";
import type { BibleVerse, HighlightColor } from "../../../shared/bible";
import "./verseList.css";

interface VerseListProps {
  verses: BibleVerse[];
}

const VerseList = memo(({ verses }: VerseListProps) => {
  const selectedVerseIds = useReaderStore((state) => state.selectedVerseIds);
  const toggleVerseSelection = useReaderStore(
    (state) => state.toggleVerseSelection,
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

    target.scrollIntoView({ block: "center", behavior: "smooth" });
    lastScrolledVerseRef.current = permalinkVerse;
  }, [permalinkVerse, verses]);

  return (
    <ol className="flex flex-col gap-1">
      {verses.map((verse) => {
        const isSelected = selectedSet.has(verse.id);
        const isPermalink = verse.verse === permalinkVerse;
        const highlightColor = highlightedMap.get(verse.id) as HighlightColor | undefined;

        return (
          <li
            key={verse.id}
            ref={isPermalink ? permalinkRef : null}
            className="relative"
            style={{ contentVisibility: "auto", containIntrinsicSize: "auto 2.5rem" }}
          >
            {highlightColor && <div aria-hidden="true" className={cn("highlight-strip", `highlight-${highlightColor}`)} />}
            <button
              type="button"
              aria-pressed={isSelected}
              className={cn(
                "relative z-[1] block w-full rounded-md px-2 py-2.5 text-left transition-colors min-h-11",
                isSelected ? "bg-accent/15 hover:bg-accent/20" : "hover:bg-surface-secondary",
                isPermalink && "animate-permalink-flash",
              )}
              onClick={() => toggleVerseSelection(verse.id)}
            >
              <span className={cn(
                fontSize === "sm" && "text-sm",
                fontSize === "base" && "text-base",
                fontSize === "lg" && "text-lg",
                fontSize === "xl" && "text-xl",
                fontSize === "2xl" && "text-2xl",
              )}>
                <sup className="me-1 text-[0.65em] text-muted">{verse.verse}</sup>
                {verse.text}
                {highlightColor && <span aria-hidden="true" className={cn("hl-dot", `hl-dot-${highlightColor}`)} />}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
});

export default VerseList;

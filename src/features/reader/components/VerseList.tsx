import { Typography } from "@heroui/react";

import { useReaderStore } from "../store/readerStore";
import type { BibleVerse } from "../../../shared/bible";

interface VerseListProps {
  verses: BibleVerse[];
}

const VerseList = ({ verses }: VerseListProps) => {
  const isSelectionMode = useReaderStore((state) => state.isSelectionMode);
  const selectedVerseIds = useReaderStore((state) => state.selectedVerseIds);
  const toggleVerseSelection = useReaderStore(
    (state) => state.toggleVerseSelection,
  );

  const selectedSet = new Set(selectedVerseIds);

  return (
    <ol className="flex flex-col gap-1 [content-visibility:auto]">
      {verses.map((verse) => {
        const isSelected = selectedSet.has(verse.id);

        return (
          <li key={verse.id}>
            <button
              type="button"
              aria-pressed={isSelectionMode ? isSelected : undefined}
              className={[
                "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
                "hover:bg-surface-secondary",
                isSelected
                  ? "bg-accent/10 hover:bg-accent/15"
                  : "bg-transparent",
              ].join(" ")}
              onClick={() => toggleVerseSelection(verse.id)}
            >
              {isSelectionMode && (
                <span
                  aria-hidden="true"
                  className={[
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    isSelected
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-default-300 bg-transparent",
                  ].join(" ")}
                >
                  {isSelected && (
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      viewBox="0 0 16 16"
                    >
                      <polyline points="3 8 7 12 13 4" />
                    </svg>
                  )}
                </span>
              )}
              <Typography className="text-sm">
                <sup className="me-1 text-xs text-muted">{verse.verse}</sup>
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

import { Typography } from "@heroui/react";

import { useReaderStore } from "../store/readerStore";
import type { BibleVerse } from "../../../shared/bible";

interface VerseListProps {
  verses: BibleVerse[];
}

const VerseList = ({ verses }: VerseListProps) => {
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
              aria-pressed={isSelected}
              className={[
                "block w-full rounded-md px-2 py-1.5 text-left transition-colors",
                isSelected
                  ? "bg-accent/15 hover:bg-accent/20"
                  : "hover:bg-surface-secondary",
              ].join(" ")}
              onClick={() => toggleVerseSelection(verse.id)}
            >
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

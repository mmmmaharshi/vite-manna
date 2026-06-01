import { useEffect, useState } from "react";
import { Button, Surface } from "@heroui/react";

import { getBibleBookName, type BibleVerse } from "../../../shared/bible";
import { useReaderStore } from "../store/readerStore";

interface VerseActionBarProps {
  verses: BibleVerse[];
}

type CopyState = "idle" | "copied" | "error";

function formatReference(book: number, chapter: number) {
  return `${getBibleBookName(book)} ${chapter}`;
}

function buildShareText(verses: BibleVerse[], book: number, chapter: number) {
  const reference = formatReference(book, chapter);
  const ordered = [...verses].sort(
    (first, second) => first.verse - second.verse,
  );

  return ordered
    .map((verse) => `${reference}:${verse.verse} ${verse.text}`)
    .join("\n");
}

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

const VerseActionBar = ({ verses }: VerseActionBarProps) => {
  const isSelectionMode = useReaderStore((state) => state.isSelectionMode);
  const selectedVerseIds = useReaderStore((state) => state.selectedVerseIds);
  const clearVerseSelection = useReaderStore(
    (state) => state.clearVerseSelection,
  );
  const book = useReaderStore((state) => state.book);
  const chapter = useReaderStore((state) => state.chapter);

  const [copyState, setCopyState] = useState<CopyState>("idle");

  useEffect(() => {
    if (copyState === "idle") {
      return;
    }

    const timeout = setTimeout(() => setCopyState("idle"), 1600);
    return () => clearTimeout(timeout);
  }, [copyState]);

  if (!isSelectionMode) {
    return null;
  }

  const selectedSet = new Set(selectedVerseIds);
  const selectedVerses = verses.filter((verse) => selectedSet.has(verse.id));
  const text = buildShareText(selectedVerses, book, chapter);

  const handleCopy = async () => {
    if (selectedVerses.length === 0) {
      return;
    }

    try {
      await copyToClipboard(text);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  };

  const handleShare = async () => {
    if (selectedVerses.length === 0) {
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    await handleCopy();
  };

  const copyLabel =
    copyState === "copied"
      ? "Copied"
      : copyState === "error"
        ? "Copy failed"
        : "Copy";

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 pointer-events-none"
    >
      <Surface className="mx-auto flex w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 shadow-lg pointer-events-auto">
        <span className="text-sm font-medium tabular-nums">
          {selectedVerseIds.length} selected
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            onPress={handleShare}
          >
            Share
          </Button>
          <Button
            size="sm"
            variant="primary"
            onPress={handleCopy}
          >
            {copyLabel}
          </Button>
          <Button
            aria-label="Clear selection"
            size="sm"
            variant="tertiary"
            onPress={clearVerseSelection}
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </div>
      </Surface>
    </div>
  );
};

export default VerseActionBar;

import { Button, Surface, toast } from "@heroui/react";

import { getBibleBookName, type BibleVerse } from "../../../shared/bible";
import { useReaderStore } from "../store/readerStore";

interface VerseActionBarProps {
  verses: BibleVerse[];
}

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

function canNativeShare() {
  return (
    typeof navigator !== "undefined" && typeof navigator.share === "function"
  );
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
      toast("Copied to clipboard", { variant: "success" });
    } catch {
      toast("Copy failed", { variant: "danger" });
    }
  };

  const handleShare = async () => {
    if (selectedVerses.length === 0) {
      return;
    }

    if (!canNativeShare()) {
      toast("Sharing isn't supported on this device", {
        variant: "warning",
      });
      return;
    }

    try {
      await navigator.share({ text });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      toast("Share failed", { variant: "danger" });
    }
  };

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
            aria-label="Share"
            isIconOnly
            size="sm"
            variant="secondary"
            onPress={handleShare}
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
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </Button>
          <Button
            aria-label="Copy"
            isIconOnly
            size="sm"
            variant="primary"
            onPress={handleCopy}
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
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </Button>
          <Button
            aria-label="Clear selection"
            isIconOnly
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

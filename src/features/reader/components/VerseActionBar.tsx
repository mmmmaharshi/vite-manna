import { memo } from "react";
import { ArrowUpFromSquare, Link as LinkIcon, PencilToSquare, TrashBin } from "@gravity-ui/icons";
import { Button, Surface, toast, Tooltip } from "@heroui/react";

import { getBibleBookName, type BibleVerse } from "../../../shared/bible";
import { canNativeShare, copyToClipboard } from "../../../shared/lib/browser";
import { cn } from "../../../shared/lib/cn";
import { useHighlights } from "../../highlights/hooks/useHighlights";
import { useReaderStore } from "../store/readerStore";

interface VerseActionBarProps {
  verses: BibleVerse[];
}

function formatReference(book: number, chapter: number) {
  return `${getBibleBookName(book)} ${chapter}`;
}

function buildShareText(verses: BibleVerse[], book: number, chapter: number) {
  const reference = formatReference(book, chapter);
  return verses
    .map((verse) => `${reference}:${verse.verse} ${verse.text}`)
    .join("\n");
}

function buildPermalinkUrl(book: number, chapter: number, verse: number) {
  const url = new URL(window.location.href);
  url.searchParams.set("book", String(book));
  url.searchParams.set("chapter", String(chapter));
  url.searchParams.set("verse", String(verse));
  url.hash = "";
  return url.toString();
}

const VerseActionBarInner = memo(({ verses }: VerseActionBarProps) => {
  const selectedVerseIds = useReaderStore((state) => state.selectedVerseIds);
  const clearVerseSelection = useReaderStore(
    (state) => state.clearVerseSelection,
  );
  const setPermalinkVerse = useReaderStore(
    (state) => state.setPermalinkVerse,
  );
  const book = useReaderStore((state) => state.book);
  const chapter = useReaderStore((state) => state.chapter);

  const { toggle: toggleHighlight, remove: removeHighlight, highlightedMap } = useHighlights();
  const selectedSet = new Set(selectedVerseIds);
  const selectedVerses = verses.filter((verse) => selectedSet.has(verse.id));
  const sortedVerses = selectedVerses.toSorted((a, b) => a.verse - b.verse);
  const text = buildShareText(sortedVerses, book, chapter);
  const singleSelectedVerse =
    sortedVerses.length === 1 ? sortedVerses[0] : null;
  const allSelectedHighlighted =
    sortedVerses.length > 0 && sortedVerses.every((verse) => highlightedMap.has(verse.id));

  const handleShare = async () => {
    if (selectedVerses.length === 0) return;

    if (!canNativeShare()) {
      toast("Sharing isn't supported on this device", { variant: "warning" });
      return;
    }

    try {
      await navigator.share({ text });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast("Failed to share verses", { variant: "danger" });
    }
  };

  const handleCopyLink = async () => {
    if (singleSelectedVerse === null) return;

    const link = buildPermalinkUrl(book, chapter, singleSelectedVerse.verse);
    setPermalinkVerse(singleSelectedVerse.verse);

    try {
      await copyToClipboard(link);
      toast("Verse permalink copied", { variant: "success" });
    } catch {
      toast("Failed to copy link", { variant: "danger" });
    }
  };

  const handleToggleHighlight = () => {
    for (const verse of selectedVerses) {
      toggleHighlight(verse, "yellow");
    }
    clearVerseSelection();
  };

  const handleRemoveHighlight = () => {
    for (const verse of selectedVerses) {
      removeHighlight(verse.id);
    }
    toast("Highlight removed", { variant: "success" });
    clearVerseSelection();
  };

  const cols = singleSelectedVerse !== null
    ? (allSelectedHighlighted ? "grid-cols-4" : "grid-cols-3")
    : (allSelectedHighlighted ? "grid-cols-3" : "grid-cols-2");

  return (
    <div className="fixed inset-x-0 bottom-[3.5rem] z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 pointer-events-none" style={{ overscrollBehavior: "contain" }}>
      <Surface className="mx-auto w-full border px-4 py-3 shadow-lg pointer-events-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium tabular-nums">
            {selectedVerseIds.length} selected
          </span>
          <Button variant="tertiary" size="sm" onPress={clearVerseSelection}>
            Clear
          </Button>
        </div>

        <div className={cn("grid", cols, "gap-2")}>
          {singleSelectedVerse !== null && (
            <Tooltip delay={0}>
              <Button variant="tertiary" isIconOnly aria-label="Copy link to verse" className="h-12 w-full rounded-xl" onPress={handleCopyLink}>
                <LinkIcon aria-hidden="true" className="h-5 w-5" />
              </Button>
              <Tooltip.Content placement="top">Copy Link</Tooltip.Content>
            </Tooltip>
          )}
          <Tooltip delay={0}>
            <Button variant="tertiary" isIconOnly aria-label="Share verses" className="h-12 w-full rounded-xl" onPress={handleShare}>
              <ArrowUpFromSquare aria-hidden="true" className="h-5 w-5" />
            </Button>
            <Tooltip.Content placement="top">Share</Tooltip.Content>
          </Tooltip>
          <Tooltip delay={0}>
            <Button
              variant="tertiary"
              isIconOnly
              aria-label="Toggle highlight"
              className="h-12 w-full rounded-xl"
              onPress={handleToggleHighlight}
            >
              <PencilToSquare aria-hidden="true" className="h-5 w-5" />
            </Button>
            <Tooltip.Content placement="top">Highlight</Tooltip.Content>
          </Tooltip>
          {allSelectedHighlighted && (
            <Tooltip delay={0}>
              <Button variant="tertiary" isIconOnly aria-label="Remove highlight" className="h-12 w-full rounded-xl" onPress={handleRemoveHighlight}>
                <TrashBin aria-hidden="true" className="h-5 w-5" />
              </Button>
              <Tooltip.Content placement="top">Remove Highlight</Tooltip.Content>
            </Tooltip>
          )}
        </div>
      </Surface>
    </div>
  );
});

const VerseActionBar = ({ verses }: VerseActionBarProps) => {
  const isSelectionMode = useReaderStore((state) => state.isSelectionMode);

  if (!isSelectionMode) return null;

  return <VerseActionBarInner verses={verses} />;
};

export default VerseActionBar;

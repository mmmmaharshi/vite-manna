import {
  ArrowUpFromSquare,
  Link as LinkIcon,
  PencilToSquare,
  TrashBin,
} from "@gravity-ui/icons";
import { Button, Surface, toast, Tooltip } from "@heroui/react";
import { memo } from "react";

import { getBibleBookName } from "../../../shared/bible";
import type { BibleVerse } from "../../../shared/bible";
import { canNativeShare, copyToClipboard } from "../../../shared/lib/browser";
import { cn } from "../../../shared/lib/cn";
import { useHighlights } from "../../highlights/hooks/use-highlights";
import { useReaderStore } from "../store/reader-store";

interface VerseActionBarProps {
  verses: BibleVerse[];
}

const formatReference = (book: number, chapter: number) =>
  `${getBibleBookName(book)} ${chapter}`;

const buildShareText = (
  verses: BibleVerse[],
  book: number,
  chapter: number
) => {
  const reference = formatReference(book, chapter);

  return verses
    .map((verse) => `${reference}:${verse.verse} ${verse.text}`)
    .join("\n");
};

const buildPermalinkUrl = (book: number, chapter: number, verse: number) => {
  const url = new URL(window.location.href);
  url.searchParams.set("book", String(book));
  url.searchParams.set("chapter", String(chapter));
  url.searchParams.set("verse", String(verse));
  url.hash = "";

  return url.toString();
};

const getSelectionGridCols = (
  hasSingleVerse: boolean,
  allHighlighted: boolean
) => {
  if (allHighlighted) {
    return hasSingleVerse ? "grid-cols-4" : "grid-cols-3";
  }

  return hasSingleVerse ? "grid-cols-3" : "grid-cols-2";
};

const VerseActionBarInnerComponent = ({ verses }: VerseActionBarProps) => {
  const selectedVerseIds = useReaderStore((state) => state.selectedVerseIds);

  const clearVerseSelection = useReaderStore(
    (state) => state.clearVerseSelection
  );

  const setPermalinkVerse = useReaderStore((state) => state.setPermalinkVerse);
  const book = useReaderStore((state) => state.book);
  const chapter = useReaderStore((state) => state.chapter);

  const {
    add: addHighlight,
    remove: removeHighlight,
    highlightedMap,
  } = useHighlights();

  const selectedSet = new Set(selectedVerseIds);

  const selectedVerses = verses
    .filter((verse) => selectedSet.has(verse.id))
    .toSorted((a, b) => a.verse - b.verse);

  const text = buildShareText(selectedVerses, book, chapter);

  const singleSelectedVerse =
    selectedVerses.length === 1 ? selectedVerses[0] : null;

  const allSelectedHighlighted =
    selectedVerses.length > 0 &&
    selectedVerses.every((verse) => highlightedMap.has(verse.id));

  const handleShare = async () => {
    if (selectedVerses.length === 0) {
      return;
    }

    if (!canNativeShare()) {
      toast("Sharing isn't supported on this device", { variant: "warning" });

      return;
    }

    try {
      await navigator.share({ text });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      toast("Failed to share verses", { variant: "danger" });
    }
  };

  const handleCopyLink = async () => {
    if (singleSelectedVerse === null) {
      return;
    }

    const link = buildPermalinkUrl(book, chapter, singleSelectedVerse.verse);
    setPermalinkVerse(singleSelectedVerse.verse);

    try {
      await copyToClipboard(link);
      toast("Verse permalink copied", { variant: "success" });
    } catch {
      toast("Failed to copy link", { variant: "danger" });
    }
  };

  const saveHighlights = async (verseList: BibleVerse[]) => {
    const results = await Promise.all(
      verseList.map((verse) => addHighlight(verse))
    );

    if (results.includes(false)) {
      toast("Failed to save highlight", { variant: "danger" });
    }
  };

  const handleHighlight = () => {
    const toHighlight = selectedVerses.filter(
      (verse) => !highlightedMap.has(verse.id)
    );

    clearVerseSelection();
    void saveHighlights(toHighlight);
  };

  const deleteHighlights = async (verseList: BibleVerse[]) => {
    const results = await Promise.all(
      verseList.map((verse) => removeHighlight(verse.id))
    );

    const failed = results.includes(false);

    toast(failed ? "Failed to remove highlight" : "Highlight removed", {
      variant: failed ? "danger" : "success",
    });
  };

  const handleRemoveHighlight = () => {
    clearVerseSelection();
    void deleteHighlights(selectedVerses);
  };

  const cols = getSelectionGridCols(
    singleSelectedVerse !== null,
    allSelectedHighlighted
  );

  return (
    <div className="pb-bar-safe pointer-events-none fixed inset-x-0 bottom-[3.5rem] z-40 overscroll-contain px-3 pt-3">
      <Surface className="pointer-events-auto mx-auto w-full border px-4 py-3 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
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
              <Button
                variant="tertiary"
                isIconOnly
                aria-label="Copy link to verse"
                className="h-12 w-full rounded-xl"
                onPress={handleCopyLink}
              >
                <LinkIcon aria-hidden="true" className="h-5 w-5" />
              </Button>
              <Tooltip.Content placement="top">Copy Link</Tooltip.Content>
            </Tooltip>
          )}
          <Tooltip delay={0}>
            <Button
              variant="tertiary"
              isIconOnly
              aria-label="Share verses"
              className="h-12 w-full rounded-xl"
              onPress={handleShare}
            >
              <ArrowUpFromSquare aria-hidden="true" className="h-5 w-5" />
            </Button>
            <Tooltip.Content placement="top">Share</Tooltip.Content>
          </Tooltip>
          <Tooltip delay={0}>
            <Button
              variant="tertiary"
              isIconOnly
              aria-label="Highlight"
              className="h-12 w-full rounded-xl"
              onPress={handleHighlight}
            >
              <PencilToSquare aria-hidden="true" className="h-5 w-5" />
            </Button>
            <Tooltip.Content placement="top">Highlight</Tooltip.Content>
          </Tooltip>
          {allSelectedHighlighted && (
            <Tooltip delay={0}>
              <Button
                variant="tertiary"
                isIconOnly
                aria-label="Remove highlight"
                className="h-12 w-full rounded-xl"
                onPress={handleRemoveHighlight}
              >
                <TrashBin aria-hidden="true" className="h-5 w-5" />
              </Button>
              <Tooltip.Content placement="top">
                Remove Highlight
              </Tooltip.Content>
            </Tooltip>
          )}
        </div>
      </Surface>
    </div>
  );
};

const VerseActionBarInner = memo(VerseActionBarInnerComponent);

const VerseActionBar = ({ verses }: VerseActionBarProps) => {
  const isSelectionMode = useReaderStore((state) => state.isSelectionMode);

  if (!isSelectionMode) {
    return null;
  }

  return <VerseActionBarInner verses={verses} />;
};

export default VerseActionBar;

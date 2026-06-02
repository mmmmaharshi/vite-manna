import { ArrowUpFromSquare, Bookmark as BookmarkIcon, BookmarkFill, Copy, Link as LinkIcon, Xmark } from "@gravity-ui/icons";
import { Button, ButtonGroup, Surface, toast, Tooltip } from "@heroui/react";

import { getBibleBookName, type BibleVerse } from "../../../shared/bible";
import { useBookmarks } from "../../bookmarks/hooks/useBookmarks";
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

function buildPermalinkUrl(book: number, chapter: number, verse: number) {
  const url = new URL(window.location.href);
  url.searchParams.set("book", String(book));
  url.searchParams.set("chapter", String(chapter));
  url.searchParams.set("verse", String(verse));
  url.hash = "";
  return url.toString();
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

const VerseActionBarInner = ({ verses }: VerseActionBarProps) => {
  const selectedVerseIds = useReaderStore((state) => state.selectedVerseIds);
  const clearVerseSelection = useReaderStore(
    (state) => state.clearVerseSelection,
  );
  const setPermalinkVerse = useReaderStore(
    (state) => state.setPermalinkVerse,
  );
  const book = useReaderStore((state) => state.book);
  const chapter = useReaderStore((state) => state.chapter);

  const { bookmarkedIds, toggle } = useBookmarks();
  const selectedSet = new Set(selectedVerseIds);
  const selectedVerses = verses.filter((verse) => selectedSet.has(verse.id));
  const text = buildShareText(selectedVerses, book, chapter);
  const singleSelectedVerse =
    selectedVerses.length === 1 ? selectedVerses[0] : null;
  const allSelectedBookmarked = selectedVerses.every((v) => bookmarkedIds.has(v.id));

  const handleCopy = async () => {
    if (selectedVerses.length === 0) {
      return;
    }

    try {
      await copyToClipboard(text);
      toast("Verses copied to clipboard", { variant: "success" });
    } catch {
      toast("Failed to copy verses", { variant: "danger" });
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
      toast("Failed to share verses", { variant: "danger" });
    }
  };

  const handleToggleBookmark = () => {
    for (const verse of selectedVerses) {
      toggle(verse);
    }

    clearVerseSelection();
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

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 pointer-events-none"
    >
      <Surface className="mx-auto flex w-full  items-center gap-2 border px-3 py-2 shadow-lg pointer-events-auto">
        <span className="text-sm font-medium tabular-nums">
          {selectedVerseIds.length} selected
        </span>
        <ButtonGroup className="ml-auto" size="sm" variant="tertiary">
          {singleSelectedVerse !== null && (
            <Tooltip delay={0}>
              <Button
                aria-label="Copy link"
                isIconOnly
                onPress={handleCopyLink}
              >
                <LinkIcon aria-hidden="true" className="h-4 w-4" />
              </Button>
              <Tooltip.Content placement="top">Copy Verse Permalink</Tooltip.Content>
            </Tooltip>
          )}
          <Tooltip delay={0}>
            <Button
              aria-label="Share"
              isIconOnly
              onPress={handleShare}
            >
              <ArrowUpFromSquare aria-hidden="true" className="h-4 w-4" />
              <ButtonGroup.Separator />
            </Button>
            <Tooltip.Content placement="top">Share Verse</Tooltip.Content>
          </Tooltip>
          <Tooltip delay={0}>
            <Button
              aria-label="Copy"
              isIconOnly
              onPress={handleCopy}
            >
              <Copy aria-hidden="true" className="h-4 w-4" />
              <ButtonGroup.Separator />
            </Button>
            <Tooltip.Content placement="top">Copy Verse</Tooltip.Content>
          </Tooltip>
          <Tooltip delay={0}>
            <Button
              aria-label={allSelectedBookmarked ? "Remove bookmark" : "Bookmark"}
              isIconOnly
              onPress={handleToggleBookmark}
            >
              <ButtonGroup.Separator />
              {allSelectedBookmarked
                ? <BookmarkFill aria-hidden="true" className="h-4 w-4" />
                : <BookmarkIcon aria-hidden="true" className="h-4 w-4" />}
            </Button>
            <Tooltip.Content placement="top">
              {allSelectedBookmarked ? "Remove Bookmark" : "Bookmark"}
            </Tooltip.Content>
          </Tooltip>
          <Tooltip delay={0}>
            <Button
              aria-label="Clear selection"
              isIconOnly
              onPress={clearVerseSelection}
            >
              <ButtonGroup.Separator />
              <Xmark aria-hidden="true" className="h-4 w-4" />
            </Button>
            <Tooltip.Content placement="top">Clear Selection</Tooltip.Content>
          </Tooltip>
        </ButtonGroup>
      </Surface>
    </div>
  );
};

const VerseActionBar = ({ verses }: VerseActionBarProps) => {
  const isSelectionMode = useReaderStore((state) => state.isSelectionMode);

  if (!isSelectionMode) {
    return null;
  }

  return <VerseActionBarInner verses={verses} />;
};

export default VerseActionBar;

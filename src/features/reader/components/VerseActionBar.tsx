import { lazy, Suspense, useState } from "react";
import { ArrowUpFromSquare, Bookmark as BookmarkIcon, BookmarkFill, Copy, Link as LinkIcon, Picture } from "@gravity-ui/icons";
import { Button, Surface, toast, Tooltip } from "@heroui/react";

import { cn } from "../../../shared/lib/cn";

import { getBibleBookName, type BibleVerse } from "../../../shared/bible";
import { canNativeShare, copyToClipboard } from "../../../shared/lib/browser";
import { useBookmarks } from "../../bookmarks/hooks/useBookmarks";
import { useReaderStore } from "../store/readerStore";

const VerseImageModal = lazy(() => import("./VerseImageModal"));

interface VerseActionBarProps {
  verses: BibleVerse[];
}

interface ImageModalState {
  verses: { text: string; verse: number }[];
  reference: string;
  teluguText: string;
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

interface VerseActionBarInnerProps extends VerseActionBarProps {
  onShareAsImage: (data: ImageModalState) => void;
}

const VerseActionBarInner = ({ verses, onShareAsImage }: VerseActionBarInnerProps) => {
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
  const sortedVerses = selectedVerses.toSorted((a, b) => a.verse - b.verse);
  const text = buildShareText(sortedVerses, book, chapter);
  const singleSelectedVerse =
    sortedVerses.length === 1 ? sortedVerses[0] : null;
  const allSelectedBookmarked = selectedVerses.every((v) => bookmarkedIds.has(v.id));

  const imageTeluguText = sortedVerses.map((v) => v.text).join("  ");
  const bookName = getBibleBookName(book);
  const imageReference =
    sortedVerses.length === 1
      ? `${bookName} ${chapter}:${sortedVerses[0].verse}`
      : `${bookName} ${chapter}:${sortedVerses[0].verse}-${sortedVerses[sortedVerses.length - 1].verse}`;

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

  const handleShareAsImage = () => {
    if (sortedVerses.length === 0) return;
    onShareAsImage({
      verses: sortedVerses,
      reference: imageReference,
      teluguText: imageTeluguText,
    });
  };

  const handleToggleBookmark = () => {
    for (const verse of selectedVerses) {
      toggle(verse);
    }
    clearVerseSelection();
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

  const cols = singleSelectedVerse !== null ? "grid-cols-3 sm:grid-cols-5" : "grid-cols-3 sm:grid-cols-4";

  return (
    <div
      className="fixed inset-x-0 bottom-[3.5rem] z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 pointer-events-none"
    >
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
              <Button variant="tertiary" isIconOnly className="h-12 w-full rounded-xl" onPress={handleCopyLink}>
                <LinkIcon className="h-5 w-5" />
              </Button>
              <Tooltip.Content placement="top">Copy Link</Tooltip.Content>
            </Tooltip>
          )}
          <Tooltip delay={0}>
            <Button variant="tertiary" isIconOnly className="h-12 w-full rounded-xl" onPress={handleShare}>
              <ArrowUpFromSquare className="h-5 w-5" />
            </Button>
            <Tooltip.Content placement="top">Share</Tooltip.Content>
          </Tooltip>
          <Tooltip delay={0}>
            <Button variant="tertiary" isIconOnly className="h-12 w-full rounded-xl" onPress={handleShareAsImage}>
              <Picture className="h-5 w-5" />
            </Button>
            <Tooltip.Content placement="top">Share as Image</Tooltip.Content>
          </Tooltip>
          <Tooltip delay={0}>
            <Button variant="tertiary" isIconOnly className="h-12 w-full rounded-xl" onPress={handleCopy}>
              <Copy className="h-5 w-5" />
            </Button>
            <Tooltip.Content placement="top">Copy</Tooltip.Content>
          </Tooltip>
          <Tooltip delay={0}>
            <Button variant="tertiary" isIconOnly className="h-12 w-full rounded-xl" onPress={handleToggleBookmark}>
              {allSelectedBookmarked
                ? <BookmarkFill className="h-5 w-5" />
                : <BookmarkIcon className="h-5 w-5" />}
            </Button>
            <Tooltip.Content placement="top">{allSelectedBookmarked ? "Remove Bookmark" : "Bookmark"}</Tooltip.Content>
          </Tooltip>
        </div>
      </Surface>
    </div>
  );
};

const VerseActionBar = ({ verses }: VerseActionBarProps) => {
  const isSelectionMode = useReaderStore((state) => state.isSelectionMode);
  const clearVerseSelection = useReaderStore((state) => state.clearVerseSelection);
  const [imageModalData, setImageModalData] = useState<ImageModalState | null>(null);

  if (!isSelectionMode && !imageModalData) {
    return null;
  }

  return (
    <>
      {isSelectionMode && <VerseActionBarInner verses={verses} onShareAsImage={setImageModalData} />}
      {imageModalData && (
        <Suspense fallback={null}>
          <VerseImageModal
            isOpen={!!imageModalData}
            onOpenChange={(open) => {
              if (!open) {
                setImageModalData(null);
                clearVerseSelection();
              }
            }}
            verses={imageModalData.verses}
            reference={imageModalData.reference}
            teluguText={imageModalData.teluguText}
          />
        </Suspense>
      )}
    </>
  );
};

export default VerseActionBar;

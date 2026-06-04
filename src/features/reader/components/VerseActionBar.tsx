import { lazy, memo, Suspense, useState } from "react";
import { ArrowUpFromSquare, Copy, Link as LinkIcon, Picture, PencilToSquare } from "@gravity-ui/icons";
import { Button, Surface, toast, Tooltip } from "@heroui/react";

import { cn } from "../../../shared/lib/cn";

import { getBibleBookName, HIGHLIGHT_COLORS, type BibleVerse, type HighlightColor } from "../../../shared/bible";
import { canNativeShare, copyToClipboard } from "../../../shared/lib/browser";
import { useHighlights } from "../../highlights/hooks/useHighlights";
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

const COLOR_BG: Record<HighlightColor, string> = {
  yellow: "bg-yellow-300/60 dark:bg-yellow-400/30",
  green: "bg-green-400/50 dark:bg-green-400/25",
  blue: "bg-blue-400/50 dark:bg-blue-400/25",
  pink: "bg-pink-400/40 dark:bg-pink-400/20",
  orange: "bg-orange-400/50 dark:bg-orange-400/25",
};

const COLOR_BORDER: Record<HighlightColor, string> = {
  yellow: "border-yellow-500/60",
  green: "border-green-500/60",
  blue: "border-blue-500/60",
  pink: "border-pink-500/60",
  orange: "border-orange-500/60",
};

const VerseActionBarInner = memo(({ verses, onShareAsImage }: VerseActionBarInnerProps) => {
  const selectedVerseIds = useReaderStore((state) => state.selectedVerseIds);
  const clearVerseSelection = useReaderStore(
    (state) => state.clearVerseSelection,
  );
  const setPermalinkVerse = useReaderStore(
    (state) => state.setPermalinkVerse,
  );
  const book = useReaderStore((state) => state.book);
  const chapter = useReaderStore((state) => state.chapter);

  const { toggle: toggleHighlight } = useHighlights();
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const selectedSet = new Set(selectedVerseIds);
  const selectedVerses = verses.filter((verse) => selectedSet.has(verse.id));
  const sortedVerses = selectedVerses.toSorted((a, b) => a.verse - b.verse);
  const text = buildShareText(sortedVerses, book, chapter);
  const singleSelectedVerse =
    sortedVerses.length === 1 ? sortedVerses[0] : null;

  const imageTeluguText = sortedVerses.map((v) => v.text).join("  ");
  const bookName = getBibleBookName(book);
  const imageReference =
    sortedVerses.length === 1
      ? `${bookName} ${chapter}:${sortedVerses[0].verse}`
      : `${bookName} ${chapter}:${sortedVerses[0].verse}-${sortedVerses[sortedVerses.length - 1].verse}`;

  const handleCopy = async () => {
    if (selectedVerses.length === 0) return;

    try {
      await copyToClipboard(text);
      toast("Verses copied to clipboard", { variant: "success" });
    } catch {
      toast("Failed to copy verses", { variant: "danger" });
    }
  };

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

  const handleShareAsImage = () => {
    if (sortedVerses.length === 0) return;
    onShareAsImage({
      verses: sortedVerses,
      reference: imageReference,
      teluguText: imageTeluguText,
    });
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

  const handlePickColor = (color: HighlightColor) => {
    for (const verse of selectedVerses) {
      toggleHighlight(verse, color);
    }
    setShowHighlightPicker(false);
    clearVerseSelection();
  };

  const cols = singleSelectedVerse !== null ? "grid-cols-3 sm:grid-cols-5" : "grid-cols-3 sm:grid-cols-4";

  return (
    <div className="fixed inset-x-0 bottom-[3.5rem] z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 pointer-events-none">
      <Surface className="mx-auto w-full border px-4 py-3 shadow-lg pointer-events-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium tabular-nums">
            {selectedVerseIds.length} selected
          </span>
          <Button variant="tertiary" size="sm" onPress={clearVerseSelection}>
            Clear
          </Button>
        </div>

        {showHighlightPicker ? (
          <div className="flex flex-col gap-2">
            <span className="text-xs text-muted font-medium">Highlight color</span>
            <div className="flex gap-2 justify-center">
              {HIGHLIGHT_COLORS.map((color) => (
                <Tooltip key={color} delay={0}>
                  <Button
                    isIconOnly
                    variant="ghost"
                    aria-label={`Highlight ${color}`}
                    className={cn("h-10 w-10 rounded-full border-2", COLOR_BG[color], COLOR_BORDER[color])}
                    onPress={() => handlePickColor(color)}
                  />
                  <Tooltip.Content placement="top">{color}</Tooltip.Content>
                </Tooltip>
              ))}
            </div>
            <Button variant="tertiary" size="sm" className="mt-1" onPress={() => setShowHighlightPicker(false)}>
              Back
            </Button>
          </div>
        ) : (
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
              <Button variant="tertiary" isIconOnly aria-label="Share as image" className="h-12 w-full rounded-xl" onPress={handleShareAsImage}>
                <Picture aria-hidden="true" className="h-5 w-5" />
              </Button>
              <Tooltip.Content placement="top">Share as Image</Tooltip.Content>
            </Tooltip>
            <Tooltip delay={0}>
              <Button variant="tertiary" isIconOnly aria-label="Copy verses" className="h-12 w-full rounded-xl" onPress={handleCopy}>
                <Copy aria-hidden="true" className="h-5 w-5" />
              </Button>
              <Tooltip.Content placement="top">Copy</Tooltip.Content>
            </Tooltip>
            <Tooltip delay={0}>
              <Button
                variant="tertiary"
                isIconOnly
                aria-label="Choose highlight color"
                className="h-12 w-full rounded-xl"
                onPress={() => setShowHighlightPicker(true)}
              >
                <PencilToSquare aria-hidden="true" className="h-5 w-5" />
              </Button>
              <Tooltip.Content placement="top">Highlight</Tooltip.Content>
            </Tooltip>
          </div>
        )}
      </Surface>
    </div>
  );
});

const VerseActionBar = ({ verses }: VerseActionBarProps) => {
  const isSelectionMode = useReaderStore((state) => state.isSelectionMode);
  const clearVerseSelection = useReaderStore((state) => state.clearVerseSelection);
  const [imageModalData, setImageModalData] = useState<ImageModalState | null>(null);

  if (!isSelectionMode && !imageModalData) return null;

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

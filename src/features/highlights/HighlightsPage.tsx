import { useState } from "react";
import { Copy, PencilToSquare, TrashBin } from "@gravity-ui/icons";
import {
  AlertDialog,
  Button,
  ScrollShadow,
  Surface,
  toast,
  Tooltip,
  Typography,
} from "@heroui/react";

import {
  getBibleBookName,
  type HighlightColor,
} from "../../shared/bible";
import { copyToClipboard } from "../../shared/lib/browser";
import { useReaderStore } from "../reader/store/readerStore";
import { useHighlights } from "../highlights/hooks/useHighlights";
import type { HighlightEntry } from "../highlights/store/highlightStore";
import { cn } from "../../shared/lib/cn";

interface HighlightsPageProps {
  onNavigateToReader: () => void;
}

function formatRef(book: number, chapter: number, verse: number) {
  return `${getBibleBookName(book)} ${chapter}:${verse}`;
}

const COLOR_STYLES: Record<HighlightColor, string> = {
  yellow: "bg-yellow-200/70 border-yellow-400/40",
  green: "bg-green-200/60 border-green-400/40",
  blue: "bg-blue-200/60 border-blue-400/40",
  pink: "bg-pink-200/50 border-pink-400/40",
  orange: "bg-orange-200/60 border-orange-400/40",
};

const HighlightsPage = ({ onNavigateToReader }: HighlightsPageProps) => {
  const { highlights, remove, loaded } = useHighlights();
  const [pendingRemove, setPendingRemove] = useState<HighlightEntry | null>(null);

  const navigateToVerse = (book: number, chapter: number, verse: number) => {
    const store = useReaderStore.getState();
    store.setBook(book);
    store.setChapter(chapter);
    store.setPermalinkVerse(verse);
    onNavigateToReader();
  };

  const handleRemove = (hl: HighlightEntry) => {
    remove(hl.verseId);
    toast("Highlight removed", { variant: "success" });
  };

  return (
    <main id="main-content" className="h-dvh flex flex-col">
      <Surface className="sticky top-0 z-30 bg-surface py-3 border border-b">
        <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl w-full px-2 mx-auto flex flex-col gap-2">
          <Typography.Heading level={1} className="text-xl">Highlights</Typography.Heading>
        </div>
      </Surface>

      <ScrollShadow hideScrollBar className="flex-1">
        {!loaded ? (
          <section className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl w-full px-2 py-24 mx-auto flex flex-col items-center gap-3" aria-live="polite" aria-busy="true">
            <div className="skeleton-shimmer h-32 w-full max-w-sm rounded-lg" />
            <div className="skeleton-shimmer h-20 w-full max-w-sm rounded-lg" />
            <div className="skeleton-shimmer h-20 w-full max-w-sm rounded-lg" />
          </section>
        ) : loaded && highlights.length === 0 ? (
          <section className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl w-full px-2 py-24 mx-auto flex flex-col items-center gap-4 text-center">
            <PencilToSquare aria-hidden="true" className="h-10 w-10 sm:h-12 sm:w-12 text-muted" />
            <Typography className="text-base font-medium">No highlights yet</Typography>
            <Typography.Paragraph size="sm" color="muted">
              Select a verse and tap the highlight icon to color it
            </Typography.Paragraph>
          </section>
        ) : (
          <section className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl w-full px-2 py-4 mx-auto flex flex-col gap-2" aria-live="polite" aria-atomic="true">
            {highlights.map((hl) => (
              <Surface key={hl.id} className={cn("flex flex-col p-3 gap-2 border-l-4", COLOR_STYLES[hl.color])}>
                <div className="flex items-center gap-2">
                  <button type="button" className="flex-1 min-w-0 text-left" onClick={() => navigateToVerse(hl.book, hl.chapter, hl.verse)}>
                    <Typography className="text-sm font-medium text-accent">
                      {formatRef(hl.book, hl.chapter, hl.verse)}
                    </Typography>
                  </button>
                  <div className="flex gap-0.5 shrink-0">
                    <Tooltip delay={0}>
                      <Button isIconOnly size="sm" variant="tertiary" aria-label="Copy verse"
                        onPress={async () => {
                          try {
                            await copyToClipboard(`${formatRef(hl.book, hl.chapter, hl.verse)} ${hl.text}`);
                            toast("Verse copied to clipboard", { variant: "success" });
                          } catch { toast("Failed to copy verse", { variant: "danger" }); }
                        }}>
                        <Copy aria-hidden="true" className="h-3.5 w-3.5 text-muted" />
                      </Button>
                      <Tooltip.Content placement="top">Copy Verse</Tooltip.Content>
                    </Tooltip>
                    <Tooltip delay={0}>
                      <Button isIconOnly size="sm" variant="tertiary" aria-label="Remove highlight" onPress={() => setPendingRemove(hl)}>
                        <TrashBin aria-hidden="true" className="h-3.5 w-3.5 text-muted" />
                      </Button>
                      <Tooltip.Content placement="top">Remove Highlight</Tooltip.Content>
                    </Tooltip>
                  </div>
                </div>

                <Typography.Paragraph size="sm" color="muted" className="line-clamp-4 sm:line-clamp-3 break-words">
                  {hl.text}
                </Typography.Paragraph>
              </Surface>
            ))}
          </section>
        )}

        <div className="h-[calc(4rem+env(safe-area-inset-bottom))]" />
      </ScrollShadow>

      <AlertDialog.Backdrop isOpen={pendingRemove !== null} onOpenChange={(open) => { if (!open) setPendingRemove(null); }}>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-[400px]">
            {({ close }) => (
              <>
                <AlertDialog.CloseTrigger />
                <AlertDialog.Header>
                  <AlertDialog.Icon status="danger" />
                  <AlertDialog.Heading>Remove highlight?</AlertDialog.Heading>
                </AlertDialog.Header>
                <AlertDialog.Body>
                  <p>Remove highlight for <strong>{pendingRemove ? formatRef(pendingRemove.book, pendingRemove.chapter, pendingRemove.verse) : ""}</strong>?</p>
                </AlertDialog.Body>
                <AlertDialog.Footer>
                  <Button slot="close" variant="tertiary">Cancel</Button>
                  <Button variant="danger" onPress={() => { if (pendingRemove) handleRemove(pendingRemove); close(); }}>
                    <TrashBin aria-hidden="true" className="h-4 w-4" />
                    Remove
                  </Button>
                </AlertDialog.Footer>
              </>
            )}
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </main>
  );
};

export default HighlightsPage;

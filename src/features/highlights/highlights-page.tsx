import { Copy, Star, TrashBin } from "@gravity-ui/icons";
import {
  AlertDialog,
  Button,
  ScrollShadow,
  Surface,
  toast,
  Tooltip,
  Typography,
} from "@heroui/react";
import { useState } from "react";

import type { Highlight } from "../../shared/bible";
import { copyToClipboard } from "../../shared/lib/browser";
import { formatReference } from "../../shared/lib/reference";
import type { VerseRef } from "../../shared/lib/reference";
import { useHighlights } from "../highlights/hooks/use-highlights";
import { useReaderStore } from "../reader/store/reader-store";

interface HighlightsPageProps {
  onNavigateToReader: () => void;
}

const HIGHLIGHT_CARD_CLASSES =
  "flex flex-col gap-2 border-l-4 border-yellow-400/40 bg-yellow-200/70 p-3";

const HighlightsPage = ({ onNavigateToReader }: HighlightsPageProps) => {
  const { error, highlights, remove, loaded } = useHighlights();

  const [pendingRemove, setPendingRemove] = useState<Highlight | null>(null);

  const navigateToVerse = (ref: VerseRef) => {
    useReaderStore.getState().goToVerse(ref);
    onNavigateToReader();
  };

  const handleRemove = async (hl: Highlight) => {
    const removed = await remove(hl.verseId);

    toast(
      removed ? "Highlight removed" : "Failed to remove highlight",
      removed ? { variant: "success" } : { variant: "danger" }
    );
  };

  return (
    <main id="main-content" className="flex h-dvh flex-col">
      <Surface className="bg-surface sticky top-0 z-30 border border-b py-3">
        <div className="page-shell mx-auto flex w-full flex-col gap-2 px-2">
          <Typography.Heading level={1} className="text-xl">
            Highlights
          </Typography.Heading>
        </div>
      </Surface>

      <ScrollShadow hideScrollBar className="flex-1">
        {error !== null && (
          <section
            className="page-shell mx-auto flex w-full flex-col items-center gap-2 px-2 py-24 text-center"
            role="alert"
          >
            <Typography className="text-danger text-base font-medium">
              {error}
            </Typography>
            <Typography.Paragraph size="sm" color="muted">
              Reopen this tab to try again
            </Typography.Paragraph>
          </section>
        )}

        {loaded && highlights.length === 0 && (
          <section className="page-shell mx-auto flex w-full flex-col items-center gap-4 px-2 py-24 text-center">
            <Star
              aria-hidden="true"
              className="text-muted h-10 w-10 sm:h-12 sm:w-12"
            />
            <Typography className="text-base font-medium">
              No highlights yet
            </Typography>
            <Typography.Paragraph size="sm" color="muted">
              Select a verse and tap the highlight icon to highlight it
            </Typography.Paragraph>
          </section>
        )}

        {loaded && highlights.length > 0 && (
          <section
            className="page-shell mx-auto flex w-full flex-col gap-2 px-2 py-4"
            aria-live="polite"
            aria-atomic="true"
          >
            {highlights.map((hl) => (
              <Surface key={hl.verseId} className={HIGHLIGHT_CARD_CLASSES}>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() =>
                      navigateToVerse({
                        book: hl.book,
                        chapter: hl.chapter,
                        verse: hl.verse,
                      })
                    }
                  >
                    <Typography className="text-accent text-sm font-medium">
                      {formatReference(hl.book, hl.chapter, hl.verse)}
                    </Typography>
                  </button>
                  <div className="flex shrink-0 gap-0.5">
                    <Tooltip delay={0}>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="tertiary"
                        aria-label="Copy verse"
                        onPress={async () => {
                          try {
                            await copyToClipboard(
                              `${formatReference(hl.book, hl.chapter, hl.verse)} ${hl.text}`
                            );
                            toast("Verse copied to clipboard", {
                              variant: "success",
                            });
                          } catch {
                            toast("Failed to copy verse", {
                              variant: "danger",
                            });
                          }
                        }}
                      >
                        <Copy
                          aria-hidden="true"
                          className="text-muted h-3.5 w-3.5"
                        />
                      </Button>
                      <Tooltip.Content placement="top">
                        Copy Verse
                      </Tooltip.Content>
                    </Tooltip>
                    <Tooltip delay={0}>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="tertiary"
                        aria-label="Remove highlight"
                        onPress={() => setPendingRemove(hl)}
                      >
                        <TrashBin
                          aria-hidden="true"
                          className="text-muted h-3.5 w-3.5"
                        />
                      </Button>
                      <Tooltip.Content placement="top">
                        Remove Highlight
                      </Tooltip.Content>
                    </Tooltip>
                  </div>
                </div>

                <Typography.Paragraph
                  size="sm"
                  color="muted"
                  className="line-clamp-4 break-words sm:line-clamp-3"
                >
                  {hl.text}
                </Typography.Paragraph>
              </Surface>
            ))}
          </section>
        )}

        {!loaded && error === null && (
          <section
            className="page-shell mx-auto flex w-full flex-col items-center gap-3 px-2 py-24"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="skeleton-shimmer h-32 w-full max-w-sm rounded-lg" />
            <div className="skeleton-shimmer h-20 w-full max-w-sm rounded-lg" />
            <div className="skeleton-shimmer h-20 w-full max-w-sm rounded-lg" />
          </section>
        )}

        <div className="h-[calc(4rem+env(safe-area-inset-bottom))]" />
      </ScrollShadow>

      <AlertDialog.Backdrop
        isOpen={pendingRemove !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingRemove(null);
          }
        }}
      >
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
                  <p>
                    Remove highlight for{" "}
                    <strong>
                      {pendingRemove
                        ? formatReference(
                            pendingRemove.book,
                            pendingRemove.chapter,
                            pendingRemove.verse
                          )
                        : ""}
                    </strong>
                    ?
                  </p>
                </AlertDialog.Body>
                <AlertDialog.Footer>
                  <Button slot="close" variant="tertiary">
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onPress={() => {
                      if (pendingRemove) {
                        void handleRemove(pendingRemove);
                      }

                      close();
                    }}
                  >
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

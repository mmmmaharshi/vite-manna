import { useEffect } from "react";
import { ArrowUpFromSquare, Sparkles } from "@gravity-ui/icons";
import { Button, Modal, Spinner, toast, Typography } from "@heroui/react";

import { useDailyVerse } from "../hooks/useDailyVerse";

interface DailyVerseModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToChapter: (book: number, chapter: number) => void;
}

const DailyVerseModal = ({
  isOpen,
  onOpenChange,
  onNavigateToChapter,
}: DailyVerseModalProps) => {
  const { isLoading, teluguText, reference, book, chapter, isFirstOpenToday, markDailyVerseShown } =
    useDailyVerse();

  useEffect(() => {
    if (!isFirstOpenToday || isLoading) return;
    onOpenChange(true);
    markDailyVerseShown();
  }, [isFirstOpenToday, isLoading, onOpenChange, markDailyVerseShown]);

  const canNavigate = book !== null && chapter !== null;
  const handleShare = async () => {
    if (!teluguText) return;
    if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
      toast("Sharing isn't supported on this device", { variant: "warning" });
      return;
    }
    try {
      await navigator.share({ text: `${teluguText}\n— ${reference}` });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      toast("Failed to share verse", { variant: "danger" });
    }
  };

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container size="sm">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Icon className="bg-default text-foreground">
                <Sparkles className="size-5" />
              </Modal.Icon>
              <Modal.Heading>Verse of the Day</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner size="lg" aria-label="Loading verse" />
                </div>
              ) : teluguText ? (
                <div>
                  <Typography className="text-base leading-relaxed">
                    {teluguText}
                  </Typography>
                  <Typography.Paragraph
                    size="sm"
                    color="muted"
                    className="mt-3"
                  >
                    — {reference}
                  </Typography.Paragraph>
                </div>
              ) : (
                <Typography.Paragraph color="muted">
                  {reference}
                </Typography.Paragraph>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button isIconOnly variant="tertiary" aria-label="Share" onPress={handleShare}>
                <ArrowUpFromSquare className="h-4 w-4" />
              </Button>
              <Button slot="close" variant="secondary">
                Close
              </Button>
              {canNavigate && (
                <Button
                  onPress={() => {
                    onNavigateToChapter(book!, chapter!);
                    onOpenChange(false);
                  }}
                >
                  Read Chapter
                </Button>
              )}
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default DailyVerseModal;

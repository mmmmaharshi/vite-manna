import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpFromSquare, FileArrowDown } from "@gravity-ui/icons";
import { Button, Modal, toast } from "@heroui/react";

import VerseImageCard from "./VerseImageCard";
import { useVerseImage, CARD_WIDTH, CARD_HEIGHT } from "../hooks/useVerseImage";

interface VerseImageModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  verses: { text: string; verse: number }[];
  reference: string;
  teluguText: string;
}

const VerseImageModal = ({
  isOpen,
  onOpenChange,
  verses,
  reference,
  teluguText,
}: VerseImageModalProps) => {
  const { captureRef, shareAsImage, downloadAsImage, isGenerating } = useVerseImage();
  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(el.clientWidth / CARD_WIDTH, 1));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOpen]);

  const today = new Date().toISOString().slice(0, 10);

  const handleShare = useCallback(async () => {
    try {
      await shareAsImage(`manna-${reference.replace(/[^a-zA-Z0-9]/g, "-")}-${today}.png`);
      toast("Verse image shared", { variant: "success" });
    } catch {
      toast("Failed to share image", { variant: "danger" });
    }
  }, [reference, shareAsImage, today]);

  const handleDownload = useCallback(async () => {
    try {
      await downloadAsImage(`manna-${reference.replace(/[^a-zA-Z0-9]/g, "-")}-${today}.png`);
    } catch {
      toast("Failed to download image", { variant: "danger" });
    }
  }, [reference, downloadAsImage, today]);

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container size="sm">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Share Image</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col items-center gap-6">
                <div ref={previewRef} className="w-full max-w-[500px] rounded-xl overflow-hidden shadow-xl" style={{ aspectRatio: `${CARD_WIDTH}/${CARD_HEIGHT}` }}>
                  <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: CARD_WIDTH, height: CARD_HEIGHT }}>
                    <VerseImageCard
                      verses={verses}
                      reference={reference}
                      teluguText={teluguText}
                    />
                  </div>
                </div>

                <div className="fixed -left-[9999px] top-0" aria-hidden="true">
                  <VerseImageCard
                    ref={captureRef}
                    verses={verses}
                    reference={reference}
                    teluguText={teluguText}
                  />
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" isDisabled={isGenerating} onPress={handleShare}>
                <ArrowUpFromSquare className="h-4 w-4" />
                Share
              </Button>
              <Button variant="secondary" isDisabled={isGenerating} onPress={handleDownload}>
                <FileArrowDown className="h-4 w-4" />
                Download
              </Button>
              <Button slot="close" variant="tertiary">Cancel</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default VerseImageModal;

import { format } from "date-fns";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpFromSquare, FileArrowDown } from "@gravity-ui/icons";
import { Button, Modal, toast } from "@heroui/react";

import VerseImageCard from "./VerseImageCard";
import { useVerseImage, RATIOS, type ImageRatio } from "../hooks/useVerseImage";

interface VerseImageModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  verses: { text: string; verse: number }[];
  reference: string;
  teluguText: string;
}

const RATIO_OPTIONS: { key: ImageRatio; label: string }[] = [
  { key: "landscape", label: "Landscape" },
  { key: "square", label: "Square" },
  { key: "portrait", label: "Story" },
];

const VerseImageModal = ({
  isOpen,
  onOpenChange,
  verses,
  reference,
  teluguText,
}: VerseImageModalProps) => {
  const { captureRef, shareAsImage, downloadAsImage, isGenerating } = useVerseImage();
  const previewRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState<ImageRatio>("landscape");
  const [scale, setScale] = useState(1);

  const { width: cardW, height: cardH } = RATIOS[ratio];

  useLayoutEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(el.clientWidth / cardW, 1));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOpen, cardW]);

  const today = format(new Date(), "yyyy-MM-dd");

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
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-2">
                  {RATIO_OPTIONS.map((opt) => (
                    <Button
                      key={opt.key}
                      variant={ratio === opt.key ? "primary" : "ghost"}
                      size="sm"
                      onPress={() => setRatio(opt.key)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>

                <div ref={previewRef} className="w-full sm:max-w-[500px] rounded-xl overflow-hidden shadow-xl" style={{ aspectRatio: `${cardW}/${cardH}` }}>
                  <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: cardW, height: cardH }}>
                    <VerseImageCard
                      verses={verses}
                      reference={reference}
                      teluguText={teluguText}
                      ratio={ratio}
                    />
                  </div>
                </div>

                <div className="absolute -left-[9999px] top-0" aria-hidden="true">
                  <VerseImageCard
                    ref={captureRef}
                    verses={verses}
                    reference={reference}
                    teluguText={teluguText}
                    ratio={ratio}
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

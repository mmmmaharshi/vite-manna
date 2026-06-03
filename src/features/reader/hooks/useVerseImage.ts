import { useCallback, useRef, useState } from "react";
import { toBlob } from "html-to-image";

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function useVerseImage() {
  const captureRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateBlob = useCallback(async () => {
    const node = captureRef.current;
    if (!node) throw new Error("Card not rendered");
    setIsGenerating(true);
    try {
      const blob = await toBlob(node, { cacheBust: true });
      if (!blob) throw new Error("Failed to generate image");
      return blob;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const shareAsImage = useCallback(async (filename = "manna-verse.png") => {
    const blob = await generateBlob();
    const file = new File([blob], filename, { type: "image/png" });

    if (typeof navigator !== "undefined" && typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "Manna Verse" });
    } else {
      throw new Error("Native sharing not available on this device");
    }
  }, [generateBlob]);

  const downloadAsImage = useCallback(async (filename = "manna-verse.png") => {
    const blob = await generateBlob();
    downloadBlob(blob, filename);
  }, [generateBlob]);

  return { captureRef, shareAsImage, downloadAsImage, isGenerating };
}

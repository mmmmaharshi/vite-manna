import type { RefObject } from "react";
import { Button, ScrollShadow } from "@heroui/react";

interface ChapterStripProps {
  activeChapterRef: RefObject<HTMLButtonElement | null>;
  chapterStripRef: RefObject<HTMLDivElement | null>;
  chapters: number[];
  onScroll: () => void;
  onSelectChapter: (chapter: number) => void;
  visibleChapter: number;
}

const ChapterStrip = ({
  activeChapterRef,
  chapterStripRef,
  chapters,
  onScroll,
  onSelectChapter,
  visibleChapter,
}: ChapterStripProps) => {
  if (chapters.length === 0) {
    return null;
  }

  return (
    <ScrollShadow
      ref={chapterStripRef}
      hideScrollBar
      orientation="horizontal"
      onScroll={onScroll}
    >
      <div className="flex gap-2 py-1">
        {chapters.map((chapterNumber) => (
          <Button
            ref={
              visibleChapter === chapterNumber ? activeChapterRef : null
            }
            key={chapterNumber}
            size="md"
            variant={
              visibleChapter === chapterNumber ? "primary" : "secondary"
            }
            onPress={() => onSelectChapter(chapterNumber)}
          >
            {chapterNumber}
          </Button>
        ))}
      </div>
    </ScrollShadow>
  );
};

export default ChapterStrip;

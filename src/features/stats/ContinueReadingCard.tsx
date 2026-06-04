import { useEffect, useState } from "react";
import { ArrowRotateRight } from "@gravity-ui/icons";

import { getBibleBookName, getLastReadChapter } from "../../shared/bible";
import { useReaderStore } from "../reader/store/readerStore";
import { Button, Surface, Typography } from "@heroui/react";

interface ContinueReadingCardProps {
  onNavigate: () => void;
}

export const ContinueReadingCard = ({ onNavigate }: ContinueReadingCardProps) => {
  const [lastRead, setLastRead] = useState<{ book: number; chapter: number } | null>(null);

  useEffect(() => {
    getLastReadChapter().then((entry) => {
      if (entry) setLastRead({ book: entry.book, chapter: entry.chapter });
    });
  }, []);

  if (!lastRead) return null;
  const bookName = getBibleBookName(lastRead.book);

  const handleContinue = () => {
    useReaderStore.getState().setBook(lastRead.book);
    useReaderStore.getState().setChapter(lastRead.chapter);
    onNavigate();
  };

  return (
    <Surface className="p-3">
      <Typography className="text-sm font-medium mb-1">Continue Reading</Typography>
      <Typography className="text-xs text-muted mb-2">
        {bookName} {lastRead.chapter}
      </Typography>
      <Button size="sm" onPress={handleContinue}>
        <ArrowRotateRight aria-hidden="true" className="h-4 w-4" />
        Continue
      </Button>
    </Surface>
  );
};

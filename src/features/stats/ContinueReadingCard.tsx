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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getLastReadChapter().then((entry) => {
      if (entry) setLastRead({ book: entry.book, chapter: entry.chapter });
      setLoaded(true);
    });
  }, []);

  if (!loaded) {
    return (
      <Surface className="p-3">
        <div className="skeleton-shimmer h-5 w-40 rounded mb-2" />
        <div className="skeleton-shimmer h-8 w-24 rounded" />
      </Surface>
    );
  }

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

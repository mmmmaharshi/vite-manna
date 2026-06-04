import { useEffect, useState } from "react";

import { getReadingStreak } from "../../shared/bible";
import { Surface, Typography } from "@heroui/react";

export const StreakCard = () => {
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    getReadingStreak().then(setStreak);
  }, []);

  if (streak === null) {
    return (
      <Surface className="p-3">
        <div className="skeleton-shimmer h-5 w-32 rounded" />
      </Surface>
    );
  }

  if (streak === 0) return null;

  return (
    <Surface className="p-3 flex items-center gap-3">
      <span className="text-2xl" aria-hidden="true">🔥</span>
      <div>
        <Typography className="text-lg font-bold">{streak}-day streak</Typography>
        <Typography className="text-xs text-muted">
          {streak === 1 ? "Read yesterday to keep it going" : "Keep reading daily to maintain it"}
        </Typography>
      </div>
    </Surface>
  );
};

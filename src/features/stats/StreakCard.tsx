import { useEffect, useState } from "react";

import { getReadingStreak } from "../../shared/bible";
import { Surface, Typography } from "@heroui/react";

export const StreakCard = () => {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    getReadingStreak().then(setStreak);
  }, []);

  if (streak === 0) return null;

  return (
    <Surface className="p-3 flex items-center gap-3">
      <span className="text-2xl">🔥</span>
      <div>
        <Typography className="text-lg font-bold">{streak}-day streak</Typography>
        <Typography className="text-xs text-muted">
          {streak === 1 ? "Read yesterday to keep it going" : "Keep reading daily to maintain it"}
        </Typography>
      </div>
    </Surface>
  );
};

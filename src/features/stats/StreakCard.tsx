import { useEffect, useState } from "react";

import { getReadingStreak, type ReadingStreak } from "../../shared/bible";
import { Surface, Typography } from "@heroui/react";

export const StreakCard = () => {
  const [data, setData] = useState<ReadingStreak | null>(null);

  useEffect(() => {
    getReadingStreak().then(setData);
  }, []);

  if (data === null) {
    return (
      <Surface className="p-3">
        <div className="skeleton-shimmer h-5 w-32 rounded" />
      </Surface>
    );
  }

  if (data.count === 0) {
    return (
      <Surface className="p-3 flex items-center gap-3">
        <span className="text-2xl" aria-hidden="true">🔥</span>
        <div>
          <Typography className="text-lg font-bold">No streak yet</Typography>
          <Typography className="text-xs text-muted">
            Read a chapter today to start your streak
          </Typography>
        </div>
      </Surface>
    );
  }

  return (
    <Surface className="p-3 flex items-center gap-3">
      <span className="text-2xl" aria-hidden="true">🔥</span>
      <div>
        <Typography className="text-lg font-bold">{data.count}-day streak</Typography>
        <Typography className="text-xs text-muted">
          {data.readToday ? "Read again tomorrow to keep it going" : "Read today to keep it going"}
        </Typography>
      </div>
    </Surface>
  );
};

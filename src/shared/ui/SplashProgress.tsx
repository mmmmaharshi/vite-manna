import { clamp } from "es-toolkit";
import { memo, useState } from "react";

import { cn } from "../lib/cn";

const TRACK_WIDTH = 160;
const TRACK_HEIGHT = 4;
const INDETERMINATE_WIDTH = TRACK_WIDTH * 0.35;
const INDETERMINATE_DURATION_MS = 1_150;

const getInitialAnimationDelay = () => {
  if (typeof performance === "undefined") {
    return "0ms";
  }

  return `-${performance.now() % INDETERMINATE_DURATION_MS}ms`;
};

interface SplashProgressProps {
  value?: number | null;
}

const SplashProgress = ({ value }: SplashProgressProps) => {
  const [animationDelay] = useState(getInitialAnimationDelay);
  const normalizedValue =
    typeof value === "number" ? clamp(value, 0, 100) : null;
  const progressWidth =
    normalizedValue === null
      ? INDETERMINATE_WIDTH
      : (TRACK_WIDTH * normalizedValue) / 100;

  return (
    <svg
      className="splash-progress mt-4"
      width={TRACK_WIDTH}
      height={TRACK_HEIGHT}
      viewBox={`0 0 ${TRACK_WIDTH} ${TRACK_HEIGHT}`}
      role="progressbar"
      aria-label="Loading Bible"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={normalizedValue ?? undefined}
    >
      <rect
        width={TRACK_WIDTH}
        height={TRACK_HEIGHT}
        rx={2}
        fill="currentColor"
        opacity={0.14}
      />
      <rect
        className={cn(
          "splash-progress__bar",
          normalizedValue !== null && "splash-progress__bar--determinate",
        )}
        style={
          normalizedValue === null
            ? { animationDelay }
            : { transition: "width 180ms ease-out" }
        }
        x={0}
        width={progressWidth}
        height={TRACK_HEIGHT}
        rx={2}
        fill="currentColor"
      />
    </svg>
  );
};

export default memo(SplashProgress);

import { clamp } from "es-toolkit";
import { memo } from "react";
import type { CSSProperties } from "react";

import { cn } from "../lib/cn";

const TRACK_WIDTH = 160;
const TRACK_HEIGHT = 4;
const INDETERMINATE_WIDTH = TRACK_WIDTH * 0.35;
const INDETERMINATE_DURATION_MS = 1150;

const getInitialAnimationDelay = () => {
  if (typeof performance === "undefined") {
    return "0ms";
  }

  return `-${performance.now() % INDETERMINATE_DURATION_MS}ms`;
};

// Computed once at module load so every mount shares the same animation phase.
const INITIAL_ANIMATION_DELAY = getInitialAnimationDelay();

// The phase rides in a custom property so no inline style carries a raw value.
const INDETERMINATE_STYLE: CSSProperties & { "--splash-delay": string } = {
  "--splash-delay": INITIAL_ANIMATION_DELAY,
};

interface SplashProgressProps {
  value?: number | null;
}

const SplashProgress = ({ value }: SplashProgressProps) => {
  const normalizedValue =
    value === null || value === undefined ? null : clamp(value, 0, 100);

  const progressWidth =
    normalizedValue === null
      ? INDETERMINATE_WIDTH
      : (TRACK_WIDTH * normalizedValue) / 100;

  return (
    <>
      <progress
        className="sr-only"
        max={100}
        value={normalizedValue ?? undefined}
        aria-label="Loading Bible"
      />
      <svg
        className="splash-progress mt-4"
        width={TRACK_WIDTH}
        height={TRACK_HEIGHT}
        viewBox={`0 0 ${TRACK_WIDTH} ${TRACK_HEIGHT}`}
        aria-hidden="true"
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
            normalizedValue !== null && "splash-progress__bar--determinate"
          )}
          style={INDETERMINATE_STYLE}
          x={0}
          width={progressWidth}
          height={TRACK_HEIGHT}
          rx={2}
          fill="currentColor"
        />
      </svg>
    </>
  );
};

export default memo(SplashProgress);

import { memo } from "react";
import type { CSSProperties } from "react";

import { cn } from "../lib/cn";
import { SPLASH_TRACK } from "./splash-geometry";

const INDETERMINATE_WIDTH = SPLASH_TRACK.width * 0.35;

const getInitialAnimationDelay = () => {
  if (typeof performance === "undefined") {
    return "0ms";
  }

  return `-${performance.now() % SPLASH_TRACK.durationMs}ms`;
};

const INITIAL_ANIMATION_DELAY = getInitialAnimationDelay();

const INDETERMINATE_STYLE: CSSProperties & { "--splash-delay": string } = {
  "--splash-delay": INITIAL_ANIMATION_DELAY,
};

interface SplashProgressProps {
  value?: number | null;
}

const SplashProgress = ({ value }: SplashProgressProps) => {
  const normalizedValue =
    value === null || value === undefined
      ? null
      : Math.min(Math.max(value, 0), 100);

  const progressWidth =
    normalizedValue === null
      ? INDETERMINATE_WIDTH
      : (SPLASH_TRACK.width * normalizedValue) / 100;

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
        width={SPLASH_TRACK.width}
        height={SPLASH_TRACK.height}
        viewBox={`0 0 ${SPLASH_TRACK.width} ${SPLASH_TRACK.height}`}
        aria-hidden="true"
      >
        <rect
          width={SPLASH_TRACK.width}
          height={SPLASH_TRACK.height}
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
          height={SPLASH_TRACK.height}
          rx={2}
          fill="currentColor"
        />
      </svg>
    </>
  );
};

export default memo(SplashProgress);

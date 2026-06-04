import { memo } from "react";
import { Button } from "@heroui/react";

import SplashFrame from "./SplashFrame";
import SplashProgress from "./SplashProgress";

interface SplashViewProps {
  error?: string | null;
  message?: string;
  onRetry?: () => void;
  progress?: number | null;
}

const SplashView = ({
  error,
  message = "Preparing Manna...",
  onRetry,
  progress,
}: SplashViewProps) => (
  <SplashFrame>
    <SplashProgress value={progress} />

    <p className="mt-3 min-h-5 text-center text-sm text-muted">
      {error ? "Setup paused" : message}
    </p>

    {error ? (
      <div className="flex flex-col items-center gap-2 mt-2">
        <p className="text-danger text-center text-sm">{error}</p>

        {onRetry && (
          <Button variant="primary" size="sm" onPress={onRetry}>
            Retry
          </Button>
        )}
      </div>
    ) : null}
  </SplashFrame>
);

export default memo(SplashView);

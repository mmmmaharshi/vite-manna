import { Button } from "@heroui/react";
import { memo } from "react";

import SplashFrame from "./splash-frame";
import SplashProgress from "./splash-progress";

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

    <p className="text-muted mt-3 min-h-5 text-center text-sm">
      {error ? "Setup paused" : message}
    </p>

    {error ? (
      <div className="mt-2 flex flex-col items-center gap-2">
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

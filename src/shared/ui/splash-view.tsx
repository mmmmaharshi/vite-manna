import { Button } from "@heroui/react";
import { memo } from "react";

import IconSVG from "../../assets/icon";
import SplashProgress from "./splash-progress";

interface SplashViewProps {
  error?: string | null;
  message?: string;
  onRetry?: () => void;
  progress?: number | null;
}

/** The loading message shown before the app boots, mirrored in index.html. */
export const SPLASH_DEFAULT_MESSAGE = "Preparing Manna...";

const SplashView = ({
  error,
  message = SPLASH_DEFAULT_MESSAGE,
  onRetry,
  progress,
}: SplashViewProps) => (
  <main className="container mx-auto flex h-svh w-full max-w-md items-center justify-center px-6 sm:max-w-lg md:max-w-xl">
    <div className="flex w-full flex-col items-center justify-center">
      <IconSVG width={120} height={120} aria-hidden="true" />

      <h1 className="text-4xl font-black">Manna</h1>

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
    </div>
  </main>
);

export default memo(SplashView);

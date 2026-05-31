import { Button, ProgressBar, Typography } from "@heroui/react";

import IconSVG from "../assets/icon";

interface SplashViewProps {
  error?: string | null;
  onRetry?: () => void;
  progress?: number;
}

const SplashView = ({ error, onRetry, progress }: SplashViewProps) => (
  <main className="h-svh w-full container mx-auto max-w-sm flex items-center justify-center px-6">
    <div className="flex flex-col items-center justify-center w-full">
      <IconSVG width={120} height={120} />

      <Typography.Heading level={1} className="font-black text-4xl">
        Manna
      </Typography.Heading>

      <ProgressBar
        isIndeterminate={progress === undefined}
        value={progress}
        maxValue={100}
        className="w-40 mt-4"
        aria-label="Loading Bible"
      >
        <ProgressBar.Track>
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>

      {error && (
        <div className="flex flex-col items-center gap-2 mt-3">
          <Typography className="text-danger text-center text-sm">
            {error}
          </Typography>

          {onRetry && (
            <Button size="sm" onPress={onRetry}>
              Retry
            </Button>
          )}
        </div>
      )}
    </div>
  </main>
);

export default SplashView;

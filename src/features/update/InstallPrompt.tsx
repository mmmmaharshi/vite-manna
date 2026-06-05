import { Button, CloseButton, Surface } from "@heroui/react";

import { useInstallPrompt } from "./useInstallPrompt";

const InstallPrompt = () => {
  const { isInstallable, install, dismiss } = useInstallPrompt();

  if (!isInstallable) return null;

  return (
    <Surface className="max-w-md mx-auto backdrop-blur-lg rounded-xl border border-border p-4 shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">Install Manna</p>
          <p className="text-xs text-muted">Add to your home screen for quick access</p>
        </div>
        <CloseButton aria-label="Dismiss" onPress={dismiss} />
      </div>
      <Button className="mt-3" size="sm" variant="primary" onPress={install}>
        Install
      </Button>
    </Surface>
  );
};

export default InstallPrompt;

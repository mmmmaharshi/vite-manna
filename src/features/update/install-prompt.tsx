import { Button, CloseButton, Surface } from "@heroui/react";

import { useInstallPrompt } from "./use-install-prompt";

const InstallPrompt = () => {
  const { isInstallable, install, dismiss } = useInstallPrompt();

  if (!isInstallable) {
    return null;
  }

  return (
    <Surface className="border-border mx-auto max-w-md rounded-xl border p-4 shadow-xl backdrop-blur-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">Install Manna</p>
          <p className="text-muted text-xs">
            Add to your home screen for quick access
          </p>
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

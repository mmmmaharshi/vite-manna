import { Button, CloseButton, Surface } from "@heroui/react";
import { useCallback } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

const UpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const handleUpdate = useCallback(() => {
    void updateServiceWorker();
  }, [updateServiceWorker]);

  const handleDismiss = useCallback(() => {
    setNeedRefresh(false);
  }, [setNeedRefresh]);

  if (!needRefresh) {
    return null;
  }

  return (
    <Surface className="border-border mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-lg">
      <p className="text-sm">New version available</p>
      <div className="flex items-center gap-1">
        <Button size="sm" variant="primary" onPress={handleUpdate}>
          Update
        </Button>
        <CloseButton aria-label="Dismiss" onPress={handleDismiss} />
      </div>
    </Surface>
  );
};

export default UpdatePrompt;

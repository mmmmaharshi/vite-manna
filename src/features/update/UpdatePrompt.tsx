import { useCallback } from "react";
import { Button, CloseButton, Surface } from "@heroui/react";
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

  if (!needRefresh) return null;

  return (
    <Surface className="max-w-md mx-auto backdrop-blur-lg rounded-xl border border-border p-4 flex items-center justify-between gap-3 shadow-xl">
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

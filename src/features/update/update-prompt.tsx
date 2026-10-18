import { Button, CloseButton, Surface } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

const UpdatePrompt = () => {
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, nextRegistration) {
      setRegistration(nextRegistration ?? null);
    },
  });

  // The browser only looks for a new worker on a navigation, and an installed
  // app is usually resumed rather than navigated, so ask for a check ourselves
  // whenever the app opens or comes back to the foreground.
  useEffect(() => {
    if (registration === null) {
      return;
    }

    const checkForUpdate = () => {
      if (document.visibilityState === "visible") {
        void registration.update();
      }
    };

    checkForUpdate();
    document.addEventListener("visibilitychange", checkForUpdate);

    return () =>
      document.removeEventListener("visibilitychange", checkForUpdate);
  }, [registration]);

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

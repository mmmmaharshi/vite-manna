import { useLocalStorage } from "@reactuses/core";
import { useCallback, useEffect, useState } from "react";

const DISMISS_KEY = "pwa-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const isBeforeInstallPromptEvent = (
  event: Event
): event is BeforeInstallPromptEvent =>
  "prompt" in event && "userChoice" in event;

export const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [dismissed, setDismissed] = useLocalStorage(DISMISS_KEY, false);

  const isStandalone =
    typeof window !== "undefined" &&
    window.matchMedia("(display-mode: standalone)").matches;

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();

      if (isBeforeInstallPromptEvent(event)) {
        setDeferredPrompt(event);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    setDismissed(true);
  }, [setDismissed]);

  const isInstallable = !isStandalone && !dismissed && deferredPrompt !== null;

  return { dismiss, install, isInstallable };
};

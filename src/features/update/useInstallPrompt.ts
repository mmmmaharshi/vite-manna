import { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "@reactuses/core";

const DISMISS_KEY = "pwa-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useLocalStorage(DISMISS_KEY, false);
  const isStandalone = typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches;

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = useCallback(() => {
    if (!deferredPrompt) return;

    void deferredPrompt.prompt();
    void deferredPrompt.userChoice.then(({ outcome }) => {
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    });
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    setDismissed(true);
  }, [setDismissed]);

  const isInstallable = !isStandalone && !dismissed && deferredPrompt !== null;

  return { isInstallable, install, dismiss };
}

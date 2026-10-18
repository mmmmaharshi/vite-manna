import { delay } from "es-toolkit";

const RETRY_INTERVAL_MS = 2000;

const isAppShellCached = async () => {
  try {
    return Boolean(await caches.match("/index.html"));
  } catch {
    return false;
  }
};

const waitForAppShellCache = async (): Promise<void> => {
  if (await isAppShellCached()) {
    return;
  }

  await delay(RETRY_INTERVAL_MS);
  await waitForAppShellCache();
};

export const waitForOfflineReadiness = async () => {
  if (
    !import.meta.env.PROD ||
    !("serviceWorker" in navigator) ||
    !("caches" in window)
  ) {
    return;
  }

  try {
    await navigator.serviceWorker.ready;
  } catch {
    return;
  }

  await waitForAppShellCache();
};

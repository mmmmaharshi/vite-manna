const RETRY_INTERVAL_MS = 2_000;

async function isAppShellCached() {
  try {
    return Boolean(await caches.match("/index.html"));
  } catch {
    return false;
  }
}

export async function waitForOfflineReadiness() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator) || !("caches" in window)) {
    return;
  }

  try {
    await navigator.serviceWorker.ready;
  } catch {
    return;
  }

  while (!(await isAppShellCached())) {
    await new Promise((r) => setTimeout(r, RETRY_INTERVAL_MS));
  }
}

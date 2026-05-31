const OFFLINE_READY_TIMEOUT_MS = 8_000;
const REQUIRED_CACHE_URLS = ["/", "/bible.json"];

function wait(timeoutMs: number) {
  return new Promise<false>((resolve) => {
    setTimeout(() => resolve(false), timeoutMs);
  });
}

async function hasRequiredCacheEntries() {
  const matches = await Promise.all(
    REQUIRED_CACHE_URLS.map((url) => caches.match(url)),
  );

  return matches.every(Boolean);
}

export async function waitForOfflineReadiness() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator) || !("caches" in window)) {
    return true;
  }

  return Promise.race([
    navigator.serviceWorker.ready.then(hasRequiredCacheEntries),
    wait(OFFLINE_READY_TIMEOUT_MS),
  ]);
}

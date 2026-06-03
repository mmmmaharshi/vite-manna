const REQUIRED_CACHE_URLS = ["/index.html", "/bible.json"];
const CACHE_CHECK_INTERVAL_MS = 1000;

function waitForNextCacheCheck() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, CACHE_CHECK_INTERVAL_MS);
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

  await navigator.serviceWorker.ready;

  while (!(await hasRequiredCacheEntries())) {
    await waitForNextCacheCheck();
  }

  return true;
}

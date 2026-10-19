import { ExpirationPlugin } from "workbox-expiration";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

// Otherwise every release keeps its own hashed files in the precache forever.
cleanupOutdatedCaches();

// Take over as soon as this worker is installed. Waiting for a tap left
// installed apps pinned to the previous release's precached index.html.
self.addEventListener("install", () => {
  void self.skipWaiting();
});

self.addEventListener("activate", () => {
  void self.clients.claim();
});

registerRoute(
  /bible\.json$/u,
  new CacheFirst({
    cacheName: "bible-data",
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 1,
      }),
    ],
  })
);

self.addEventListener("message", (event: ExtendableMessageEvent) => {
  if (event.data?.type === "SKIP_WAITING") {
    void self.skipWaiting();
  }
});

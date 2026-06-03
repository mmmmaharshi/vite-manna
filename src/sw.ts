import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

import { BIBLE_BOOK_NAMES } from "./shared/bible/books";
import {
  DAILY_VERSE_REFS,
  getDayOfYear,
  parseVerseref,
} from "./shared/bible/dailyVerseData";

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("activate", () => {
  self.clients.claim();
});

registerRoute(
  /bible\.json$/,
  new CacheFirst({
    cacheName: "bible-data",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 1,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
    ],
  }),
);

self.addEventListener("message", (event: Event) => {
  const msgEvent = event as ExtendableMessageEvent;
  if (msgEvent.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("periodicsync", (event: Event) => {
  const syncEvent = event as ExtendableEvent & { tag: string };
  if (syncEvent.tag !== "daily-verse") return;
  syncEvent.waitUntil(showDailyVerseNotification());
});

async function showDailyVerseNotification() {
  const dayOfYear = getDayOfYear();
  const ref = DAILY_VERSE_REFS[(dayOfYear - 1) % DAILY_VERSE_REFS.length];
  const parsed = parseVerseref(ref);

  let title = "Verse of the Day";
  let body = "Tap to read today's verse";

  if (
    parsed.book !== null &&
    parsed.chapter !== null &&
    parsed.verse !== null
  ) {
    try {
      const text = await lookupVerseText(parsed.book, parsed.chapter, parsed.verse);
      const bookName = BIBLE_BOOK_NAMES[parsed.book - 1] ?? "";
      if (text) {
        title = `${bookName} ${parsed.chapter}:${parsed.verse}`;
        body = text;
      }
    } catch {
      // fall through to default message
    }
  }

  await self.registration.showNotification(title, {
    body,
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    tag: "daily-verse",
    data: { book: parsed.book, chapter: parsed.chapter, verse: parsed.verse },
  });
}

self.addEventListener("notificationclick", (event: Event) => {
  const notifEvent = event as NotificationEvent;
  notifEvent.notification.close();
  notifEvent.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return self.clients.openWindow("/");
      }),
  );
});

function lookupVerseText(
  book: number,
  chapter: number,
  verse: number,
): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("BibleDB", 6);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("verses", "readonly");
      const store = tx.objectStore("verses");
      const index = store.index("[book+chapter]");
      const range = IDBKeyRange.only([book, chapter]);
      const cursor = index.openCursor(range);

      cursor.onerror = () => reject(cursor.error);

      cursor.onsuccess = () => {
        const result = cursor.result;
        if (!result) {
          resolve(null);
          return;
        }
        if (result.value.verse === verse) {
          resolve(result.value.text);
        } else {
          result.continue();
        }
      };
    };
  });
}

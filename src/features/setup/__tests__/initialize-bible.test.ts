import "fake-indexeddb/auto";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";

import {
  getChapterNumbers,
  getVerses,
  isBibleSeeded,
  markBibleSeeded,
  putVerses,
} from "../../../shared/bible/bible-repository";
import { db } from "../../../shared/bible/db";
import { initializeBible } from "../initialize-bible";

const BIBLE_JSON = JSON.stringify({
  Book: [
    {
      Chapter: [
        {
          Verse: [
            { Verse: "ఆదియందు", Verseid: 1001 },
            { Verse: "రెండవ", Verseid: 1002 },
          ],
        },
      ],
    },
    { Chapter: [{ Verse: [{ Verse: "మూడవ", Verseid: 2001 }] }] },
  ],
});

interface StubResponse {
  body: ReadableStream<Uint8Array> | null;
  headers: Headers;
  ok: boolean;
  status: number;
}

const responseWith = (contentLength?: number): StubResponse => ({
  body: new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(BIBLE_JSON));
      controller.close();
    },
  }),
  headers: new Headers(
    contentLength === undefined
      ? {}
      : { "content-length": String(contentLength) }
  ),
  ok: true,
  status: 200,
});

let fetchCount = 0;

const stubFetch = (response: StubResponse) => {
  fetchCount = 0;
  vi.stubGlobal("fetch", () => {
    fetchCount += 1;

    return Promise.resolve(response);
  });
};

describe(initializeBible, () => {
  beforeEach(async () => {
    await Promise.all([db.verses.clear(), db.meta.clear()]);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("skips the download when the Bible is already seeded", async () => {
    await markBibleSeeded([
      [1, 1],
      [2, 1],
    ]);
    stubFetch(responseWith());
    const progress: (number | null)[] = [];

    await expect(
      initializeBible((p) => progress.push(p))
    ).resolves.toBeTruthy();

    expect(fetchCount).toBe(0);
    expect(progress).toStrictEqual([100]);
  });

  it("reports determinate progress when the response has a content-length", async () => {
    stubFetch(responseWith(new TextEncoder().encode(BIBLE_JSON).length));
    const progress: (number | null)[] = [];

    await expect(
      initializeBible((p) => progress.push(p))
    ).resolves.toBeTruthy();

    expect(progress[0]).toBe(0);
    expect(progress).toContain(75);
    expect(progress.at(-1)).toBe(100);
  });

  it("reports indeterminate progress without a content-length", async () => {
    stubFetch(responseWith());
    const progress: (number | null)[] = [];

    await initializeBible((p) => progress.push(p));

    expect(progress[0]).toBeNull();
  });

  it("saves every verse and the chapter counts", async () => {
    stubFetch(responseWith());

    await initializeBible();

    await expect(isBibleSeeded()).resolves.toBeTruthy();
    await expect(getChapterNumbers(2)).resolves.toStrictEqual([1]);

    const verses = await getVerses(1, 1);

    expect(verses.map((v) => v.text)).toStrictEqual(["ఆదియందు", "రెండవ"]);
  });

  it("keeps the existing verses when the download fails", async () => {
    await putVerses([{ book: 1, chapter: 1, id: 1, text: "old", verse: 1 }]);
    stubFetch({ body: null, headers: new Headers(), ok: false, status: 500 });

    await expect(initializeBible()).rejects.toThrow("Failed to load Bible");

    const verses = await getVerses(1, 1);

    expect(verses.map((v) => v.text)).toStrictEqual(["old"]);
    await expect(isBibleSeeded()).resolves.toBeFalsy();
  });

  it("throws when the response has no body", async () => {
    stubFetch({ body: null, headers: new Headers(), ok: true, status: 200 });

    await expect(initializeBible()).rejects.toThrow(
      "Unable to read response stream"
    );
  });
});

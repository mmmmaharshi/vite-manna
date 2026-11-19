import "fake-indexeddb/auto";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";

import { db } from "../../shared/bible/db";
import { useHighlightStore } from "../highlights/store/highlight-store";
import {
  clearWorstCaseHighlights,
  pickUnseededVerses,
  seedWorstCaseHighlights,
} from "./worst-case";

const createStorage = () => {
  const entries = new Map<string, string>();

  return {
    clear: () => entries.clear(),
    getItem: (key: string) => entries.get(key) ?? null,
    removeItem: (key: string) => entries.delete(key),
    setItem: (key: string, value: string) => entries.set(key, value),
  };
};

const verses = [1, 2, 3].map((verse) => ({
  book: 19,
  chapter: 119,
  id: 19_000 + verse,
  text: `verse ${verse}`,
  verse,
}));

describe(pickUnseededVerses, () => {
  it("skips highlighted verses and caps the count", () => {
    expect(pickUnseededVerses(verses, new Set([19_002]), 2)).toStrictEqual([
      verses[0],
      verses[2],
    ]);
  });
});

describe("worst-case highlight seeding", () => {
  beforeEach(async () => {
    vi.stubGlobal("localStorage", createStorage());
    vi.stubGlobal("window", { location: { search: "" } });
    await Promise.all([
      db.verses.clear(),
      db.meta.clear(),
      db.highlights.clear(),
    ]);
    useHighlightStore.setState({ error: null, highlights: [], loaded: false });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("seeds synthetic highlights and cleans up only its own", async () => {
    await db.verses.bulkPut(verses);

    const created = await seedWorstCaseHighlights();

    expect(created).toHaveLength(3);
    expect(useHighlightStore.getState().highlights).toHaveLength(3);

    const removed = await clearWorstCaseHighlights();

    expect(removed).toBe(3);
    expect(useHighlightStore.getState().highlights).toHaveLength(0);
    await expect(db.highlights.count()).resolves.toBe(0);
  });
});

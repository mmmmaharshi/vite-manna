import {
  DEFAULT_HIGHLIGHT_COLOR,
  getVerses,
  removeHighlight,
  upsertHighlight,
} from "../../shared/bible";
import type { BibleVerse } from "../../shared/bible";
import { useHighlightStore } from "../highlights/store/highlight-store";

const TAGGED_IDS_KEY = "manna.worst-case-highlight-ids";
const STASHED_FONT_KEY = "manna.worst-case-font";

/** Longest chapter in the data set: 176 verses. */
export const WORST_BOOK = 19;

/** Longest chapter in the data set. */
export const WORST_CHAPTER = 119;

/** Largest readable type size, doubling as the zoom extreme. */
export const WORST_FONT = "2xl" as const;

/** Synthetic highlight volume for the huge state. */
export const WORST_HIGHLIGHT_COUNT = 150;

/**
 * Picks verses that do not have highlights yet, up to the requested count.
 *
 * @param verses - The candidate verses in order.
 * @param highlightedIds - Verse ids that already have highlights.
 * @param count - How many to take at most.
 * @returns The verses to seed.
 */
export const pickUnseededVerses = (
  verses: Array<BibleVerse>,
  highlightedIds: ReadonlySet<number>,
  count: number
) => verses.filter((verse) => !highlightedIds.has(verse.id)).slice(0, count);

const readIds = () => {
  try {
    return (localStorage.getItem(TAGGED_IDS_KEY) ?? "")
      .split(",")
      .map(Number)
      .filter((id) => Number.isInteger(id) && id > 0);
  } catch {
    return [];
  }
};

const writeIds = (ids: Array<number>) => {
  localStorage.setItem(TAGGED_IDS_KEY, ids.join(","));
};

/**
 * Seeds synthetic highlights on the longest chapter for volume testing.
 * Skips verses that already have highlights, and records only the ids
 * this call created so cleanup never touches real highlights.
 *
 * @returns The created highlight verse ids.
 */
export const seedWorstCaseHighlights = async () => {
  const verses = await getVerses(WORST_BOOK, WORST_CHAPTER);
  const { highlights, upsertLocal } = useHighlightStore.getState();
  const existing = new Set(highlights.map((highlight) => highlight.verseId));
  const fresh = pickUnseededVerses(verses, existing, WORST_HIGHLIGHT_COUNT);
  const now = Date.now();

  await Promise.all(
    fresh.map(async (verse) => {
      await upsertHighlight({
        book: verse.book,
        chapter: verse.chapter,
        text: verse.text,
        verse: verse.verse,
        verseId: verse.id,
      });
      upsertLocal({
        book: verse.book,
        chapter: verse.chapter,
        color: DEFAULT_HIGHLIGHT_COLOR,
        createdAt: now,
        text: verse.text,
        updatedAt: now,
        verse: verse.verse,
        verseId: verse.id,
      });
    })
  );

  const created = fresh.map((verse) => verse.id);

  writeIds([...readIds(), ...created]);

  return created;
};

/**
 * Removes only the synthetic highlights this harness created.
 *
 * @returns The number of highlights removed.
 */
export const clearWorstCaseHighlights = async () => {
  const ids = readIds();

  await Promise.all(
    ids.map(async (verseId) => {
      await removeHighlight(verseId);
      useHighlightStore.getState().removeLocal(verseId);
    })
  );

  writeIds([]);

  return ids.length;
};

/**
 * Reads the font stashed before entering a worst-case state.
 *
 * @returns The stashed font size, if any.
 */
export const readStashedFont = () => {
  try {
    return localStorage.getItem(STASHED_FONT_KEY);
  } catch {
    return null;
  }
};

/**
 * Stashes the user's font size once, so leaving the worst case restores it.
 *
 * @param fontSize - The font size to restore later.
 */
export const stashFontOnce = (fontSize: string) => {
  if (localStorage.getItem(STASHED_FONT_KEY) === null) {
    localStorage.setItem(STASHED_FONT_KEY, fontSize);
  }
};

/**
 * Forgets the stashed font size after restoring it.
 */
export const clearStashedFont = () => {
  localStorage.removeItem(STASHED_FONT_KEY);
};

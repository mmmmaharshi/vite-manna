import {
  clearBibleSeed,
  isBibleSeeded,
  markBibleSeeded,
  putVerses,
} from "../../shared/bible";
import { parseBibleResponse, readBible } from "./bible-parser";

const BIBLE_URL = "/bible.json";
const BATCH_SIZE = 1000;
const DOWNLOAD_WEIGHT = 70;
const PARSED_PERCENT = 75;
const SAVE_START = 90;
const SAVE_SPAN = 10;

/**
 * Downloads the Bible JSON once, then stores it in IndexedDB in batches.
 *
 * @param onProgress - Receives download and save progress.
 * @returns True once the Bible is seeded.
 */
export const initializeBible = async (
  onProgress?: (progress: number | null) => void
) => {
  if (await isBibleSeeded()) {
    onProgress?.(100);

    return true;
  }

  const response = await fetch(BIBLE_URL);

  if (!response.ok) {
    throw new Error(`Failed to load Bible: ${response.status}`);
  }

  const total = Number(response.headers.get("content-length")) || 0;

  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error("Unable to read response stream");
  }

  let received = 0;
  const chunks: Uint8Array[] = [];

  const readStream = async () => {
    const { done, value } = await reader.read();

    if (done) {
      return;
    }

    chunks.push(value);
    received += value.length;

    if (total > 0) {
      onProgress?.(Math.round((received / total) * DOWNLOAD_WEIGHT));
    }

    await readStream();
  };

  onProgress?.(total > 0 ? 0 : null);
  await readStream();

  const bytes = new Uint8Array(received);

  let position = 0;

  for (const chunk of chunks) {
    bytes.set(chunk, position);
    position += chunk.length;
  }

  onProgress?.(PARSED_PERCENT);

  const { chapterCounts, verses } = readBible(
    parseBibleResponse(new TextDecoder().decode(bytes))
  );

  const saveBatch = async (start: number) => {
    if (start >= verses.length) {
      return;
    }

    await putVerses(verses.slice(start, start + BATCH_SIZE));

    const saved = Math.min(start + BATCH_SIZE, verses.length);

    onProgress?.(SAVE_START + (saved / verses.length) * SAVE_SPAN);

    await saveBatch(start + BATCH_SIZE);
  };

  // WARNING: seed only after a good download and parse, or a failure destroys the old data.
  await clearBibleSeed();
  onProgress?.(90);
  await saveBatch(0);
  await markBibleSeeded(chapterCounts);

  onProgress?.(100);

  return true;
};

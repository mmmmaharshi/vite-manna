import {
  clearBibleSeed,
  isBibleSeeded,
  markBibleSeeded,
  putVerses,
} from "../../shared/bible";
import { parseBibleResponse, readBible } from "./bible-parser";

const BIBLE_URL = "/bible.json";
const BATCH_SIZE = 1000;

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

  // Recursive instead of a while loop so no `await` sits inside a loop body.
  const readStream = async (): Promise<void> => {
    const { done, value } = await reader.read();

    if (done) {
      return;
    }

    chunks.push(value);
    received += value.length;

    if (total > 0) {
      onProgress?.(Math.round((received / total) * 70));
    }

    await readStream();
  };

  // Compressed responses carry no content-length, so the bar stays indeterminate.
  onProgress?.(total > 0 ? 0 : null);
  await readStream();

  const bytes = new Uint8Array(received);

  let position = 0;

  for (const chunk of chunks) {
    bytes.set(chunk, position);
    position += chunk.length;
  }

  onProgress?.(75);

  const { chapterCounts, verses } = readBible(
    parseBibleResponse(new TextDecoder().decode(bytes))
  );

  const saveBatch = async (start: number): Promise<void> => {
    if (start >= verses.length) {
      return;
    }

    await putVerses(verses.slice(start, start + BATCH_SIZE));

    const saved = Math.min(start + BATCH_SIZE, verses.length);

    onProgress?.(90 + (saved / verses.length) * 10);

    await saveBatch(start + BATCH_SIZE);
  };

  // Only after a good download and parse, so a failure never destroys the old data.
  await clearBibleSeed();
  onProgress?.(90);
  await saveBatch(0);
  await markBibleSeeded(chapterCounts);

  onProgress?.(100);

  return true;
};

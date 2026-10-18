import { countVerses, putVerses } from "../../shared/bible";
import type { BibleVerse } from "../../shared/bible";

const BIBLE_URL = "/bible.json";
const BATCH_SIZE = 1000;

interface BibleResponse {
  Book: {
    Chapter: {
      Verse: {
        Verse: string;
        Verseid: number;
      }[];
    }[];
  }[];
}

export const initializeBible = async (
  onProgress?: (progress: number) => void
) => {
  const count = await countVerses();

  if (count > 0) {
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

  await readStream();

  const bytes = new Uint8Array(received);

  let position = 0;

  for (const chunk of chunks) {
    bytes.set(chunk, position);
    position += chunk.length;
  }

  onProgress?.(75);

  const bible = JSON.parse(new TextDecoder().decode(bytes)) as BibleResponse;

  const verses: BibleVerse[] = [];

  const totalBooks = bible.Book.length;

  for (let bookIndex = 0; bookIndex < totalBooks; bookIndex += 1) {
    const book = bible.Book[bookIndex];

    for (
      let chapterIndex = 0;
      chapterIndex < book.Chapter.length;
      chapterIndex += 1
    ) {
      const chapter = book.Chapter[chapterIndex];

      for (
        let verseIndex = 0;
        verseIndex < chapter.Verse.length;
        verseIndex += 1
      ) {
        const verse = chapter.Verse[verseIndex];

        verses.push({
          book: bookIndex + 1,
          chapter: chapterIndex + 1,
          id: verse.Verseid,
          text: verse.Verse,
          verse: verseIndex + 1,
        });
      }
    }

    const processingProgress = 75 + ((bookIndex + 1) / totalBooks) * 15;

    onProgress?.(processingProgress);
  }

  const saveBatch = async (start: number): Promise<void> => {
    if (start >= verses.length) {
      return;
    }

    await putVerses(verses.slice(start, start + BATCH_SIZE));

    const saved = Math.min(start + BATCH_SIZE, verses.length);

    onProgress?.(90 + (saved / verses.length) * 10);

    await saveBatch(start + BATCH_SIZE);
  };

  await saveBatch(0);

  onProgress?.(100);

  return true;
};

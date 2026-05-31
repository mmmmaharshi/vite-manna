import { db, type BibleVerse } from "./db";

const BIBLE_URL = "/bible.json";

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

export async function initializeBible(onProgress?: (progress: number) => void) {
  const count = await db.verses.count();

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

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    chunks.push(value);
    received += value.length;

    if (total > 0) {
      const progress = Math.round((received / total) * 70);

      onProgress?.(progress);
    }
  }

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

  for (let bookIndex = 0; bookIndex < totalBooks; bookIndex++) {
    const book = bible.Book[bookIndex];

    for (
      let chapterIndex = 0;
      chapterIndex < book.Chapter.length;
      chapterIndex++
    ) {
      const chapter = book.Chapter[chapterIndex];

      for (
        let verseIndex = 0;
        verseIndex < chapter.Verse.length;
        verseIndex++
      ) {
        const verse = chapter.Verse[verseIndex];

        verses.push({
          id: verse.Verseid,
          book: bookIndex + 1,
          chapter: chapterIndex + 1,
          verse: verseIndex + 1,
          text: verse.Verse,
        });
      }
    }

    const processingProgress = 75 + ((bookIndex + 1) / totalBooks) * 15;

    onProgress?.(processingProgress);
  }

  const BATCH_SIZE = 1000;

  for (let i = 0; i < verses.length; i += BATCH_SIZE) {
    await db.verses.bulkPut(verses.slice(i, i + BATCH_SIZE));

    const saveProgress =
      90 + (Math.min(i + BATCH_SIZE, verses.length) / verses.length) * 10;

    onProgress?.(saveProgress);
  }

  onProgress?.(100);

  return true;
}

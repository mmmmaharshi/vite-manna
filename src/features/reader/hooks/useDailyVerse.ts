import { useEffect, useRef, useState } from "react";

import { getBibleBookName, db } from "../../../shared/bible";
import { DAILY_VERSE_REFS, getDayOfYear, parseVerseref } from "../../../shared/bible/dailyVerseData";

const CACHE_KEY = "manna.daily-verse";

interface DailyVerseData {
  reference: string;
  teluguText: string;
  book: number | null;
  chapter: number | null;
  verse: number | null;
}

interface CacheEntry {
  date: string;
  data: DailyVerseData;
  shown: boolean;
}

export interface DailyVerseResult extends DailyVerseData {
  isLoading: boolean;
  isFirstOpenToday: boolean;
  markDailyVerseShown: () => void;
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function readCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    return parsed.date === getTodayKey() ? parsed : null;
  } catch {
    return null;
  }
}

function writeCache(data: DailyVerseData, shown: boolean) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ date: getTodayKey(), data, shown }),
    );
  } catch {
    // cache full
  }
}

export function useDailyVerse(): DailyVerseResult {
  const [result, setResult] = useState<DailyVerseResult>({
    reference: "",
    teluguText: "",
    book: null,
    chapter: null,
    verse: null,
    isLoading: true,
    isFirstOpenToday: false,
    markDailyVerseShown: () => {},
  });

  const markShownRef = useRef<() => void>(
    () => {
      const entry = readCache();
      if (entry && !entry.shown) {
        writeCache(entry.data, true);
      }
    },
  );

  useEffect(() => {
    let mounted = true;

    async function load() {
      const cached = readCache();
      if (cached) {
        if (mounted)
          setResult({
            ...cached.data,
            isLoading: false,
            isFirstOpenToday: !cached.shown,
            markDailyVerseShown: () => markShownRef.current?.(),
          });
        return;
      }

      const dayOfYear = getDayOfYear();
      const verseref =
        DAILY_VERSE_REFS[(dayOfYear - 1) % DAILY_VERSE_REFS.length];
      const parsed = parseVerseref(verseref);

      let teluguText = "";
      let reference = verseref;

      if (
        parsed.book !== null &&
        parsed.chapter !== null &&
        parsed.verse !== null
      ) {
        try {
          const verses = await db.verses
            .where("[book+chapter]")
            .equals([parsed.book, parsed.chapter])
            .toArray();
          const found = verses.find((v) => v.verse === parsed.verse);
          if (found) teluguText = found.text;
        } catch {
          // lookup failed
        }
        reference = `${getBibleBookName(parsed.book)} ${parsed.chapter}:${parsed.verse}`;
      }

      const data: DailyVerseData = {
        reference,
        teluguText,
        book: parsed.book,
        chapter: parsed.chapter,
        verse: parsed.verse,
      };

      writeCache(data, false);

      if (mounted)
        setResult({
          ...data,
          isLoading: false,
          isFirstOpenToday: true,
          markDailyVerseShown: () => markShownRef.current?.(),
        });
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return result;
}

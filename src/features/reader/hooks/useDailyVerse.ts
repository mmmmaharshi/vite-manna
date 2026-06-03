import { format } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";

import { getBibleBookName, db } from "../../../shared/bible";
import { getUserOffset } from "../../../shared/bible/bibleRepository";
import { DAILY_VERSE_REFS, getDayOfYear, parseVerseref } from "../../../shared/bible/dailyVerseData";

const CACHE_KEY = "manna.daily-verse";
const NOTIF_KEY = "manna.notifications-enabled";

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
  return format(new Date(), "yyyy-M-d");
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
    localStorage.setItem(CACHE_KEY, JSON.stringify({ date: getTodayKey(), data, shown }));
  } catch {
  }
}

export function useDailyVerse(): DailyVerseResult {
  const cached = readCache();
  const [notifPref] = useState(() => localStorage.getItem(NOTIF_KEY));

  const markDailyVerseShown = useCallback(() => {
    const entry = readCache();
    if (entry && !entry.shown) {
      writeCache(entry.data, true);
    }
  }, []);

  const [result, setResult] = useState<DailyVerseResult>(() => {
    if (cached) {
      return {
        ...cached.data,
        isLoading: false,
        isFirstOpenToday: !cached.shown,
        markDailyVerseShown,
      };
    }
    return {
      reference: "",
      teluguText: "",
      book: null,
      chapter: null,
      verse: null,
      isLoading: true,
      isFirstOpenToday: false,
      markDailyVerseShown,
    };
  });

  const offsetRef = useRef(0);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    getUserOffset().then((offset) => {
      offsetRef.current = offset;
    });
  }, []);

  useEffect(() => {
    if (!result.isLoading) return;
    let mounted = true;

    async function load() {
      await getUserOffset();
      const dayOfYear = getDayOfYear(new Date());
      const offset = offsetRef.current;
      const index = ((dayOfYear - 1 + offset) % DAILY_VERSE_REFS.length + DAILY_VERSE_REFS.length) % DAILY_VERSE_REFS.length;
      const verseref = DAILY_VERSE_REFS[index];
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
          markDailyVerseShown,
        });
    }

    load();
    return () => {
      mounted = false;
    };
  }, [result.isLoading, markDailyVerseShown]);

  useEffect(() => {
    if (result.isLoading || !result.isFirstOpenToday || !result.teluguText) return;

    try {
      if (
        notifPref === "true" &&
        typeof Notification !== "undefined" &&
        Notification.permission === "granted"
      ) {
        new Notification(result.reference, {
          body: result.teluguText,
          icon: "/favicon.svg",
          tag: "daily-verse",
        });
      }
    } catch {
    }
  }, [result.isLoading, result.isFirstOpenToday, result.teluguText, result.reference, notifPref]);

  return result;
}

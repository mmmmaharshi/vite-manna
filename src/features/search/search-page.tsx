import { Magnifier } from "@gravity-ui/icons";
import {
  ScrollShadow,
  SearchField,
  Spinner,
  Surface,
  Typography,
} from "@heroui/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { getBibleBookName, searchVerses } from "../../shared/bible";
import type { BibleVerse } from "../../shared/bible";
import { useReaderStore } from "../reader/store/reader-store";

interface SearchPageProps {
  onNavigateToReader: () => void;
}

const formatRef = (verse: BibleVerse) =>
  `${getBibleBookName(verse.book)} ${verse.chapter}:${verse.verse}`;

const SearchPage = ({ onNavigateToReader }: SearchPageProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BibleVerse[]>([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setError(null);

    if (!value.trim()) {
      setResults([]);
      setSearched(false);
    }
  };

  const executeSearch = useCallback(async (q: string) => {
    setSearching(true);
    setError(null);

    try {
      const verses = await searchVerses(q);
      setResults(verses);
      setSearched(true);
    } catch {
      setError("Search failed. Please try again.");
      setResults([]);
      setSearched(true);
    }

    setSearching(false);
  }, []);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!query.trim()) {
      return;
    }

    timerRef.current = setTimeout(() => executeSearch(query.trim()), 300);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [query, executeSearch]);

  const handleNavigate = (verse: BibleVerse) => {
    const store = useReaderStore.getState();
    store.setBook(verse.book);
    store.setChapter(verse.chapter);
    store.setPermalinkVerse(verse.verse);
    onNavigateToReader();
  };

  return (
    <main id="main-content" className="flex h-dvh flex-col">
      <Surface className="sticky top-0 z-30 border border-b py-3">
        <div className="mx-auto w-full max-w-md px-2 sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
          <Typography.Heading level={1} className="text-xl">
            Search
          </Typography.Heading>
        </div>
      </Surface>

      <ScrollShadow hideScrollBar className="flex-1">
        <div className="mx-auto w-full max-w-md px-2 pt-2 sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
          <SearchField
            value={query}
            onChange={handleQueryChange}
            onClear={() => {
              setResults([]);
              setSearched(false);
              setError(null);
            }}
            fullWidth
            aria-label="Search verses"
          >
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="వాక్యాలను వెతకండి..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
        </div>

        {searching && (
          <output className="flex justify-center py-8" aria-live="polite">
            <Spinner aria-label="Searching" />
          </output>
        )}

        <div ref={null} aria-live="polite" aria-atomic="true">
          {!searched && !searching && (
            <section className="mx-auto flex w-full max-w-md flex-col items-center gap-2 px-2 py-24 text-center sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
              <Magnifier
                aria-hidden="true"
                className="text-muted h-10 w-10 sm:h-12 sm:w-12"
              />
              <Typography className="text-base font-medium">
                Search Bible
              </Typography>
              <Typography.Paragraph size="sm" color="muted">
                Search verses by keyword
              </Typography.Paragraph>
            </section>
          )}

          {searched && error !== null && (
            <section
              className="mx-auto flex w-full max-w-md flex-col items-center gap-2 px-2 py-24 text-center sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl"
              role="alert"
            >
              <Typography className="text-danger text-base font-medium">
                {error}
              </Typography>
            </section>
          )}

          {searched && error === null && results.length === 0 && !searching && (
            <section className="mx-auto flex w-full max-w-md flex-col items-center gap-2 px-2 py-24 text-center sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
              <Typography className="text-base font-medium">
                No results
              </Typography>
              <Typography.Paragraph size="sm" color="muted">
                Try a different search term
              </Typography.Paragraph>
            </section>
          )}

          {results.length > 0 && (
            <section className="mx-auto flex w-full max-w-md flex-col gap-2 px-2 py-4 sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
              <Typography.Paragraph size="sm" color="muted" className="px-1">
                {results.length} result{results.length === 1 ? "" : "s"}
              </Typography.Paragraph>
              {results.map((verse) => (
                <Surface key={verse.id} className="flex items-start gap-2 p-3">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => handleNavigate(verse)}
                  >
                    <Typography className="text-accent text-sm font-medium">
                      {formatRef(verse)}
                    </Typography>
                    <Typography.Paragraph
                      size="sm"
                      color="muted"
                      className="mt-0.5"
                    >
                      {verse.text}
                    </Typography.Paragraph>
                  </button>
                </Surface>
              ))}
            </section>
          )}
        </div>

        <div className="h-[calc(4rem+env(safe-area-inset-bottom))]" />
      </ScrollShadow>
    </main>
  );
};

export default SearchPage;

import { Magnifier } from "@gravity-ui/icons";
import {
  ScrollShadow,
  SearchField,
  Spinner,
  Surface,
  Typography,
} from "@heroui/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { searchVerses } from "../../shared/bible";
import type { BibleVerse } from "../../shared/bible";
import { formatReference } from "../../shared/lib/reference";
import type { VerseRef } from "../../shared/lib/reference";
import { useReaderStore } from "../reader/store/reader-store";

interface SearchPageProps {
  onNavigateToReader: () => void;
}

type SearchStatus = "idle" | "searching" | "error" | "empty" | "results";

const SEARCH_ERROR_MESSAGE = "Search failed. Please try again.";

const SearchPage = ({ onNavigateToReader }: SearchPageProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BibleVerse[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const handleQueryChange = (value: string) => {
    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      setStatus("idle");
    } else if (status === "error") {
      // The failed query is gone; show the last good state instead of
      // flashing the prompt while the debounce is pending.
      setStatus(results.length > 0 ? "results" : "empty");
    }
  };

  const executeSearch = useCallback(async (q: string) => {
    // Answers that arrive after a newer search started are dropped.
    const requestId = requestIdRef.current + 1;

    requestIdRef.current = requestId;
    setStatus("searching");

    try {
      const verses = await searchVerses(q);

      if (requestIdRef.current !== requestId) {
        return;
      }

      setResults(verses);
      setStatus(verses.length > 0 ? "results" : "empty");
    } catch {
      if (requestIdRef.current !== requestId) {
        return;
      }

      setResults([]);
      setStatus("error");
    }
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
    const ref: VerseRef = {
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
    };
    useReaderStore.getState().goToVerse(ref);
    onNavigateToReader();
  };

  return (
    <main id="main-content" className="flex h-dvh flex-col">
      <Surface className="sticky top-0 z-30 border border-b py-3">
        <div className="page-shell mx-auto w-full px-2">
          <Typography.Heading level={1} className="text-xl">
            Search
          </Typography.Heading>
        </div>
      </Surface>

      <ScrollShadow hideScrollBar className="flex-1">
        <div className="page-shell mx-auto w-full px-2 pt-2">
          <SearchField
            value={query}
            onChange={handleQueryChange}
            onClear={() => {
              setResults([]);
              setStatus("idle");
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

        {status === "searching" && (
          <output className="flex justify-center py-8" aria-live="polite">
            <Spinner aria-label="Searching" />
          </output>
        )}

        <div aria-live="polite" aria-atomic="true">
          {status === "idle" && (
            <section className="page-shell mx-auto flex w-full flex-col items-center gap-2 px-2 py-24 text-center">
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

          {status === "error" && (
            <section
              className="page-shell mx-auto flex w-full flex-col items-center gap-2 px-2 py-24 text-center"
              role="alert"
            >
              <Typography className="text-danger text-base font-medium">
                {SEARCH_ERROR_MESSAGE}
              </Typography>
            </section>
          )}

          {status === "empty" && (
            <section className="page-shell mx-auto flex w-full flex-col items-center gap-2 px-2 py-24 text-center">
              <Typography className="text-base font-medium">
                No results
              </Typography>
              <Typography.Paragraph size="sm" color="muted">
                Try a different search term
              </Typography.Paragraph>
            </section>
          )}

          {results.length > 0 && (
            <section className="page-shell mx-auto flex w-full flex-col gap-2 px-2 py-4">
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
                      {formatReference(verse.book, verse.chapter, verse.verse)}
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

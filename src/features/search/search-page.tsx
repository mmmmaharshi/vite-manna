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
import {
  BottomSpacer,
  Page,
  PageHeader,
  PageMessage,
  PageSection,
} from "../../shared/ui";
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

  const clearSearch = () => {
    setResults([]);
    setStatus("idle");
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);

    if (!value.trim()) {
      clearSearch();
    } else if (status === "error") {
      setStatus(results.length > 0 ? "results" : "empty");
    }
  };

  const executeSearch = useCallback(async (q: string) => {
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

    if (query.trim()) {
      timerRef.current = setTimeout(() => executeSearch(query.trim()), 300);
    }

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
    <Page>
      <PageHeader title="Search" />

      <ScrollShadow hideScrollBar className="flex-1">
        <PageSection className="pt-2">
          <SearchField
            value={query}
            onChange={handleQueryChange}
            onClear={clearSearch}
            fullWidth
            aria-label="Search verses"
          >
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="వాక్యాలను వెతకండి..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
        </PageSection>

        {status === "searching" && (
          <output className="flex justify-center py-8" aria-live="polite">
            <Spinner aria-label="Searching" />
          </output>
        )}

        <div aria-live="polite" aria-atomic="true">
          {status === "idle" && (
            <PageMessage
              title="Search Bible"
              hint="Search verses by keyword"
              icon={
                <Magnifier
                  aria-hidden="true"
                  className="text-muted h-10 w-10 sm:h-12 sm:w-12"
                />
              }
            />
          )}

          {status === "error" && (
            <PageMessage
              title={SEARCH_ERROR_MESSAGE}
              tone="danger"
              announce="alert"
            />
          )}

          {status === "empty" && (
            <PageMessage
              title="No results"
              hint="Try a different search term"
            />
          )}

          {results.length > 0 && (
            <PageSection live className="flex flex-col gap-2 py-4">
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
            </PageSection>
          )}
        </div>

        <BottomSpacer />
      </ScrollShadow>
    </Page>
  );
};

export default SearchPage;

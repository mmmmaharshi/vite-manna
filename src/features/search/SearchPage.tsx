import { useEffect, useRef, useState } from "react";
import { Magnifier } from "@gravity-ui/icons";
import { ScrollShadow, SearchField, Surface, Typography } from "@heroui/react";

import { getBibleBookName, searchVerses, type BibleVerse } from "../../shared/bible";
import { useReaderStore } from "../reader/store/readerStore";

interface SearchPageProps {
  onNavigateToReader: () => void;
}

function formatRef(verse: BibleVerse) {
  return `${getBibleBookName(verse.book)} ${verse.chapter}:${verse.verse}`;
}

const SearchPage = ({ onNavigateToReader }: SearchPageProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BibleVerse[]>([]);
  const [searched, setSearched] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      setSearched(false);
    }
  };

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim()) return;
    timerRef.current = setTimeout(async () => {
      const verses = await searchVerses(query.trim());
      setResults(verses);
      setSearched(true);
    }, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  const handleNavigate = (verse: BibleVerse) => {
    const store = useReaderStore.getState();
    store.setBook(verse.book);
    store.setChapter(verse.chapter);
    store.setPermalinkVerse(verse.verse);
    onNavigateToReader();
  };

  return (
    <div className="h-dvh flex flex-col">
      <Surface className="sticky top-0 z-30 py-3 border border-b">
        <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl w-full px-2 mx-auto">
          <Typography.Heading level={1} className="text-xl">Search</Typography.Heading>
        </div>
      </Surface>

      <ScrollShadow hideScrollBar className="flex-1">
        <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl w-full px-2 mx-auto pt-2">
          <SearchField
            value={query}
            onChange={handleQueryChange}
            onClear={() => { setResults([]); setSearched(false); }}
            fullWidth
            aria-label="Search verses"
          >
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search verses..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
        </div>

        {!searched ? (
          <section className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl w-full px-2 py-24 mx-auto flex flex-col items-center gap-2 text-center">
            <Magnifier aria-hidden="true" className="h-10 w-10 sm:h-12 sm:w-12 text-muted" />
            <Typography className="text-base font-medium">Search Bible</Typography>
            <Typography.Paragraph size="sm" color="muted">
              Search verses by keyword
            </Typography.Paragraph>
          </section>
        ) : results.length === 0 ? (
          <section className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl w-full px-2 py-24 mx-auto flex flex-col items-center gap-2 text-center">
            <Typography className="text-base font-medium">No results</Typography>
            <Typography.Paragraph size="sm" color="muted">
              Try a different search term
            </Typography.Paragraph>
          </section>
        ) : (
          <section className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl w-full px-2 py-4 mx-auto flex flex-col gap-2">
            <Typography.Paragraph size="sm" color="muted" className="px-1">
              {results.length} result{results.length !== 1 ? "s" : ""}
            </Typography.Paragraph>
            {results.map((verse) => (
              <Surface key={verse.id} className="flex items-start gap-2 p-3">
                <button
                  type="button"
                  className="flex-1 min-w-0 text-left"
                  onClick={() => handleNavigate(verse)}
                >
                  <Typography className="text-sm font-medium text-accent">
                    {formatRef(verse)}
                  </Typography>
                  <Typography.Paragraph size="sm" color="muted" className="mt-0.5">
                    {verse.text}
                  </Typography.Paragraph>
                </button>
              </Surface>
            ))}
          </section>
        )}
        <div className="h-[calc(4rem+env(safe-area-inset-bottom))]" />
      </ScrollShadow>
    </div>
  );
};

export default SearchPage;

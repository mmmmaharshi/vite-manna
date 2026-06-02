import { useEffect, useState } from "react";
import { BookmarkFill, Magnifier, Xmark } from "@gravity-ui/icons";
import { Button, Input, Surface, Typography } from "@heroui/react";

import { getBibleBookName, searchVerses, type BibleVerse } from "../../shared/bible";
import { useBookmarks } from "../bookmarks/hooks/useBookmarks";
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
  const { bookmarkedIds, toggle } = useBookmarks();

  const handleSearch = async () => {
    if (!query.trim()) return;
    const verses = await searchVerses(query.trim());
    setResults(verses);
    setSearched(true);
  };

  const handleNavigate = (verse: BibleVerse) => {
    const store = useReaderStore.getState();
    store.setBook(verse.book);
    store.setChapter(verse.chapter);
    store.setPermalinkVerse(verse.verse);
    onNavigateToReader();
  };

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main className="min-h-dvh">
      <Surface className="sticky top-0 z-30 py-3 border border-b">
        <div className="max-w-md w-full px-2 mx-auto flex flex-col gap-2">
          <Typography.Heading level={4}>Search</Typography.Heading>
          <div className="flex gap-2">
            <Input
              className="flex-1"
              placeholder="Search verses..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            />
            {query && (
              <Button isIconOnly size="sm" variant="tertiary" onPress={() => { setQuery(""); setResults([]); setSearched(false); }}>
                <Xmark aria-hidden="true" className="h-4 w-4" />
              </Button>
            )}
            <Button size="sm" variant="primary" onPress={handleSearch}>
              <Magnifier aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Surface>

      {!searched ? (
        <section className="max-w-md w-full px-2 py-24 mx-auto flex flex-col items-center gap-2 text-center">
          <Magnifier className="h-12 w-12 text-muted" />
          <Typography className="text-base font-medium">Search Bible</Typography>
          <Typography.Paragraph size="sm" color="muted">
            Search verses by keyword
          </Typography.Paragraph>
        </section>
      ) : results.length === 0 ? (
        <section className="max-w-md w-full px-2 py-24 mx-auto flex flex-col items-center gap-2 text-center">
          <Typography className="text-base font-medium">No results</Typography>
          <Typography.Paragraph size="sm" color="muted">
            Try a different search term
          </Typography.Paragraph>
        </section>
      ) : (
        <section className="max-w-md w-full px-2 py-4 mx-auto flex flex-col gap-2">
          <Typography.Paragraph size="sm" color="muted" className="px-1">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </Typography.Paragraph>
          {results.map((verse) => {
            const isBm = bookmarkedIds.has(verse.id);
            return (
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
                <Button
                  aria-label={isBm ? "Remove bookmark" : "Bookmark"}
                  isIconOnly
                  size="sm"
                  variant="tertiary"
                  className="shrink-0 mt-0.5"
                  onPress={() => toggle(verse)}
                >
                  {isBm
                    ? <BookmarkFill aria-hidden="true" className="h-4 w-4 text-accent" />
                    : <BookmarkFill aria-hidden="true" className="h-4 w-4 text-muted/40" />}
                </Button>
              </Surface>
            );
          })}
        </section>
      )}
    </main>
  );
};

export default SearchPage;

import {
  Button,
  Description,
  ListBox,
  ScrollShadow,
  Select,
  Surface,
  Typography,
} from "@heroui/react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  getBooks,
  getChapterNumbers,
  getVerses,
} from "../bible/bibleRepository";
import { getBibleBookName } from "../bible/books";
import type { BibleVerse } from "../bible/db";
import { useReaderLocation } from "../bible/useReaderLocation";
import SplashView from "../components/SplashView";

const MINIMUM_SPLASH_DURATION_MS = 500;

interface BibleBook {
  chapterCount: number;
  id: number;
  name: string;
}

interface BibleChapters {
  book: number | null;
  values: number[];
}

const App = () => {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [chapters, setChapters] = useState<BibleChapters>({
    book: null,
    values: [],
  });
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const activeChapterRef = useRef<HTMLButtonElement>(null);
  const { book, chapter, setBook, setChapter } = useReaderLocation();

  useEffect(() => {
    let mounted = true;

    void getBooks()
      .then((bookSummaries) => {
        if (mounted) {
          setBooks(
            bookSummaries.map((book) => ({
              ...book,
              name: getBibleBookName(book.id),
            })),
          );
        }
      })
      .catch((error) => {
        console.error("[Bible] Unable to load books", error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    void getChapterNumbers(book)
      .then((chapterNumbers) => {
        if (mounted) {
          setChapters({
            book,
            values: chapterNumbers,
          });
        }
      })
      .catch((error) => {
        console.error("[Bible] Unable to load chapters", error);

        if (mounted) {
          setChapters({ book, values: [] });
        }
      });

    return () => {
      mounted = false;
    };
  }, [book]);

  const visibleChapters = useMemo(
    () => (chapters.book === book ? chapters.values : []),
    [book, chapters],
  );

  useEffect(() => {
    if (books.length > 0 && !books.some((candidate) => candidate.id === book)) {
      setBook(books[0].id);
    }
  }, [book, books, setBook]);

  useEffect(() => {
    if (visibleChapters.length > 0 && !visibleChapters.includes(chapter)) {
      setChapter(visibleChapters[0]);
    }
  }, [chapter, setChapter, visibleChapters]);

  useEffect(() => {
    activeChapterRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [chapter, visibleChapters]);

  useEffect(() => {
    let mounted = true;

    void getVerses(book, chapter)
      .then((chapterVerses) => {
        if (mounted) {
          setVerses(chapterVerses);
        }
      })
      .catch((error) => {
        console.error("[Bible] Unable to load verses", error);

        if (mounted) {
          setVerses([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, [book, chapter]);

  useEffect(() => {
    if (
      isHydrated ||
      books.length === 0 ||
      visibleChapters.length === 0 ||
      verses.length === 0
    ) {
      return;
    }

    const timeoutId = setTimeout(
      () => setIsHydrated(true),
      MINIMUM_SPLASH_DURATION_MS,
    );

    return () => clearTimeout(timeoutId);
  }, [books, isHydrated, verses, visibleChapters]);

  if (!isHydrated) {
    return <SplashView />;
  }

  return (
    <main>
      <Surface className="py-2.5 pt-3.5 border border-b">
        <div className="max-w-sm flex flex-col gap-2 w-full px-2 mx-auto">
          <Select
            className={"rounded-md overflow-auto"}
            isDisabled={books.length === 0}
            value={book}
            variant="secondary"
            onChange={(bookId) => {
              if (bookId !== null) {
                setBook(Number(bookId));
              }
            }}
          >
            <Select.Trigger>
              <Select.Value>{() => getBibleBookName(book)}</Select.Value>
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {books.map((book) => (
                  <ListBox.Item
                    id={book.id}
                    key={book.id}
                    textValue={book.name}
                  >
                    <div className="flex flex-col gap-1">
                      <span>{book.name}</span>
                      <Description>{book.chapterCount} అధ్యాయాలు</Description>
                    </div>
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>

          {visibleChapters.length > 0 && (
            <ScrollShadow hideScrollBar orientation="horizontal">
              <div className="flex gap-2 py-1">
                {visibleChapters.map((chapterNumber) => (
                  <Button
                    ref={chapter === chapterNumber ? activeChapterRef : null}
                    key={chapterNumber}
                    size="md"
                    className={"rounded-md"}
                    variant={
                      chapter === chapterNumber ? "primary" : "secondary"
                    }
                    onPress={() => setChapter(chapterNumber)}
                  >
                    {chapterNumber}
                  </Button>
                ))}
              </div>
            </ScrollShadow>
          )}
        </div>
      </Surface>

      <section className="max-w-sm w-full px-2 py-4 mx-auto">
        <ol className="flex flex-col gap-3">
          {verses.map((verse) => (
            <li key={verse.id}>
              <Typography>
                <sup className="me-1 text-xs text-muted">{verse.verse}</sup>
                {verse.text}
              </Typography>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
};

export default App;

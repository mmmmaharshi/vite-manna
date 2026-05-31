import {
  Button,
  Description,
  ListBox,
  ScrollShadow,
  Select,
  Surface,
  Typography,
} from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router";

import {
  getReaderBootstrap,
  getReaderSnapshot,
} from "../bible/bibleRepository";
import { getBibleBookName } from "../bible/books";
import type { BibleVerse } from "../bible/db";
import { useReaderLocation } from "../bible/useReaderLocation";
import SplashView from "../components/SplashView";
import { waitForOfflineReadiness } from "../lib/offlineReadiness";
import { waitForFonts } from "../lib/waitForFonts";

const MINIMUM_SPLASH_DURATION_MS = 500;

interface BibleBook {
  chapterCount: number;
  id: number;
  name: string;
}

interface ReaderSnapshot {
  book: number;
  chapter: number | undefined;
  chapters: number[];
  verses: BibleVerse[];
}

interface AppProps {
  onHydrated?: () => void;
  showSplash?: boolean;
}

const App = ({ onHydrated, showSplash = true }: AppProps) => {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [readerSnapshot, setReaderSnapshot] = useState<ReaderSnapshot | null>(
    null,
  );
  const [hasLoadedBooks, setHasLoadedBooks] = useState(false);
  const [areFontsReady, setAreFontsReady] = useState(false);
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isBookSelectOpen, setIsBookSelectOpen] = useState(false);
  const [pendingBook, setPendingBook] = useState<number | null>(null);
  const activeChapterRef = useRef<HTMLButtonElement>(null);
  const chapterStripRef = useRef<HTMLDivElement>(null);
  const pendingBookRef = useRef<number | null>(null);
  const hasBootstrappedRef = useRef(false);
  const { book, chapter, setBook, setChapter } = useReaderLocation();
  const initialLocationRef = useRef({ book, chapter });

  useEffect(() => {
    let mounted = true;

    void waitForFonts().then(() => {
      if (mounted) {
        setAreFontsReady(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    void waitForOfflineReadiness().then(() => {
      if (mounted) {
        setIsOfflineReady(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const initialLocation = initialLocationRef.current;

    hasBootstrappedRef.current = true;

    void getReaderBootstrap(initialLocation.book, initialLocation.chapter)
      .then(({ books: bookSummaries, snapshot }) => {
        if (!mounted) {
          return;
        }

        setBooks(
          bookSummaries.map((book) => ({
            ...book,
            name: getBibleBookName(book.id),
          })),
        );
        setReaderSnapshot(snapshot);
        setHasLoadedBooks(true);

        if (!snapshot) {
          return;
        }

        if (snapshot.book !== initialLocation.book) {
          setBook(snapshot.book);
          return;
        }

        if (
          snapshot.chapter !== undefined &&
          snapshot.chapter !== initialLocation.chapter
        ) {
          setChapter(snapshot.chapter);
        }
      })
      .catch((error) => {
        console.error("[Bible] Unable to bootstrap reader", error);

        if (mounted) {
          setHasLoadedBooks(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, [setBook, setChapter]);

  useEffect(() => {
    let mounted = true;

    if (!hasBootstrappedRef.current || !hasLoadedBooks) {
      return;
    }

    if (readerSnapshot?.book === book && readerSnapshot.chapter === chapter) {
      return;
    }

    void getReaderSnapshot(book, chapter)
      .then((snapshot) => {
        if (mounted) {
          setReaderSnapshot(snapshot);

          if (pendingBookRef.current === snapshot.book) {
            pendingBookRef.current = null;
            setPendingBook(null);
            setIsBookSelectOpen(false);
          }

          if (snapshot.chapter !== undefined && snapshot.chapter !== chapter) {
            setChapter(snapshot.chapter);
          }
        }
      })
      .catch((error) => {
        console.error("[Bible] Unable to load reader snapshot", error);
      });

    return () => {
      mounted = false;
    };
  }, [book, chapter, hasLoadedBooks, readerSnapshot, setChapter]);

  useEffect(() => {
    if (books.length > 0 && !books.some((candidate) => candidate.id === book)) {
      setBook(books[0].id);
    }
  }, [book, books, setBook]);

  useEffect(() => {
    const activeChapter = activeChapterRef.current;
    const chapterStrip = chapterStripRef.current;

    if (!activeChapter || !chapterStrip) {
      return;
    }

    chapterStrip.scrollTo({
      behavior: "smooth",
      left:
        activeChapter.offsetLeft -
        (chapterStrip.clientWidth - activeChapter.offsetWidth) / 2,
    });
  }, [readerSnapshot]);

  useEffect(() => {
    if (
      isHydrated ||
      !areFontsReady ||
      !isOfflineReady ||
      !hasLoadedBooks ||
      books.length === 0 ||
      !readerSnapshot ||
      readerSnapshot.book !== book ||
      readerSnapshot.chapter !== chapter ||
      readerSnapshot.chapters.length === 0 ||
      readerSnapshot.verses.length === 0
    ) {
      return;
    }

    const timeoutId = setTimeout(
      () => setIsHydrated(true),
      MINIMUM_SPLASH_DURATION_MS,
    );

    return () => clearTimeout(timeoutId);
  }, [
    areFontsReady,
    book,
    books,
    chapter,
    hasLoadedBooks,
    isHydrated,
    isOfflineReady,
    readerSnapshot,
  ]);

  useEffect(() => {
    if (isHydrated) {
      onHydrated?.();
    }
  }, [isHydrated, onHydrated]);

  if (hasLoadedBooks && books.length === 0) {
    return <Navigate to="/" replace />;
  }

  if (!isHydrated) {
    return showSplash ? <SplashView /> : null;
  }

  return (
    <main>
      <Surface className="py-2.5 pt-3.5 border border-b">
        <div className="max-w-sm flex flex-col gap-2 w-full px-2 mx-auto">
          <Select
            className="rounded-md overflow-auto"
            isDisabled={books.length === 0}
            isOpen={isBookSelectOpen}
            value={readerSnapshot?.book ?? book}
            variant="secondary"
            onOpenChange={(isOpen) => {
              if (isOpen || pendingBook === null) {
                setIsBookSelectOpen(isOpen);
              }
            }}
            onChange={(bookId) => {
              if (bookId !== null) {
                const nextBook = Number(bookId);

                pendingBookRef.current = nextBook;
                setPendingBook(nextBook);
                setIsBookSelectOpen(true);
                setBook(nextBook);
              }
            }}
          >
            <Select.Trigger>
              <Select.Value>
                {() => getBibleBookName(readerSnapshot?.book ?? book)}
              </Select.Value>
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

          {readerSnapshot && readerSnapshot.chapters.length > 0 && (
            <ScrollShadow
              ref={chapterStripRef}
              hideScrollBar
              orientation="horizontal"
            >
              <div className="flex gap-2 py-1">
                {readerSnapshot.chapters.map((chapterNumber) => (
                  <Button
                    ref={
                      readerSnapshot.chapter === chapterNumber
                        ? activeChapterRef
                        : null
                    }
                    key={chapterNumber}
                    size="md"
                    className="rounded-md"
                    variant={
                      readerSnapshot.chapter === chapterNumber
                        ? "primary"
                        : "secondary"
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
        <ol className="flex flex-col gap-3 [content-visibility:auto]">
          {readerSnapshot?.verses.map((verse) => (
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

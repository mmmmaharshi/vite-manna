import { Button, ListBox, ScrollShadow, Select, Surface } from "@heroui/react";
import { useEffect, useState } from "react";

import { getBibleBookName } from "../bible/books";
import { db } from "../bible/db";
import { useReaderLocation } from "../bible/useReaderLocation";

interface BibleBook {
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
  const { book, chapter, setBook, setChapter } = useReaderLocation();

  useEffect(() => {
    let mounted = true;

    void db.verses
      .orderBy("book")
      .uniqueKeys()
      .then((bookIds) => {
        if (mounted) {
          setBooks(
            bookIds.map((bookId) => ({
              id: Number(bookId),
              name: getBibleBookName(Number(bookId)),
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

    void db.verses
      .where("book")
      .equals(book)
      .toArray()
      .then((verses) => {
        if (mounted) {
          setChapters({
            book,
            values: [...new Set(verses.map((verse) => verse.chapter))],
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

  const visibleChapters = chapters.book === book ? chapters.values : [];

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

  return (
    <Surface className="py-2.5 pt-3.5 border border-b">
      <main className="max-w-sm flex flex-col gap-2 w-full px-2 mx-auto">
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
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {books.map((book) => (
                <ListBox.Item id={book.id} key={book.id} textValue={book.name}>
                  {book.name}
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
      </main>
    </Surface>
  );
};

export default App;

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpFromSquare,
  Bookmark,
  Copy,
  TrashBin,
} from "@gravity-ui/icons";
import { Button, ScrollShadow, Surface, toast, Typography } from "@heroui/react";

import { getBibleBookName, type Bookmark as BookmarkType } from "../../shared/bible";
import { useReaderStore } from "../reader/store/readerStore";
import { useBookmarks } from "./hooks/useBookmarks";

interface BookmarksPageProps {
  onNavigateToReader: () => void;
}

function formatRef(book: number, chapter: number, verse: number) {
  return `${getBibleBookName(book)} ${chapter}:${verse}`;
}

function formatShareText(bms: BookmarkType[]) {
  return bms.map((bm) => `${formatRef(bm.book, bm.chapter, bm.verse)} ${bm.text}`).join("\n\n");
}

function canNativeShare() {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

const BookmarksPage = ({ onNavigateToReader }: BookmarksPageProps) => {
  const {
    bookmarks, clearAll, toggle,
  } = useBookmarks();

  /* ── Filters ── */
  const [filterBook, setFilterBook] = useState<number | null>(null);

  const uniqueBooks = useMemo(() => {
    const ids = new Set(bookmarks.map((bm) => bm.book));
    return [...ids].sort((a, b) => a - b);
  }, [bookmarks]);

  const filtered = useMemo(() => {
    if (filterBook !== null) return bookmarks.filter((bm) => bm.book === filterBook);
    return bookmarks;
  }, [bookmarks, filterBook]);

  /* ── Undo on remove ── */
  const removeWithUndo = (bm: BookmarkType) => {
    toggle({ id: bm.verseId, book: bm.book, chapter: bm.chapter, verse: bm.verse, text: bm.text });
    toast("Bookmark restored", { variant: "success" });
  };

  const handleShareAll = async () => {
    const text = formatShareText(filtered);
    if (!canNativeShare()) {
      toast("Sharing unsupported on this device", { variant: "warning" });
      return;
    }
    try {
      await navigator.share({ text });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      toast("Failed to share bookmarks", { variant: "danger" });
    }
  };

  const handleClearAll = () => {
    if (bookmarks.length === 0) return;
    clearAll();
    toast("All bookmarks deleted", { variant: "success" });
  };

  const handleNavigate = (bm: BookmarkType) => {
    const store = useReaderStore.getState();
    store.setBook(bm.book);
    store.setChapter(bm.chapter);
    store.setPermalinkVerse(bm.verse);
    onNavigateToReader();
  };

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main className="min-h-dvh">
      {/* Header */}
      <Surface className="sticky top-0 z-30 bg-surface py-3 border border-b">
        <div className="max-w-md w-full px-2 mx-auto flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Typography.Heading level={4}>Bookmarks</Typography.Heading>

          </div>
        </div>
      </Surface>

      {/* Book filter */}
      {bookmarks.length > 0 && uniqueBooks.length > 1 && (
        <div className="max-w-md w-full px-2 mx-auto pt-2">
          <ScrollShadow hideScrollBar orientation="horizontal">
            <div className="flex gap-2 pb-1">
              <Button size="sm" variant={filterBook === null ? "primary" : "secondary"}
                onPress={() => setFilterBook(null)}>
                All ({bookmarks.length})
              </Button>
              {uniqueBooks.map((bookId) => (
                <Button key={bookId} size="sm"
                  variant={filterBook === bookId ? "primary" : "secondary"}
                  onPress={() => setFilterBook(bookId)}>
                  {getBibleBookName(bookId)} ({bookmarks.filter((b) => b.book === bookId).length})
                </Button>
              ))}
            </div>
          </ScrollShadow>
        </div>
      )}

      {/* Empty state */}
      {bookmarks.length === 0 ? (
        <section className="max-w-md w-full px-2 py-24 mx-auto flex flex-col items-center gap-4 text-center">
          <Bookmark className="h-12 w-12 text-muted" />
          <Typography className="text-base font-medium">No bookmarks yet</Typography>
          <Typography.Paragraph size="sm" color="muted">
            Bookmark verses to quickly find them later
          </Typography.Paragraph>
        </section>
      ) : filtered.length === 0 ? (
        <section className="max-w-md w-full px-2 py-16 mx-auto text-center">
          <Typography.Paragraph size="sm" color="muted">
            No matching bookmarks
          </Typography.Paragraph>
        </section>
      ) : (
        /* Bookmark list */
        <section className="max-w-md w-full px-2 py-4 mx-auto flex flex-col gap-2">
          {filtered.map((bm) => (
            <Surface key={bm.verseId} className="flex flex-col p-3 gap-2">
              {/* Top row */}
              <div className="flex items-center gap-2">
                <button type="button" className="flex-1 min-w-0 text-left"
                  onClick={() => handleNavigate(bm)}>
                  <Typography className="text-sm font-medium text-accent">
                    {formatRef(bm.book, bm.chapter, bm.verse)}
                  </Typography>
                </button>
                <div className="flex gap-0.5 shrink-0">
                  <Button isIconOnly size="sm" variant="tertiary"
                    aria-label="Copy verse"
                    onPress={() => {
                      navigator.clipboard.writeText(`${formatRef(bm.book, bm.chapter, bm.verse)} ${bm.text}`)
                        .then(() => toast("Verse copied to clipboard", { variant: "success" }));
                    }}>
                    <Copy aria-hidden="true" className="h-3.5 w-3.5 text-muted" />
                  </Button>
                  <Button isIconOnly size="sm" variant="tertiary"
                    aria-label="Remove bookmark"
                    onPress={() => removeWithUndo(bm)}>
                    <TrashBin aria-hidden="true" className="h-3.5 w-3.5 text-muted" />
                  </Button>
                </div>
              </div>

              {/* Verse text */}
              <Typography.Paragraph size="sm" color="muted" className="line-clamp-3">
                {bm.text}
              </Typography.Paragraph>


            </Surface>
          ))}
        </section>
      )}

      {/* Bottom action bar */}
      {bookmarks.length > 0 && filtered.length > 0 && (
        <div className="max-w-md w-full px-2 mx-auto pt-1 pb-20 flex gap-2 justify-center">
          <Button size="sm" variant="tertiary" onPress={handleClearAll}>
            <TrashBin aria-hidden="true" className="h-4 w-4" />
            Delete All
          </Button>
          {canNativeShare() && (
            <Button size="sm" variant="tertiary" onPress={handleShareAll}>
              <ArrowUpFromSquare aria-hidden="true" className="h-4 w-4" />
              Share All
            </Button>
          )}
        </div>
      )}
    </main>
  );
};

export default BookmarksPage;

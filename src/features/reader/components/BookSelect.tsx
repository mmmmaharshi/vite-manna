import { memo } from "react";
import { Header, ListBox, Select, Separator } from "@heroui/react";
import { cn } from "../../../shared/lib/cn";

import { getBibleBookName } from "../../../shared/bible";
import { useReaderStore } from "../store/readerStore";
import type { BibleBook } from "../types";

interface BookSelectProps {
  books: BibleBook[];
  value: number;
  visibleBookSummary: BibleBook | undefined;
  className?: string;
}

const OT_BOOK_COUNT = 39;

function renderBookItem(book: BibleBook) {
  return (
    <ListBox.Item id={book.id} key={book.id} textValue={book.name}>
      <div className="flex flex-col gap-1">
        <span>{book.name}</span>
        <span className="text-xs text-muted">{book.chapterCount} అధ్యాయాలు</span>
      </div>
      <ListBox.ItemIndicator />
    </ListBox.Item>
  );
}

const BookSelect = memo(({ books, value, visibleBookSummary, className }: BookSelectProps) => {
  const isBookSelectOpen = useReaderStore((state) => state.isBookSelectOpen);
  const setBookSelectOpen = useReaderStore(
    (state) => state.setBookSelectOpen,
  );
  const selectBook = useReaderStore((state) => state.selectBook);

  const otBooks = books.filter((b) => b.id <= OT_BOOK_COUNT);
  const ntBooks = books.filter((b) => b.id > OT_BOOK_COUNT);

  return (
    <Select
      aria-label="Select book"
      className={cn("overflow-auto", className)}
      isDisabled={books.length === 0}
      isOpen={isBookSelectOpen}
      value={value}
      variant="secondary"
      onOpenChange={setBookSelectOpen}
      onChange={(bookId) => {
        if (bookId === null) return;
        selectBook(Number(bookId));
      }}
    >
      <Select.Trigger>
        <Select.Value>
          {({ isPlaceholder }) => {
            if (isPlaceholder) return null;

            return (
              <span className="flex flex-col gap-1">
                <span>{getBibleBookName(value)}</span>
                {visibleBookSummary && (
                  <span className="text-xs text-muted">{visibleBookSummary.chapterCount} అధ్యాయాలు</span>
                )}
              </span>
            );
          }}
        </Select.Value>
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          <ListBox.Section>
            <Header>Old Testament</Header>
            {otBooks.map(renderBookItem)}
          </ListBox.Section>
          <Separator />
          <ListBox.Section>
            <Header>New Testament</Header>
            {ntBooks.map(renderBookItem)}
          </ListBox.Section>
        </ListBox>
      </Select.Popover>
    </Select>
  );
});

export default BookSelect;

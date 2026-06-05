import { memo } from "react";
import { ListBox, Select } from "@heroui/react";
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

const BookSelect = memo(({ books, value, visibleBookSummary, className }: BookSelectProps) => {
  const isBookSelectOpen = useReaderStore((state) => state.isBookSelectOpen);
  const setBookSelectOpen = useReaderStore(
    (state) => state.setBookSelectOpen,
  );
  const selectBook = useReaderStore((state) => state.selectBook);

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
        if (bookId === null) {
          return;
        }

        selectBook(Number(bookId));
      }}
    >
      <Select.Trigger>
        <Select.Value>
          {({ isPlaceholder }) => {
            if (isPlaceholder) {
              return null;
            }

            return (
              <span className="flex flex-col gap-1">
                <span>{getBibleBookName(value)}</span>
                {visibleBookSummary && (
                  <span className="text-xs text-muted">
                    {visibleBookSummary.chapterCount} అధ్యాయాలు
                  </span>
                )}
              </span>
            );
          }}
        </Select.Value>
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox >
          {books.map((book) => (
            <ListBox.Item
              id={book.id}
              key={book.id}
              textValue={book.name}
            >
              <div className="flex flex-col gap-1">
                <span>{book.name}</span>
                <span className="text-xs text-muted">
                  {book.chapterCount} అధ్యాయాలు
                </span>
              </div>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
});

export default BookSelect;

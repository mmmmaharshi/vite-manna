import { ListBox, Select } from "@heroui/react";

import { getBibleBookName } from "../bible/books";
import type { BibleBook } from "../reader/useReader";

interface BookSelectProps {
  books: BibleBook[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelectBook: (bookId: number) => void;
  pendingBook: number | null;
  value: number;
  visibleBookSummary: BibleBook | undefined;
}

const BookSelect = ({
  books,
  isOpen,
  onOpenChange,
  onSelectBook,
  pendingBook,
  value,
  visibleBookSummary,
}: BookSelectProps) => (
  <Select
    className="rounded-md overflow-auto"
    isDisabled={books.length === 0}
    isOpen={isOpen}
    value={value}
    variant="secondary"
    onOpenChange={(nextIsOpen) => {
      if (pendingBook !== null) {
        onOpenChange(true);
        return;
      }

      onOpenChange(nextIsOpen);
    }}
    onChange={(bookId) => {
      if (bookId === null) {
        return;
      }

      onSelectBook(Number(bookId));
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
    <Select.Popover >
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

export default BookSelect;

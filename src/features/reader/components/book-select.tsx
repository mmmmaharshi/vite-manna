import { Header, ListBox, Select, Separator } from "@heroui/react";
import { memo } from "react";

import {
  OLD_TESTAMENT_BOOK_COUNT,
  getBibleBookName,
} from "../../../shared/bible";
import type { NamedBook } from "../../../shared/bible";
import { cn } from "../../../shared/lib/cn";
import { useReaderStore } from "../store/reader-store";

interface BookSelectProps {
  books: Array<NamedBook>;
  value: number;
  visibleBookSummary: NamedBook | undefined;
  className?: string;
}

const scrollSelectedBookIntoView = () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document
        .querySelector('[role="listbox"] [role="option"][aria-selected="true"]')
        ?.scrollIntoView({ block: "center" });
    });
  });
};

const renderBookItem = (book: NamedBook) => (
  <ListBox.Item
    id={book.id}
    key={book.id}
    textValue={book.name}
    className="data-[focused=true]:bg-accent/10 data-[selected=true]:bg-accent/15 rounded-lg"
  >
    {({ isSelected }) => (
      <div className="flex flex-col gap-1">
        <span className={cn(isSelected && "text-accent font-semibold")}>
          {book.name}
        </span>
        <span className="text-muted text-xs">{book.chapterCount} అధ్యాయాలు</span>
      </div>
    )}
  </ListBox.Item>
);

const BookSelectComponent = ({
  books,
  value,
  visibleBookSummary,
  className,
}: BookSelectProps) => {
  const isBookSelectOpen = useReaderStore((state) => state.isBookSelectOpen);
  const openBookSelect = useReaderStore((state) => state.openBookSelect);
  const closeBookSelect = useReaderStore((state) => state.closeBookSelect);
  const selectBook = useReaderStore((state) => state.selectBook);

  const otBooks = books.filter((b) => b.id <= OLD_TESTAMENT_BOOK_COUNT);
  const ntBooks = books.filter((b) => b.id > OLD_TESTAMENT_BOOK_COUNT);

  return (
    <Select
      aria-label="Select book"
      className={cn("overflow-auto", className)}
      isDisabled={books.length === 0}
      isOpen={isBookSelectOpen}
      value={value}
      variant="secondary"
      onOpenChange={(open) => {
        if (open) {
          openBookSelect();
        } else {
          closeBookSelect();
        }

        if (open) {
          scrollSelectedBookIntoView();
        }
      }}
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
                  <span className="text-muted text-xs">
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
};

const BookSelect = memo(BookSelectComponent);

export default BookSelect;

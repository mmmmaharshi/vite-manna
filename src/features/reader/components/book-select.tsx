import { Header, ListBox, Select, Separator } from "@heroui/react";
import { memo } from "react";

import { getBibleBookName } from "../../../shared/bible";
import { cn } from "../../../shared/lib/cn";
import { useReaderStore } from "../store/reader-store";
import type { BibleBook } from "../types";

interface BookSelectProps {
  books: BibleBook[];
  value: number;
  visibleBookSummary: BibleBook | undefined;
  className?: string;
}

const OT_BOOK_COUNT = 39;

const scrollSelectedBookIntoView = () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document
        .querySelector('[role="listbox"] [role="option"][aria-selected="true"]')
        ?.scrollIntoView({ block: "center" });
    });
  });
};

const renderBookItem = (book: BibleBook) => (
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
  const setBookSelectOpen = useReaderStore((state) => state.setBookSelectOpen);
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
      onOpenChange={(open) => {
        setBookSelectOpen(open);

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

import { memo, useCallback, useEffect, useState } from "react";

import { cn } from "../../shared/lib/cn";
import { getBibleBookName, getOverallProgress, getReadChapters, getBookChapterCounts } from "../../shared/bible";
import { Modal, ScrollShadow, Surface, Typography } from "@heroui/react";

interface BookProgress {
  book: number;
  name: string;
  read: number;
  total: number;
  percentage: number;
}

interface TestamentData {
  read: number;
  total: number;
  percentage: number;
  books: BookProgress[];
}

const OT_START = 1;
const OT_END = 39;

interface TestamentProgressProps {
  data: TestamentData | null;
  label: string;
  onClick: () => void;
}

const TestamentProgress = memo(function TestamentProgress({ data, label, onClick }: TestamentProgressProps) {
  const completedCount = data ? data.books.filter((b) => b.read === b.total).length : 0;
  return (
    <button type="button" className="w-full text-left" onClick={onClick}>
      <div className="rounded-lg border bg-field-background p-2.5 cursor-pointer hover:opacity-80 transition-opacity">
        <div className="flex items-center justify-between mb-1">
          <Typography className="text-sm font-medium">{label}</Typography>
          {data && (
            <Typography className="text-xs text-muted">
              {data.read}/{data.total}
            </Typography>
          )}
        </div>
        <div className="flex items-center gap-2">
          {data && (
            <div className="h-2.5 flex-1 rounded-full bg-muted/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                style={{ width: `${data.percentage * 100}%` }}
              />
            </div>
          )}
          {completedCount > 0 && (
            <Typography className="text-xs text-success shrink-0">✓ {completedCount}</Typography>
          )}
        </div>
      </div>
    </button>
  );
});

export const ReadingProgressCard = () => {
  const [overall, setOverall] = useState<{ read: number; total: number; percentage: number } | null>(null);
  const [ot, setOt] = useState<TestamentData | null>(null);
  const [nt, setNt] = useState<TestamentData | null>(null);
  const [modalTestament, setModalTestament] = useState<"ot" | "nt" | null>(null);
  const openOt = useCallback(() => setModalTestament("ot"), []);
  const openNt = useCallback(() => setModalTestament("nt"), []);

  useEffect(() => {
    (async () => {
      const [overallResult, counts] = await Promise.all([
        getOverallProgress(),
        getBookChapterCounts(),
      ]);
      setOverall(overallResult);

      const readResults = await Promise.all(
        [...counts].map(async ([book, total]) => {
          const readEntries = await getReadChapters(book);
          return { book, total, read: readEntries.length };
        }),
      );

      const otBooks: BookProgress[] = [];
      const ntBooks: BookProgress[] = [];
      let otRead = 0, otTotal = 0;
      let ntRead = 0, ntTotal = 0;

      for (const { book, total, read } of readResults) {
        const bp: BookProgress = {
          book,
          name: getBibleBookName(book),
          read,
          total,
          percentage: total > 0 ? read / total : 0,
        };
        if (book >= OT_START && book <= OT_END) {
          otBooks.push(bp);
          otRead += read;
          otTotal += total;
        } else {
          ntBooks.push(bp);
          ntRead += read;
          ntTotal += total;
        }
      }

      otBooks.sort((a, b) => a.book - b.book);
      ntBooks.sort((a, b) => a.book - b.book);

      setOt({
        read: otRead, total: otTotal,
        percentage: otTotal > 0 ? otRead / otTotal : 0,
        books: otBooks,
      });
      setNt({
        read: ntRead, total: ntTotal,
        percentage: ntTotal > 0 ? ntRead / ntTotal : 0,
        books: ntBooks,
      });
    })();
  }, []);

  const activeTestament = modalTestament === "ot" ? ot : nt;

  return (
    <>
      <Surface className="p-3">
        <Typography className="text-sm font-medium mb-2">Reading Progress</Typography>
        {overall === null ? (
          <div className="flex flex-col gap-2">
            <div className="skeleton-shimmer h-4 w-full rounded" />
            <div className="skeleton-shimmer h-10 w-full rounded" />
            <div className="skeleton-shimmer h-10 w-full rounded" />
          </div>
        ) : (
          <>
            <div className="mb-2.5">
              <div className="flex items-center justify-between mb-1">
                <Typography className="text-xs text-muted">Total</Typography>
                <Typography className="text-xs text-muted">
                  {overall.read}/{overall.total}
                </Typography>
              </div>
              <div className="h-3 rounded-full bg-muted/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                  style={{ width: `${overall.percentage * 100}%` }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <TestamentProgress data={ot} label="Old Testament" onClick={openOt} />
              <TestamentProgress data={nt} label="New Testament" onClick={openNt} />
            </div>
          </>
        )}
      </Surface>

      <Modal.Backdrop isOpen={modalTestament !== null} onOpenChange={(open) => { if (!open) setModalTestament(null); }}>
        <Modal.Container scroll="inside">
          <Modal.Dialog className="sm:max-w-md max-h-dvh">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                {modalTestament === "ot" ? "Old Testament" : "New Testament"}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="p-0">
              <ScrollShadow className="max-h-[60vh] px-6 py-4" hideScrollBar>
                {activeTestament && (
                  <div className="flex flex-col gap-2">
                    {activeTestament.books.map((b) => {
                      const isComplete = b.read === b.total;
                      return (
                        <div key={b.book} className="flex items-center gap-2">
                          {isComplete && <span className="text-xs text-success shrink-0">✓</span>}
                          <Typography className={cn("text-sm flex-1 truncate", isComplete && "text-success")}>
                            {b.name}
                          </Typography>
                          <div className="h-1.5 w-20 rounded-full bg-muted/20 overflow-hidden shrink-0">
                            <div className={cn("h-full rounded-full transition-all duration-1000 ease-out", isComplete ? "bg-success" : "bg-primary/60")} style={{ width: `${b.percentage * 100}%` }} />
                          </div>
                          <Typography className="text-xs text-muted w-10 text-right shrink-0">
                            {b.read}/{b.total}
                          </Typography>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollShadow>
            </Modal.Body>
            <Modal.Footer>
              <div className="flex items-center justify-between w-full">
                {activeTestament && (
                  <>
                    <Typography className="text-xs text-muted">
                      {activeTestament.read} / {activeTestament.total} chapters
                    </Typography>
                    {(() => {
                      const completed = activeTestament.books.filter((b) => b.read === b.total).length;
                      return completed > 0 ? (
                        <Typography className="text-xs text-success">
                          {completed} book{completed > 1 ? "s" : ""} completed ✓
                        </Typography>
                      ) : null;
                    })()}
                  </>
                )}
              </div>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
};

import { Bookmark } from "@gravity-ui/icons";
import { Surface, Typography } from "@heroui/react";

const BookmarksPage = () => (
  <main className="min-h-dvh">
    <Surface className="sticky top-0 z-30 bg-surface py-3 border border-b">
      <div className="max-w-md w-full px-2 mx-auto">
        <Typography.Heading level={4}>Bookmarks</Typography.Heading>
      </div>
    </Surface>
    <section className="max-w-md w-full px-2 py-24 mx-auto flex flex-col items-center gap-4 text-center">
      <Bookmark className="h-12 w-12 text-muted" />
      <Typography className="text-base font-medium">No bookmarks yet</Typography>
      <Typography.Paragraph size="sm" color="muted">
        Bookmark verses to quickly find them later
      </Typography.Paragraph>
    </section>
  </main>
);

export default BookmarksPage;

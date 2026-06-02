import { Magnifier } from "@gravity-ui/icons";
import { Surface, Typography } from "@heroui/react";

const SearchPage = () => (
  <main className="min-h-dvh">
    <Surface className="sticky top-0 z-30 py-3 border border-b">
      <div className="max-w-md w-full px-2 mx-auto">
        <Typography.Heading level={4}>Search</Typography.Heading>
      </div>
    </Surface>
    <section className="max-w-md w-full px-2 py-24 mx-auto flex flex-col items-center gap-2 text-center">
      <Magnifier className="h-12 w-12 text-muted" />
      <Typography className="text-base font-medium">Search Bible</Typography>
      <Typography.Paragraph size="sm" color="muted">
        Search verses, chapters, and books
      </Typography.Paragraph>
    </section>
  </main>
);

export default SearchPage;

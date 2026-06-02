import { Magnifier } from "@gravity-ui/icons";
import { Surface, Typography } from "@heroui/react";

const SearchPage = () => (
  <main className="min-h-dvh">
    <Surface className="sticky top-0 z-30 bg-surface py-3 border border-b">
      <div className="max-w-sm w-full px-2 mx-auto">
        <Typography className="text-lg font-semibold">Search</Typography>
      </div>
    </Surface>
    <section className="max-w-sm w-full px-2 py-24 mx-auto flex flex-col items-center gap-2 text-center">
      <Magnifier className="h-12 w-12 text-muted" />
      <Typography className="text-base font-medium">Search Bible</Typography>
      <Typography className="text-sm text-muted">
        Search verses, chapters, and books
      </Typography>
    </section>
  </main>
);

export default SearchPage;

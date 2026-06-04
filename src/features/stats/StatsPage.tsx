import { ScrollShadow, Surface, Typography } from "@heroui/react";

import { ReadingProgressCard } from "../settings/ReadingProgressCard";
import { ContinueReadingCard } from "./ContinueReadingCard";
import { StreakCard } from "./StreakCard";

interface StatsPageProps {
  onNavigateToReader: () => void;
}

const StatsPage = ({ onNavigateToReader }: StatsPageProps) => {
  return (
    <main id="main-content" className="h-dvh flex flex-col">
      <Surface className="sticky top-0 z-30 bg-surface py-3 border border-b">
        <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl w-full px-2 mx-auto">
          <Typography.Heading level={1} className="text-xl">Progress</Typography.Heading>
        </div>
      </Surface>

      <ScrollShadow hideScrollBar className="flex-1">
        <section className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl w-full px-2 py-4 mx-auto flex flex-col gap-2">
          <ContinueReadingCard onNavigate={onNavigateToReader} />
          <StreakCard />
          <ReadingProgressCard />
        </section>
        <div className="h-[calc(4rem+env(safe-area-inset-bottom))]" />
      </ScrollShadow>
    </main>
  );
};

export default StatsPage;

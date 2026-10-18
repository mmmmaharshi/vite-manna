import { Spinner } from "@heroui/react";
import { lazy, Suspense, useCallback, useState } from "react";
import { useSearchParams } from "react-router";

import { ReaderScreen } from "../features/reader";
import { useReaderStore } from "../features/reader/store/reader-store";
import InstallPrompt from "../features/update/install-prompt";
import UpdatePrompt from "../features/update/update-prompt";
import { cn } from "../shared/lib/cn";
import BottomNav from "./bottom-nav";
import type { TabId } from "./bottom-nav";

const HighlightsPage = lazy(
  () => import("../features/highlights/highlights-page")
);
const SearchPage = lazy(() => import("../features/search/search-page"));
const SettingsPage = lazy(() => import("../features/settings/settings-page"));

const pageFallback = (
  <div className="flex min-h-dvh items-center justify-center">
    <Spinner size="lg" aria-label="Loading" />
  </div>
);

const TabLayout = () => {
  const [activeTab, setActiveTab] = useState<TabId>("reader");
  const [searchParams, setSearchParams] = useSearchParams();

  const handleTabChange = useCallback(
    (tab: TabId) => {
      setActiveTab(tab);

      if (tab !== "reader") {
        useReaderStore.getState().setPermalinkVerse(null);

        const next = new URLSearchParams(searchParams);
        next.delete("verse");
        setSearchParams(next, { replace: true });
      }
    },
    [searchParams, setSearchParams]
  );

  return (
    <div className="mx-auto min-h-dvh max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
      <div className={cn(activeTab !== "reader" && "hidden")}>
        <ReaderScreen />
      </div>
      {activeTab === "search" && (
        <Suspense fallback={pageFallback}>
          <SearchPage onNavigateToReader={() => setActiveTab("reader")} />
        </Suspense>
      )}
      {activeTab === "highlights" && (
        <Suspense fallback={pageFallback}>
          <HighlightsPage onNavigateToReader={() => setActiveTab("reader")} />
        </Suspense>
      )}
      {activeTab === "settings" && (
        <Suspense fallback={pageFallback}>
          <SettingsPage />
        </Suspense>
      )}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col gap-2 p-4 pb-20">
        <div className="pointer-events-auto">
          <InstallPrompt />
        </div>
        <div className="pointer-events-auto">
          <UpdatePrompt />
        </div>
      </div>
    </div>
  );
};

export default TabLayout;

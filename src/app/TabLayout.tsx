import { lazy, Suspense, useCallback, useState } from "react";
import { Spinner } from "@heroui/react";
import { useSearchParams } from "react-router";

import { cn } from "../shared/lib/cn";
import { ReaderScreen } from "../features/reader";
import { useReaderStore } from "../features/reader/store/readerStore";
import BottomNav from "./BottomNav";
import type { TabId } from "./BottomNav";

const HighlightsPage = lazy(() => import("../features/highlights/HighlightsPage"));
const SearchPage = lazy(() => import("../features/search/SearchPage"));
const SettingsPage = lazy(() => import("../features/settings/SettingsPage"));

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
    [searchParams, setSearchParams],
  );

  return (
    <div className="min-h-dvh max-w-md mx-auto sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
      <div className={cn(activeTab !== "reader" && "hidden")}>
        <ReaderScreen />
      </div>
      {activeTab === "search" && (
        <Suspense fallback={<div className="min-h-dvh flex items-center justify-center"><Spinner size="lg" aria-label="Loading" /></div>}>
          <SearchPage onNavigateToReader={() => setActiveTab("reader")} />
        </Suspense>
      )}
      {activeTab === "highlights" && (
        <Suspense fallback={<div className="min-h-dvh flex items-center justify-center"><Spinner size="lg" aria-label="Loading" /></div>}>
          <HighlightsPage onNavigateToReader={() => setActiveTab("reader")} />
        </Suspense>
      )}
      {activeTab === "settings" && (
        <Suspense fallback={<div className="min-h-dvh flex items-center justify-center"><Spinner size="lg" aria-label="Loading" /></div>}>
          <SettingsPage />
        </Suspense>
      )}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default TabLayout;

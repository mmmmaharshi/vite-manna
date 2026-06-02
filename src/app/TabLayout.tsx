import { lazy, Suspense, useCallback, useState } from "react";
import { useSearchParams } from "react-router";

import { ReaderScreen } from "../features/reader";
import { useReaderStore } from "../features/reader/store/readerStore";
import BottomNav from "./BottomNav";
import type { TabId } from "./BottomNav";

const BookmarksPage = lazy(() => import("../features/bookmarks/BookmarksPage"));
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
    <div className="min-h-dvh max-w-md mx-auto">
      <div className={activeTab === "reader" ? "" : "hidden"}>
        <ReaderScreen />
      </div>
      {activeTab === "search" && (
        <Suspense fallback={null}>
          <SearchPage onNavigateToReader={() => setActiveTab("reader")} />
        </Suspense>
      )}
      {activeTab === "bookmarks" && (
        <Suspense fallback={null}>
          <BookmarksPage onNavigateToReader={() => setActiveTab("reader")} />
        </Suspense>
      )}
      {activeTab === "settings" && (
        <Suspense fallback={null}>
          <SettingsPage />
        </Suspense>
      )}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default TabLayout;

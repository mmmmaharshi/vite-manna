import { useCallback, useState } from "react";
import { useSearchParams } from "react-router";

import { ReaderScreen } from "../features/reader";
import { useReaderStore } from "../features/reader/store/readerStore";
import BookmarksPage from "../features/bookmarks/BookmarksPage";
import SearchPage from "../features/search/SearchPage";
import BottomNav from "./BottomNav";
import type { TabId } from "./BottomNav";

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
      {activeTab === "search" && <SearchPage />}
      {activeTab === "bookmarks" && <BookmarksPage />}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default TabLayout;

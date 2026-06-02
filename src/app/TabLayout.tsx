import { useState } from "react";

import { ReaderScreen } from "../features/reader";
import BookmarksPage from "../features/bookmarks/BookmarksPage";
import SearchPage from "../features/search/SearchPage";
import BottomNav from "./BottomNav";
import type { TabId } from "./BottomNav";

const TabLayout = () => {
  const [activeTab, setActiveTab] = useState<TabId>("reader");

  return (
    <div className="min-h-dvh">
      {activeTab === "reader" && <ReaderScreen />}
      {activeTab === "search" && <SearchPage />}
      {activeTab === "bookmarks" && <BookmarksPage />}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default TabLayout;

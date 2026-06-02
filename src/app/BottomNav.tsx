import { Book, Bookmark, Magnifier } from "@gravity-ui/icons";
import { Button } from "@heroui/react";

export type TabId = "reader" | "search" | "bookmarks";

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; Icon: typeof Book }[] = [
  { id: "reader", label: "Reading", Icon: Book },
  { id: "search", label: "Search", Icon: Magnifier },
  { id: "bookmarks", label: "Bookmarks", Icon: Bookmark },
];

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => (
  <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface pb-[max(0.25rem,env(safe-area-inset-bottom))]">
    <div className="flex items-center justify-around">
      {TABS.map(({ id, label, Icon }) => {
        const isActive = id === activeTab;
        return (
          <Button
            key={id}
            variant="tertiary"
            className="flex h-auto min-w-0 flex-col gap-0.5 px-4 py-1.5"
            onPress={() => onTabChange(id)}
          >
            <Icon className={`h-5 w-5 ${isActive ? "text-accent" : "text-muted"}`} />
            <span
              className={`text-[10px] leading-none ${isActive ? "text-accent" : "text-muted"}`}
            >
              {label}
            </span>
          </Button>
        );
      })}
    </div>
  </nav>
);

export default BottomNav;

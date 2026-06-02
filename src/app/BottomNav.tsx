import { Book, Bookmark, Magnifier, Moon, Sun } from "@gravity-ui/icons";
import { Button, Surface } from "@heroui/react";

import { useTheme } from "../shared/hooks/useTheme";

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

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Surface className="max-w-md mx-auto fixed inset-x-0 bottom-0 z-20 border-t border pb-[max(0.25rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = id === activeTab;
          return (
            <Button
              key={id}
              variant="ghost"
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
        <Button
          variant="ghost"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="flex h-auto min-w-0 flex-col gap-0.5 px-4 py-1.5"
          onPress={toggleTheme}
        >
          {isDark
            ? <Sun className="h-5 w-5 text-muted" />
            : <Moon className="h-5 w-5 text-muted" />}
          <span className="text-[10px] leading-none text-muted">
            {isDark ? "Light" : "Dark"}
          </span>
        </Button>
      </div>
    </Surface>
  );
};

export default BottomNav;

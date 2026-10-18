import { Book, Gear, Magnifier, PencilToSquare } from "@gravity-ui/icons";
import { Button, Surface } from "@heroui/react";

import { cn } from "../shared/lib/cn";

export type TabId = "reader" | "search" | "highlights" | "settings";

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; Icon: typeof Book }[] = [
  { Icon: Book, id: "reader", label: "Reading" },
  { Icon: Magnifier, id: "search", label: "Search" },
  { Icon: PencilToSquare, id: "highlights", label: "Highlights" },
  { Icon: Gear, id: "settings", label: "Settings" },
];

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => (
  <Surface className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border border-t pb-[max(0.25rem,env(safe-area-inset-bottom))] sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
    <nav
      aria-label="Main navigation"
      className="flex items-center justify-around"
    >
      {TABS.map(({ id, label, Icon }) => {
        const isActive = id === activeTab;
        return (
          <Button
            key={id}
            variant="ghost"
            aria-current={isActive ? "page" : undefined}
            className="flex h-auto min-h-14 min-w-0 flex-col gap-0.5 px-3 py-2"
            onPress={() => onTabChange(id)}
          >
            <Icon
              aria-hidden="true"
              className={cn("h-5 w-5", isActive ? "text-accent" : "text-muted")}
            />
            <span
              className={cn(
                "text-xs leading-none",
                isActive ? "text-accent" : "text-muted"
              )}
            >
              {label}
            </span>
          </Button>
        );
      })}
    </nav>
  </Surface>
);

export default BottomNav;

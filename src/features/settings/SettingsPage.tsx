import { useEffect } from "react";
import { Moon, Sun } from "@gravity-ui/icons";
import { Button, Surface, Typography } from "@heroui/react";

import { useTheme } from "../../shared/hooks/useTheme";

const SettingsPage = () => {
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main className="min-h-dvh">
      <Surface className="sticky top-0 z-30 bg-surface py-3 border border-b">
        <div className="max-w-md w-full px-2 mx-auto">
          <Typography.Heading level={4}>Settings</Typography.Heading>
        </div>
      </Surface>

      <section className="max-w-md w-full px-2 py-4 mx-auto flex flex-col gap-2">
        <Surface className="flex items-center justify-between p-3">
          <div>
            <Typography className="text-sm font-medium">Dark Mode</Typography>
            <Typography.Paragraph size="sm" color="muted">
              Switch between light and dark appearance
            </Typography.Paragraph>
          </div>
          <Button
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            isIconOnly
            size="sm"
            variant="tertiary"
            onPress={toggleTheme}
          >
            {isDark
              ? <Sun aria-hidden="true" className="h-4 w-4" />
              : <Moon aria-hidden="true" className="h-4 w-4" />}
          </Button>
        </Surface>
      </section>
    </main>
  );
};

export default SettingsPage;

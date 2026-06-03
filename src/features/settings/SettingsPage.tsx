import { useEffect } from "react";
import { Moon, Sun } from "@gravity-ui/icons";
import { Button, Surface, Typography } from "@heroui/react";

import { useTheme } from "../../shared/hooks/useTheme";
import { useReaderStore, type FontSize } from "../reader/store/readerStore";

const OPTIONS: { mode: "light" | "dark" | "system"; label: string; Icon: typeof Sun }[] = [
  { mode: "light", label: "Light", Icon: Sun },
  { mode: "dark", label: "Dark", Icon: Moon },
  { mode: "system", label: "System", Icon: () => (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1v2M8 13v2M2.05 2.05l1.41 1.41M12.54 12.54l1.41 1.41M1 8h2M13 8h2M2.05 13.95l1.41-1.41M12.54 3.46l1.41-1.41" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </svg>
  )},
];

const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: "sm", label: "S" },
  { value: "base", label: "M" },
  { value: "lg", label: "L" },
  { value: "xl", label: "XL" },
  { value: "2xl", label: "2XL" },
];

const SettingsPage = () => {
  const { mode, setMode } = useTheme();
  const fontSize = useReaderStore((state) => state.fontSize);
  const setFontSize = useReaderStore((state) => state.setFontSize);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main className="min-h-dvh">
      <Surface className="sticky top-0 z-30 bg-surface py-3 border border-b">
        <div className="max-w-md w-full px-2 mx-auto">
          <Typography.Heading level={1} className="text-xl">Settings</Typography.Heading>
        </div>
      </Surface>

      <section className="max-w-md w-full px-2 py-4 mx-auto flex flex-col gap-2">
        <Surface className="p-3">
          <Typography className="text-sm font-medium mb-2">Appearance</Typography>
          <div className="flex gap-2">
            {OPTIONS.map(({ mode: m, label, Icon }) => (
              <Button
                key={m}
                variant={mode === m ? "primary" : "secondary"}
                size="sm"
                className="flex-1"
                onPress={() => setMode(m)}
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </Surface>

        <Surface className="p-3">
          <Typography className="text-sm font-medium mb-2">Font Size</Typography>
          <div className="flex gap-2">
            {FONT_SIZES.map(({ value, label }) => (
              <Button
                key={value}
                variant={fontSize === value ? "primary" : "secondary"}
                size="sm"
                className="flex-1"
                onPress={() => setFontSize(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </Surface>
      </section>
    </main>
  );
};

export default SettingsPage;

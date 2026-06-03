import { useCallback, useEffect, useState } from "react";
import { ArrowRotateLeft, Bell, Moon, Sun } from "@gravity-ui/icons";
import { Button, Surface, Tooltip, Typography } from "@heroui/react";

import { useTheme } from "../../shared/hooks/useTheme";
import { useReaderStore, type FontSize } from "../reader/store/readerStore";

const OPTIONS: { mode: "light" | "dark" | "system"; label: string; Icon: typeof Sun }[] = [
  { mode: "light", label: "Light", Icon: Sun },
  { mode: "dark", label: "Dark", Icon: Moon },
  {
    mode: "system", label: "System", Icon: () => (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="8" cy="8" r="3" />
        <path d="M8 1v2M8 13v2M2.05 2.05l1.41 1.41M12.54 12.54l1.41 1.41M1 8h2M13 8h2M2.05 13.95l1.41-1.41M12.54 3.46l1.41-1.41" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      </svg>
    )
  },
];

const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: "sm", label: "S" },
  { value: "base", label: "M" },
  { value: "lg", label: "L" },
  { value: "xl", label: "XL" },
  { value: "2xl", label: "2XL" },
];

const SIZE_PROPS: Record<FontSize, { type: "body-sm" | "body" | "h5" | "h4" | "h3"; weight?: "normal" }> = {
  sm: { type: "body-sm" },
  base: { type: "body" },
  lg: { type: "h5", weight: "normal" },
  xl: { type: "h4", weight: "normal" },
  "2xl": { type: "h3", weight: "normal" },
};

const PREVIEW_TEXT = "ఆదియందు దేవుడు ఆకాశమును భూమిని సృష్టించెను. భూమి నిరాకారముగా నిర్జనముగా ఉండెను. అగాధజలముల మీదను అంధకారము కమ్ముకొని యుండెను. దేవుని ఆత్మ జలముల మీద కదలాడుచుండెను. అప్పుడు దేవుడు వెలుగు కలుగునని చెప్పగా వెలుగు కలిగెను.";

const SettingsPage = () => {
  const { mode, setMode } = useTheme();
  const fontSize = useReaderStore((state) => state.fontSize);
  const setFontSize = useReaderStore((state) => state.setFontSize);
  const [notifSupported, setNotifSupported] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.ready.then((reg) => {
      const ps = (reg as unknown as { periodicSync: { getTags: () => Promise<string[]> } }).periodicSync;
      if (!ps) return;
      setNotifSupported(true);
      ps.getTags().then((tags: string[]) => {
        if (tags.includes("daily-verse")) setNotifEnabled(true);
      });
    });
  }, []);

  const toggleNotifications = useCallback(async () => {
    if (notifEnabled) {
      const reg = await navigator.serviceWorker.ready;
      await (reg as unknown as { periodicSync: { unregister: (tag: string) => Promise<void> } }).periodicSync.unregister("daily-verse");
      setNotifEnabled(false);
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return;
    const reg = await navigator.serviceWorker.ready;
    await (reg as unknown as { periodicSync: { register: (tag: string, opts: { minInterval: number }) => Promise<void> } }).periodicSync.register("daily-verse", {
      minInterval: 24 * 60 * 60 * 1000,
    });
    setNotifEnabled(true);
  }, [notifEnabled]);

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
          <div className="flex items-center justify-between mb-2">
            <Typography className="text-sm font-medium">Font Size</Typography>
            <Tooltip>
              <Button variant="tertiary" size="sm" onPress={() => setFontSize("sm")}>
                <ArrowRotateLeft aria-hidden="true" className="h-3 w-3" />
                Reset
              </Button>
              <Tooltip.Content showArrow placement="top">
                <Tooltip.Arrow />
                Reset to default (S)
              </Tooltip.Content>
            </Tooltip>
          </div>
          <div className="flex gap-2 mb-3">
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
          <div className="rounded-lg border bg-field-background p-3">
            <Typography {...SIZE_PROPS[fontSize]} render={({ children, ...dp }) => <span {...dp}>{children}</span>}>
              <sup className="me-1 text-[0.65em] text-muted">1</sup>
              {PREVIEW_TEXT}
            </Typography>
          </div>
        </Surface>
        {notifSupported && (
          <Surface className="p-3">
            <div className="flex items-center justify-between">
              <Typography className="text-sm font-medium">Daily Notifications</Typography>
              <Button
                variant={notifEnabled ? "primary" : "secondary"}
                size="sm"
                onPress={toggleNotifications}
              >
                <Bell aria-hidden="true" className="h-4 w-4" />
                {notifEnabled ? "Enabled" : "Disabled"}
              </Button>
            </div>
            <Typography className="text-xs text-muted mt-1">
              Receive a daily notification with the verse of the day.
            </Typography>
          </Surface>
        )}
      </section>
    </main>
  );
};

export default SettingsPage;

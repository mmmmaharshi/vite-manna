import { useCallback } from "react";
import { ArrowRotateLeft, Bell, Moon, Sun } from "@gravity-ui/icons";
import { Button, ScrollShadow, Surface, Tooltip, Typography } from "@heroui/react";
import { useLocalStorage } from "@reactuses/core";

import { useTheme } from "../../shared/hooks/useTheme";
import { SIZE_PROPS } from "../../shared/lib/fontSize";
import { type FontSize } from "../../shared/lib/fontSize";
import { useReaderStore } from "../reader/store/readerStore";

interface PeriodicSyncManager {
  register: (tag: string, options: { minInterval: number }) => Promise<void>;
  unregister: (tag: string) => Promise<void>;
}

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

const PREVIEW_TEXT = "ఆదియందు దేవుడు ఆకాశమును భూమిని సృష్టించెను. భూమి నిరాకారముగా నిర్జనముగా ఉండెను. అగాధజలముల మీదను అంధకారము కమ్ముకొని యుండెను. దేవుని ఆత్మ జలముల మీద కదలాడుచుండెను. అప్పుడు దేవుడు వెలుగు కలుగునని చెప్పగా వెలుగు కలిగెను.";

const NOTIF_PREF_KEY = "manna.notifications-enabled";

const SettingsPage = () => {
  const { mode, setMode } = useTheme();
  const fontSize = useReaderStore((state) => state.fontSize);
  const setFontSize = useReaderStore((state) => state.setFontSize);
  const [notifEnabled, setNotifEnabled] = useLocalStorage(NOTIF_PREF_KEY, "false");

  const toggleNotifications = useCallback(async () => {
    if (notifEnabled === "true") {
      try {
        const reg = await navigator.serviceWorker.ready;
        const ps = (reg as unknown as { periodicSync?: PeriodicSyncManager }).periodicSync;
        if (ps?.unregister) await ps.unregister("daily-verse");
      } catch { }
      setNotifEnabled("false");
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const ps = (reg as unknown as { periodicSync?: PeriodicSyncManager }).periodicSync;
      if (ps?.register) await ps.register("daily-verse", { minInterval: 24 * 60 * 60 * 1000 });
    } catch { }
    setNotifEnabled("true");
  }, [notifEnabled, setNotifEnabled]);

  return (
    <div className="h-dvh flex flex-col">
      <Surface className="sticky top-0 z-30 bg-surface py-3 border border-b">
        <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl w-full px-2 mx-auto">
          <Typography.Heading level={1} className="text-xl">Settings</Typography.Heading>
        </div>
      </Surface>

      <ScrollShadow hideScrollBar className="flex-1">
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
          <Surface className="p-3">
            <div className="flex items-center justify-between">
              <Typography className="text-sm font-medium">Daily Notifications</Typography>
              <Button
                variant={notifEnabled === "true" ? "primary" : "tertiary"}
                size="sm"
                onPress={toggleNotifications}
              >
                <Bell aria-hidden="true" className="h-4 w-4" />
                {notifEnabled === "true" ? "Enabled" : "Disabled"}
              </Button>
            </div>
            <Typography className="text-xs text-muted mt-1">
              Receive a daily notification with the verse of the day.
            </Typography>
            {typeof Notification !== "undefined" && Notification.permission === "denied" && (
              <Typography className="text-xs text-danger mt-1">
                Notification permission was denied. Update your browser settings to re-enable.
              </Typography>
            )}
          </Surface>
        </section>
        <div className="h-16" />
      </ScrollShadow>
    </div>
  );
};

export default SettingsPage;

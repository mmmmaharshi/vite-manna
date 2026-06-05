import { useCallback, useMemo, useRef } from "react";
import { ArrowRotateLeft, Bell, FileArrowDown, FileArrowUp, Moon, Sun } from "@gravity-ui/icons";
import { Button, ScrollShadow, Surface, ToggleButton, ToggleButtonGroup, Tooltip, toast, Typography } from "@heroui/react";
import { useLocalStorage } from "@reactuses/core";

import { useTheme } from "../../shared/hooks/useTheme";
import { type FontSize } from "../../shared/lib/fontSize";
import { cn } from "../../shared/lib/cn";
import { useReaderStore } from "../reader/store/readerStore";
import { exportBackup, importBackup } from "../../shared/lib/backup";

interface PeriodicSyncManager {
  register: (tag: string, options: { minInterval: number }) => Promise<void>;
  unregister: (tag: string) => Promise<void>;
}

const SystemIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
    <circle cx="8" cy="8" r="3" />
    <path d="M8 1v2M8 13v2M2.05 2.05l1.41 1.41M12.54 12.54l1.41 1.41M1 8h2M13 8h2M2.05 13.95l1.41-1.41M12.54 3.46l1.41-1.41" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
  </svg>
);

const OPTIONS: { mode: "light" | "dark" | "system"; label: string; Icon: typeof Sun }[] = [
  { mode: "light", label: "Light", Icon: Sun },
  { mode: "dark", label: "Dark", Icon: Moon },
  { mode: "system", label: "System", Icon: SystemIcon },
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

  const importRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(async () => {
    try {
      await exportBackup();
      toast("Backup downloaded", { variant: "success" });
    } catch {
      toast("Failed to export data", { variant: "danger" });
    }
  }, []);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importBackup(file);
      toast("Data restored successfully. Reload to see changes.", { variant: "success" });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to import data", { variant: "danger" });
    }
    e.target.value = "";
  }, []);

  const toggleNotifications = useCallback(async () => {
    if (notifEnabled === "true") {
      try {
        const reg = await navigator.serviceWorker.ready;
        const ps = (reg as unknown as { periodicSync?: PeriodicSyncManager }).periodicSync;
        if (ps?.unregister) await ps.unregister("daily-verse");
      } catch { /* periodicSync may not be available */ }
      setNotifEnabled("false");
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const ps = (reg as unknown as { periodicSync?: PeriodicSyncManager }).periodicSync;
        if (ps?.register) await ps.register("daily-verse", { minInterval: 24 * 60 * 60 * 1000 });
    } catch { /* periodicSync may not be available */ }
    setNotifEnabled("true");
  }, [notifEnabled, setNotifEnabled]);

  return (
    <main id="main-content" className="h-dvh flex flex-col">
      <Surface className="sticky top-0 z-30 bg-surface py-3 border border-b">
        <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl w-full px-2 mx-auto">
          <Typography.Heading level={1} className="text-xl">Settings</Typography.Heading>
        </div>
      </Surface>

      <ScrollShadow hideScrollBar className="flex-1">
        <section className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl w-full px-2 py-4 mx-auto flex flex-col gap-2">
          <Surface className="p-3">
            <Typography className="text-sm font-medium mb-2">Appearance</Typography>
            <ToggleButtonGroup
              fullWidth
              selectionMode="single"
              selectedKeys={useMemo(() => new Set([mode]), [mode])}
              onSelectionChange={(keys) => {
                const value = [...keys][0] as string;
                if (value) setMode(value as "light" | "dark" | "system");
              }}
            >
              {OPTIONS.map(({ mode: m, label, Icon }) => (
                <ToggleButton key={m} id={m}>
                  <Icon aria-hidden="true" className="h-4 w-4" />
                  {label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
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
            <ToggleButtonGroup
              fullWidth
              selectionMode="single"
              className="mb-3"
              selectedKeys={useMemo(() => new Set([fontSize]), [fontSize])}
              onSelectionChange={(keys) => {
                const value = [...keys][0] as FontSize;
                if (value) setFontSize(value);
              }}
            >
              {FONT_SIZES.map(({ value, label }) => (
                <ToggleButton key={value} id={value}>
                  {label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <div className="rounded-lg border bg-field-background p-3">
              <span className={cn(
                fontSize === "sm" && "text-sm",
                fontSize === "base" && "text-base",
                fontSize === "lg" && "text-lg",
                fontSize === "xl" && "text-xl",
                fontSize === "2xl" && "text-2xl",
              )}>
                <sup className="me-1 text-[0.65em] text-muted">1</sup>
                {PREVIEW_TEXT}
              </span>
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

          <Surface className="p-3">
            <Typography className="text-sm font-medium mb-2">Data</Typography>
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onPress={handleExport}>
                <FileArrowDown className="h-4 w-4" />
                Export
              </Button>
              <Button variant="secondary" size="sm" onPress={() => importRef.current?.click()}>
                <FileArrowUp className="h-4 w-4" />
                Import
              </Button>
            </div>
            <Typography className="text-xs text-muted mt-2">
              Export your highlights and reading history as JSON. Import a backup to restore.
            </Typography>
          </Surface>

          <Surface className="p-3">
            <Typography className="text-sm font-medium mb-2">About</Typography>
            <Typography className="text-xs text-muted">మన్నా · Manna v1.0.0</Typography>
            <Typography className="text-xs text-muted mt-0.5">
              Offline Telugu Bible reader
            </Typography>
            <a href="https://github.com/mmmmaharshi/vite-manna" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors">
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg>
              GitHub
            </a>
          </Surface>
        </section>
        <div className="h-[calc(4rem+env(safe-area-inset-bottom))]" />
      </ScrollShadow>
    </main>
  );
};

export default SettingsPage;

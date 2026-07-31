import { useMemo } from "react";
import { ArrowRotateLeft } from "@gravity-ui/icons";
import { Button, ScrollShadow, Surface, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@heroui/react";

import { version } from "../../../package.json";
import { type FontSize } from "../../shared/lib/fontSize";
import { cn } from "../../shared/lib/cn";
import { useReaderStore } from "../reader/store/readerStore";

const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: "sm", label: "S" },
  { value: "base", label: "M" },
  { value: "lg", label: "L" },
  { value: "xl", label: "XL" },
  { value: "2xl", label: "2XL" },
];

const PREVIEW_TEXT = "ఆదియందు దేవుడు ఆకాశమును భూమిని సృష్టించెను. భూమి నిరాకారముగా నిర్జనముగా ఉండెను. అగాధజలముల మీదను అంధకారము కమ్ముకొని యుండెను. దేవుని ఆత్మ జలముల మీద కదలాడుచుండెను. అప్పుడు దేవుడు వెలుగు కలుగునని చెప్పగా వెలుగు కలిగెను.";

const SettingsPage = () => {
  const fontSize = useReaderStore((state) => state.fontSize);
  const setFontSize = useReaderStore((state) => state.setFontSize);

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
                "leading-relaxed",
              )}>
                <sup className="me-1 text-[0.65em] text-muted">1</sup>
                {PREVIEW_TEXT}
              </span>
            </div>
          </Surface>

          <Surface className="p-3">
            <Typography className="text-sm font-medium mb-2">About</Typography>
            <Typography className="text-xs text-muted">మన్నా · Manna v{version}</Typography>
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

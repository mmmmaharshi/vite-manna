import { useCallback, useEffect, useMemo } from "react";
import { useLocalStorage, useMediaQuery } from "@reactuses/core";

const THEME_KEY = "theme";
type ThemeMode = "light" | "dark" | "system";
type Theme = "light" | "dark";

function resolveTheme(mode: ThemeMode, prefersDark: boolean): Theme {
  return mode === "system" ? (prefersDark ? "dark" : "light") : mode;
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function useTheme() {
  const [stored, setModeState] = useLocalStorage<ThemeMode>(THEME_KEY, "system");
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const mode = stored ?? "system";
  const resolvedTheme = useMemo(() => resolveTheme(mode, prefersDark), [mode, prefersDark]);

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
  }, [setModeState]);

  return {
    mode,
    resolvedTheme,
    isDark: resolvedTheme === "dark",
    setMode,
  };
}

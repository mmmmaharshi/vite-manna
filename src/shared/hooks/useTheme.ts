import { useCallback, useEffect, useState } from "react";

const THEME_KEY = "theme";
type ThemeMode = "light" | "dark" | "system";
type Theme = "light" | "dark";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredMode(): ThemeMode | null {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch { /* noop */ }
  return null;
}

function getEffectiveMode(): ThemeMode {
  return getStoredMode() ?? "system";
}

function resolveTheme(mode: ThemeMode): Theme {
  return mode === "system" ? getSystemTheme() : mode;
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(getEffectiveMode);
  const resolvedTheme = resolveTheme(mode);

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const stored = getStoredMode();
      if (stored === "system" || stored === null) {
        setModeState("system");
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    try { localStorage.setItem(THEME_KEY, m); } catch { /* noop */ }
    setModeState(m);
  }, []);

  return {
    mode,
    resolvedTheme,
    isDark: resolvedTheme === "dark",
    setMode,
  };
}

import { useCallback, useSyncExternalStore } from "react";

const THEME_KEY = "theme";
type Theme = "light" | "dark";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch { /* noop */ }
  return null;
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function getTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

function subscribe(callback: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot(): Theme {
  return getTheme();
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    try { localStorage.setItem(THEME_KEY, next); } catch { /* noop */ }
    applyTheme(next);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    try { localStorage.setItem(THEME_KEY, t); } catch { /* noop */ }
    applyTheme(t);
  }, []);

  return { theme, toggleTheme, setTheme, isDark: theme === "dark" };
}

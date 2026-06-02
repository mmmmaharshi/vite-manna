import { useCallback, useEffect, useState } from "react";

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

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (getStoredTheme() === null) {
        const next = mq.matches ? "dark" : "light";
        setThemeState(next);
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      try { localStorage.setItem(THEME_KEY, next); } catch { /* noop */ }
      return next;
    });
  }, []);

  const setTheme = useCallback((t: Theme) => {
    try { localStorage.setItem(THEME_KEY, t); } catch { /* noop */ }
    setThemeState(t);
  }, []);

  return { theme, toggleTheme, setTheme, isDark: theme === "dark" };
}

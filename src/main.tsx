import "./assets/fonts/google-sans-telugu-latin.css";
import { ToastProvider, toastQueue } from "@heroui/react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import { RootRoutes } from "./app";
import ErrorBoundary from "./shared/ui/ErrorBoundary";
import "./index.css";

if (typeof history !== "undefined" && "scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

function initTheme() {
  const stored = (() => { try { return localStorage.getItem("theme"); } catch { return null; } })();
  const theme = stored === "dark" || stored === "light" ? stored
    : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  document.documentElement.classList.toggle("dark", theme === "dark");
}
initTheme();

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ToastProvider placement="top" queue={toastQueue} />
    <ErrorBoundary>
      <RootRoutes />
    </ErrorBoundary>
  </BrowserRouter>,
);

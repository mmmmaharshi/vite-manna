import "./assets/fonts/google-sans-telugu-latin.css";
import { ToastProvider, toastQueue } from "@heroui/react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import { RootRoutes } from "./app";
import ErrorBoundary from "./shared/ui/error-boundary";

import "./index.css";

if (typeof history !== "undefined" && "scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

const rootElement = document.querySelector("#root");
if (!rootElement) {
  throw new Error("Root element #root not found");
}

createRoot(rootElement).render(
  <BrowserRouter>
    <ToastProvider placement="top" queue={toastQueue} />
    <ErrorBoundary>
      <RootRoutes />
    </ErrorBoundary>
  </BrowserRouter>
);

import "./assets/fonts/google-sans-telugu-latin.css";
import { ToastProvider, toastQueue } from "@heroui/react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import { RootRoutes } from "./app";
import "./index.css";

if (typeof history !== "undefined" && "scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ToastProvider placement="top" queue={toastQueue} />
    <RootRoutes />
  </BrowserRouter>,
);

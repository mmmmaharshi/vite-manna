import "@fontsource-variable/google-sans/wght.css";
import { ToastProvider, toastQueue } from "@heroui/react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import { RootRoutes } from "./app";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ToastProvider placement="top" queue={toastQueue} />
    <RootRoutes />
  </BrowserRouter>,
);

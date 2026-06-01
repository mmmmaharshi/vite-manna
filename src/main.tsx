import "@fontsource-variable/google-sans/wght.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { RootRoutes } from "./app";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <RootRoutes />
  </BrowserRouter>,
);

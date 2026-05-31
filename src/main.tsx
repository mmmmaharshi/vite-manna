import "@fontsource-variable/google-sans/wght.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import RootRoutes from "./RootRoutes";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <RootRoutes />
  </BrowserRouter>,
);

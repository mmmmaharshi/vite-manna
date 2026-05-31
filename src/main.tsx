import "@fontsource-variable/google-sans/wght.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import RequireBible from "./bible/RequireBible";
import "./index.css";
import { waitForFonts } from "./lib/waitForFonts";
import App from "./pages/App";
import EntryRoute from "./pages/EntryRoute";

await waitForFonts();

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<EntryRoute />} />
      <Route element={<RequireBible />}>
        <Route path="/app" element={<App />} />
      </Route>
    </Routes>
  </BrowserRouter>,
);

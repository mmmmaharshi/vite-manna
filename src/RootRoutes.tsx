import { Route, Routes } from "react-router";

import App from "./pages/App";
import EntryRoute from "./pages/EntryRoute";

const RootRoutes = () => (
  <Routes>
    <Route path="/" element={<EntryRoute />} />
    <Route path="/app" element={<App />} />
  </Routes>
);

export default RootRoutes;

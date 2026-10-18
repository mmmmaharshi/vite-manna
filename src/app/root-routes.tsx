import { Route, Routes } from "react-router";

import AppShell from "./app-shell";

const RootRoutes = () => (
  <Routes>
    <Route element={<AppShell />} path="*" />
  </Routes>
);

export default RootRoutes;

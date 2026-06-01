import { Route, Routes } from "react-router";

import AppShell from "./AppShell";

const RootRoutes = () => (
  <Routes>
    <Route element={<AppShell />} path="*" />
  </Routes>
);

export default RootRoutes;

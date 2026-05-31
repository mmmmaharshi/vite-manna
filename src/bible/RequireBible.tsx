import { Spinner } from "@heroui/react";
import { Navigate, Outlet } from "react-router";

import { useBibleStatus } from "./useBibleStatus";

const RequireBible = () => {
  const status = useBibleStatus();

  if (status === "checking") {
    return (
      <main className="h-svh w-full flex items-center justify-center">
        <Spinner aria-label="Checking Bible data" />
      </main>
    );
  }

  if (status === "missing") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireBible;

import { Navigate, Outlet } from "react-router";

import SplashView from "../components/SplashView";
import { useBibleStatus } from "./useBibleStatus";

const RequireBible = () => {
  const status = useBibleStatus();

  if (status === "checking") {
    return <SplashView />;
  }

  if (status === "missing") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireBible;

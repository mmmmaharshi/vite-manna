import { Navigate } from "react-router";

import { useBibleStatus } from "../bible/useBibleStatus";
import SplashView from "../components/SplashView";
import SplashScreen from "./SplashScreen";

const EntryRoute = () => {
  const status = useBibleStatus();

  if (status === "checking") {
    return <SplashView />;
  }

  if (status === "ready") {
    return <Navigate to="/app" replace />;
  }

  return <SplashScreen />;
};

export default EntryRoute;

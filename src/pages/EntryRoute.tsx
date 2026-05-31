import { useEffect, useState } from "react";

import { useBibleStatus } from "../bible/useBibleStatus";
import SplashView from "../components/SplashView";
import { waitForFonts } from "../lib/waitForFonts";
import App from "./App";
import SplashScreen from "./SplashScreen";

const EntryRoute = () => {
  const status = useBibleStatus();
  const [areFontsReady, setAreFontsReady] = useState(false);
  const [isAppHydrated, setIsAppHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    void waitForFonts().then(() => {
      if (mounted) {
        setAreFontsReady(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!areFontsReady || status === "checking") {
    return <SplashView />;
  }

  if (status === "ready") {
    return (
      <>
        <App showSplash={false} onHydrated={() => setIsAppHydrated(true)} />
        {!isAppHydrated && <SplashView />}
      </>
    );
  }

  return <SplashScreen />;
};

export default EntryRoute;

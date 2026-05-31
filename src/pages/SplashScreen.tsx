import { useEffect, useState } from "react";

import { initializeBible } from "../bible/initializeBible";
import SplashView from "../components/SplashView";
import { waitForOfflineReadiness } from "../lib/offlineReadiness";
import App from "./App";

const SplashScreen = () => {
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isAppHydrated, setIsAppHydrated] = useState(false);
  const [message, setMessage] = useState("Preparing Bible data...");
  const [progress, setProgress] = useState<number | null>(0);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        setError(null);
        setIsReady(false);
        setIsAppHydrated(false);
        setMessage("Downloading Bible data...");
        setProgress(0);

        await initializeBible((nextProgress) => {
          if (!mounted) {
            return;
          }

          const cappedProgress = Math.min(Math.round(nextProgress), 95);

          setProgress(cappedProgress);

          if (nextProgress < 75) {
            setMessage(`Downloading Bible data... ${cappedProgress}%`);
            return;
          }

          if (nextProgress < 90) {
            setMessage("Preparing Bible data...");
            return;
          }

          setMessage("Saving Bible for offline use...");
        });

        if (mounted) {
          setMessage("Preparing offline mode...");
          setProgress(95);
        }

        await waitForOfflineReadiness();

        if (mounted) {
          setMessage("Opening reader...");
          setProgress(100);
          setIsReady(true);
        }
      } catch (err) {
        console.error("[Bible] Failed to initialize database", err);

        if (mounted) {
          setError("Unable to load Bible data. Please try again.");
        }
      }
    };

    void init();

    return () => {
      mounted = false;
    };
  }, [attempt]);

  return (
    <>
      {isReady && (
        <App showSplash={false} onHydrated={() => setIsAppHydrated(true)} />
      )}

      {!isAppHydrated && (
          <SplashView
            error={error}
            message={message}
            onRetry={() => setAttempt((value) => value + 1)}
            progress={progress}
          />
      )}
    </>
  );
};

export default SplashScreen;

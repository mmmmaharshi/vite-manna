import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { initializeBible } from "../bible/initializeBible";
import SplashView from "../components/SplashView";
import { waitForOfflineReadiness } from "../lib/offlineReadiness";

const SplashScreen = () => {
  const navigate = useNavigate();

  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        setError(null);
        setProgress(0);

        await initializeBible((value) => {
          if (mounted) {
            setProgress(Math.round(value));
          }
        });
        await waitForOfflineReadiness();

        navigate("/app");
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
  }, [attempt, navigate]);

  return (
    <SplashView
      error={error}
      progress={progress}
      onRetry={() => setAttempt((value) => value + 1)}
    />
  );
};

export default SplashScreen;

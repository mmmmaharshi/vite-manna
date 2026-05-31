import { Button, ProgressBar, Typography } from "@heroui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import IconSVG from "../assets/icon";
import { initializeBible } from "../bible/initializeBible";

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
    <main className="h-svh w-full container mx-auto max-w-sm flex items-center justify-center px-6">
      <div className="flex flex-col items-center justify-center w-full">
        <IconSVG width={120} height={120} />

        <Typography.Heading level={1} className="font-black text-4xl">
          Manna
        </Typography.Heading>

        <ProgressBar
          value={progress}
          maxValue={100}
          className="w-40 mt-4"
          aria-label="Loading Bible"
        >
          <ProgressBar.Track>
            <ProgressBar.Fill />
          </ProgressBar.Track>
        </ProgressBar>

        {error && (
          <div className="flex flex-col items-center gap-2 mt-3">
            <Typography className="text-danger text-center text-sm">
              {error}
            </Typography>

            <Button size="sm" onPress={() => setAttempt((v) => v + 1)}>
              Retry
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};

export default SplashScreen;

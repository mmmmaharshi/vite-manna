import { useEffect, useState } from "react";

import { initializeBible, useBibleStatus } from "../features/setup";
import { waitForOfflineReadiness } from "../shared/lib/offlineReadiness";
import { waitForFonts } from "../shared/lib/waitForFonts";

const MINIMUM_SPLASH_DURATION_MS = 500;
const PROGRESS_MESSAGE_DOWNLOADING = "Downloading Bible data...";
const PROGRESS_MESSAGE_PREPARING = "Preparing Bible data...";
const PROGRESS_MESSAGE_SAVING = "Saving Bible for offline use...";
const DOWNLOAD_ERROR_MESSAGE = "Unable to load Bible data. Please try again.";

const PROGRESS_CAP = 95;

export type ShellStatus =
  | { kind: "splash" }
  | {
      kind: "progress";
      message: string;
      progress: number;
      onRetry: () => void;
    }
  | { kind: "error"; message: string; onRetry: () => void }
  | { kind: "ready" };

function progressMessage(progress: number) {
  if (progress < 75) {
    return `${PROGRESS_MESSAGE_DOWNLOADING} ${progress}%`;
  }
  if (progress < 90) {
    return PROGRESS_MESSAGE_PREPARING;
  }
  return PROGRESS_MESSAGE_SAVING;
}

export function useAppShell(): ShellStatus {
  const [areFontsReady, setAreFontsReady] = useState(false);
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [isMinSplashElapsed, setIsMinSplashElapsed] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const bibleStatus = useBibleStatus();

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

  useEffect(() => {
    let mounted = true;

    void waitForOfflineReadiness().then(() => {
      if (mounted) {
        setIsOfflineReady(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (bibleStatus !== "missing" || downloadError !== null) {
      return;
    }

    let mounted = true;

    void initializeBible((nextProgress) => {
      if (!mounted) {
        return;
      }

      setDownloadProgress(Math.min(Math.round(nextProgress), PROGRESS_CAP));
    })
      .then(() => {
        if (mounted) {
          setDownloadProgress(0);
        }
      })
      .catch((error) => {
        console.error("[Bible] Failed to initialize database", error);

        if (mounted) {
          setDownloadError(DOWNLOAD_ERROR_MESSAGE);
        }
      });

    return () => {
      mounted = false;
    };
  }, [attempt, bibleStatus, downloadError]);

  const isShellReady =
    bibleStatus === "ready" && areFontsReady && isOfflineReady;

  useEffect(() => {
    if (!isShellReady || downloadError !== null) {
      return;
    }

    if (bibleStatus !== "ready" || downloadProgress !== 0) {
      return;
    }

    if (isMinSplashElapsed) {
      return;
    }

    const timeoutId = setTimeout(
      () => setIsMinSplashElapsed(true),
      MINIMUM_SPLASH_DURATION_MS,
    );

    return () => clearTimeout(timeoutId);
  }, [
    bibleStatus,
    downloadError,
    downloadProgress,
    isMinSplashElapsed,
    isShellReady,
  ]);

  const retry = () => {
    setDownloadError(null);
    setDownloadProgress(0);
    setAttempt((value) => value + 1);
  };

  if (downloadError !== null) {
    return { kind: "error", message: downloadError, onRetry: retry };
  }

  if (bibleStatus === "missing") {
    return {
      kind: "progress",
      message: progressMessage(downloadProgress),
      progress: downloadProgress,
      onRetry: retry,
    };
  }

  if (!isShellReady || !isMinSplashElapsed) {
    return { kind: "splash" };
  }

  return { kind: "ready" };
}

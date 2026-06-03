import { useEffect, useState } from "react";

import { initializeBible, useBibleStatus } from "../features/setup";
import { getBibleBookName, getReaderBootstrap, getReaderSnapshot } from "../shared/bible";
import { waitForOfflineReadiness } from "../shared/lib/offlineReadiness";
import { waitForFonts } from "../shared/lib/waitForFonts";
import { useReaderStore } from "../features/reader/store/readerStore";
import { setBooksCache } from "../features/reader/hooks/useBooks";
import { setPreloadedSnapshot } from "../features/reader/hooks/useReaderSnapshot";

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
  const [isBibleComplete, setIsBibleComplete] = useState(false);
  const [areBooksReady, setAreBooksReady] = useState(false);
  const [isSnapshotReady, setIsSnapshotReady] = useState(false);

  const bibleStatus = useBibleStatus();

  useEffect(() => {
    let mounted = true;

    void Promise.all([waitForFonts(), waitForOfflineReadiness()]).then(() => {
      if (mounted) {
        setAreFontsReady(true);
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
          setIsBibleComplete(true);
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

  useEffect(() => {
    if (bibleStatus !== "ready" && !isBibleComplete) {
      return;
    }

    if (areBooksReady) {
      return;
    }

    let mounted = true;

    void getReaderBootstrap(1, 1)
      .then(({ books: bookSummaries }) => {
        if (!mounted) {
          return;
        }

        const mapped = bookSummaries.map((book) => ({
          ...book,
          name: getBibleBookName(book.id),
        }));

        setBooksCache(mapped);
        setAreBooksReady(true);
      })
      .catch(() => {
        if (mounted) {
          setAreBooksReady(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, [bibleStatus, isBibleComplete, areBooksReady]);

  useEffect(() => {
    if (!areBooksReady) {
      return;
    }

    if (isSnapshotReady) {
      return;
    }

    let mounted = true;

    const { book, chapter } = useReaderStore.getState();

    void getReaderSnapshot(book, chapter)
      .then((snapshot) => {
        if (!mounted) {
          return;
        }

        setPreloadedSnapshot(snapshot);
        setIsSnapshotReady(true);
      })
      .catch(() => {
        if (mounted) {
          setIsSnapshotReady(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, [areBooksReady, isSnapshotReady]);

  const isShellReady =
    (bibleStatus === "ready" || isBibleComplete) && areFontsReady && isOfflineReady && areBooksReady && isSnapshotReady;

  useEffect(() => {
    if (!isShellReady || downloadError !== null) {
      return;
    }

    if (downloadProgress !== 0) {
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

  if (bibleStatus === "missing" && !isBibleComplete) {
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

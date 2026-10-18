import { useEffect, useState } from "react";

import { setBooksCache } from "../features/reader/hooks/use-books";
import { setPreloadedSnapshot } from "../features/reader/hooks/use-reader-snapshot";
import { useReaderStore } from "../features/reader/store/reader-store";
import { useBibleStatus } from "../features/setup/hooks/use-bible-status";
import {
  getBibleBookName,
  getReaderBootstrap,
  getReaderSnapshot,
} from "../shared/bible";
import { waitForOfflineReadiness } from "../shared/lib/offline-readiness";
import { waitForFonts } from "../shared/lib/wait-for-fonts";

const MINIMUM_SPLASH_DURATION_MS = 500;
const PROGRESS_MESSAGE_DOWNLOADING = "Downloading Bible data...";
const PROGRESS_MESSAGE_PREPARING = "Preparing Bible data...";
const PROGRESS_MESSAGE_SAVING = "Saving Bible for offline use...";
const DOWNLOAD_ERROR_MESSAGE = "Unable to load Bible data. Please try again.";

const PROGRESS_CAP = 95;

// Kept at module scope: the React Compiler cannot lower `import()` expressions
// that appear inside a component.
const loadInitializeBible = async () => {
  const setup = await import("../features/setup");

  return setup.initializeBible;
};

export type ShellStatus =
  | { kind: "splash" }
  | {
      kind: "progress";
      message: string;
      progress: number;
      handleRetry: () => void;
    }
  | { kind: "error"; message: string; handleRetry: () => void }
  | { kind: "ready" };

const progressMessage = (progress: number) => {
  if (progress < 75) {
    return `${PROGRESS_MESSAGE_DOWNLOADING} ${progress}%`;
  }

  if (progress < 90) {
    return PROGRESS_MESSAGE_PREPARING;
  }

  return PROGRESS_MESSAGE_SAVING;
};

export const useAppShell = (): ShellStatus => {
  const [areFontsReady, setAreFontsReady] = useState(false);
  const [isMinSplashElapsed, setIsMinSplashElapsed] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isBibleComplete, setIsBibleComplete] = useState(false);
  const [areBooksReady, setAreBooksReady] = useState(false);
  const [isSnapshotReady, setIsSnapshotReady] = useState(false);

  const bibleStatus = useBibleStatus();

  useEffect(() => {
    let mounted = true;

    const prepare = async () => {
      await waitForFonts();

      if (mounted) {
        setAreFontsReady(true);
      }
    };

    void prepare();
    void waitForOfflineReadiness();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (bibleStatus !== "missing" || downloadError !== null) {
      return;
    }

    let mounted = true;

    const initialize = async () => {
      try {
        const initializeBible = await loadInitializeBible();

        if (!mounted) {
          return;
        }

        await initializeBible((nextProgress) => {
          if (!mounted) {
            return;
          }

          setDownloadProgress(Math.min(Math.round(nextProgress), PROGRESS_CAP));
        });

        if (mounted) {
          setDownloadProgress(0);
          setIsBibleComplete(true);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("[Bible] Failed to initialize database", error);
        }

        if (mounted) {
          setDownloadError(DOWNLOAD_ERROR_MESSAGE);
        }
      }
    };

    void initialize();

    return () => {
      mounted = false;
    };
  }, [bibleStatus, downloadError]);

  useEffect(() => {
    if (bibleStatus !== "ready" && !isBibleComplete) {
      return;
    }

    if (areBooksReady) {
      return;
    }

    let mounted = true;

    const loadBooks = async () => {
      try {
        const { books: bookSummaries } = await getReaderBootstrap(1, 1);

        if (!mounted) {
          return;
        }

        const mapped = bookSummaries.map((book) => ({
          ...book,
          name: getBibleBookName(book.id),
        }));

        setBooksCache(mapped);
        setAreBooksReady(true);
      } catch {
        if (mounted) {
          setAreBooksReady(true);
        }
      }
    };

    void loadBooks();

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

    const loadSnapshot = async () => {
      try {
        const { book, chapter } = useReaderStore.getState();
        const snapshot = await getReaderSnapshot(book, chapter);

        if (!mounted) {
          return;
        }

        setPreloadedSnapshot(snapshot);
        setIsSnapshotReady(true);
      } catch {
        if (mounted) {
          setIsSnapshotReady(true);
        }
      }
    };

    void loadSnapshot();

    return () => {
      mounted = false;
    };
  }, [areBooksReady, isSnapshotReady]);

  const isShellReady =
    (bibleStatus === "ready" || isBibleComplete) &&
    areFontsReady &&
    areBooksReady &&
    isSnapshotReady;

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
      MINIMUM_SPLASH_DURATION_MS
    );

    return () => clearTimeout(timeoutId);
  }, [downloadError, downloadProgress, isMinSplashElapsed, isShellReady]);

  const handleRetry = () => {
    setDownloadError(null);
    setDownloadProgress(0);
  };

  if (downloadError !== null) {
    return { handleRetry, kind: "error", message: downloadError };
  }

  if (bibleStatus === "missing" && !isBibleComplete) {
    return {
      handleRetry,
      kind: "progress",
      message: progressMessage(downloadProgress),
      progress: downloadProgress,
    };
  }

  if (!isShellReady || !isMinSplashElapsed) {
    return { kind: "splash" };
  }

  return { kind: "ready" };
};

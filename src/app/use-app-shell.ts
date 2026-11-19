import { useEffect, useState } from "react";

import { setBooksCache } from "../features/reader/hooks/use-books";
import { setPreloadedSnapshot } from "../features/reader/hooks/use-reader-snapshot";
import { useReaderStore } from "../features/reader/store/reader-store";
import type { BibleStatus } from "../features/setup/hooks/use-bible-status";
import { useBibleStatus } from "../features/setup/hooks/use-bible-status";
import {
  attachBookNames,
  getReaderBootstrap,
  getReaderSnapshot,
} from "../shared/bible";
import { waitForFonts } from "../shared/lib/wait-for-fonts";

const MINIMUM_SPLASH_DURATION_MS = 500;
const PROGRESS_MESSAGE_DOWNLOADING = "Downloading Bible data...";
const PROGRESS_MESSAGE_PREPARING = "Preparing Bible data...";
const PROGRESS_MESSAGE_SAVING = "Saving Bible for offline use...";
const DOWNLOAD_ERROR_MESSAGE = "Unable to load Bible data. Please try again.";

const READ_ERROR_MESSAGE =
  "Unable to read your Bible data on this device. Please try again.";

const PROGRESS_CAP = 95;

const BOOT_SPLASH_SELECTOR = "#boot-splash";

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
      progress: number | null;
      handleRetry: () => void;
    }
  | { kind: "error"; message: string; handleRetry: () => void }
  | { kind: "ready" };

const progressMessage = (progress: number | null) => {
  if (progress === null) {
    return PROGRESS_MESSAGE_DOWNLOADING;
  }

  if (progress < 75) {
    return `${PROGRESS_MESSAGE_DOWNLOADING} ${progress}%`;
  }

  if (progress < 90) {
    return PROGRESS_MESSAGE_PREPARING;
  }

  return PROGRESS_MESSAGE_SAVING;
};

export interface ShellReadiness {
  bibleStatus: BibleStatus;
  loadError: string | null;
  isBibleComplete: boolean;
  areFontsReady: boolean;
  areBooksReady: boolean;
  isSnapshotReady: boolean;
  isMinSplashElapsed: boolean;
  downloadProgress: number | null;
}

type BootInputs = Pick<
  ShellReadiness,
  | "bibleStatus"
  | "isBibleComplete"
  | "areFontsReady"
  | "areBooksReady"
  | "isSnapshotReady"
>;

export const isBootReady = (inputs: BootInputs): boolean =>
  (inputs.bibleStatus === "ready" || inputs.isBibleComplete) &&
  inputs.areFontsReady &&
  inputs.areBooksReady &&
  inputs.isSnapshotReady;

/** Pure so the boot routing (error paths included) is unit-testable. */
export const resolveShellStatus = (
  readiness: ShellReadiness,
  handleRetry: () => void
): ShellStatus => {
  const {
    bibleStatus,
    loadError,
    isBibleComplete,
    isMinSplashElapsed,
    downloadProgress,
  } = readiness;

  const isShellReady = isBootReady(readiness);

  const isDownloading = bibleStatus === "missing" && !isBibleComplete;
  const isPreparing = !isShellReady || !isMinSplashElapsed;

  if (loadError !== null) {
    return { handleRetry, kind: "error", message: loadError };
  }

  if (bibleStatus === "missing" && isPreparing) {
    // The bar holds its last value once the download is done, so it never drops
    // back to the indeterminate slide while the books and snapshot load.
    return {
      handleRetry,
      kind: "progress",
      message: isDownloading
        ? progressMessage(downloadProgress)
        : PROGRESS_MESSAGE_SAVING,
      progress: isDownloading ? downloadProgress : PROGRESS_CAP,
    };
  }

  if (isPreparing) {
    return { kind: "splash" };
  }

  return { kind: "ready" };
};

export const useAppShell = (): ShellStatus => {
  const [areFontsReady, setAreFontsReady] = useState(false);
  const [isMinSplashElapsed, setIsMinSplashElapsed] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(0);
  const [loadError, setLoadError] = useState<string | null>(null);
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

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (bibleStatus !== "missing" || loadError !== null) {
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

          // `null` means the response had no content-length, so the bar runs indeterminate.
          setDownloadProgress(
            nextProgress === null
              ? null
              : Math.min(Math.round(nextProgress), PROGRESS_CAP)
          );
        });

        if (mounted) {
          setIsBibleComplete(true);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("[Bible] Failed to initialize database", error);
        }

        if (mounted) {
          setLoadError(DOWNLOAD_ERROR_MESSAGE);
        }
      }
    };

    void initialize();

    return () => {
      mounted = false;
    };
  }, [bibleStatus, loadError]);

  useEffect(() => {
    if (loadError !== null) {
      return;
    }

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

        const mapped = attachBookNames(bookSummaries);

        setBooksCache(mapped);
        setAreBooksReady(true);
      } catch (error) {
        // Without surfacing this the reader would sit on an empty state forever.
        if (import.meta.env.DEV) {
          console.error("[Bible] Failed to load the book list", error);
        }

        if (mounted) {
          setLoadError(READ_ERROR_MESSAGE);
        }
      }
    };

    void loadBooks();

    return () => {
      mounted = false;
    };
  }, [bibleStatus, isBibleComplete, areBooksReady, loadError]);

  useEffect(() => {
    if (loadError !== null) {
      return;
    }

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
      } catch (error) {
        // Without surfacing this the reader would show its skeleton forever.
        if (import.meta.env.DEV) {
          console.error("[Bible] Failed to load the reader snapshot", error);
        }

        if (mounted) {
          setLoadError(READ_ERROR_MESSAGE);
        }
      }
    };

    void loadSnapshot();

    return () => {
      mounted = false;
    };
  }, [areBooksReady, isSnapshotReady, loadError]);

  const handleRetry = () => {
    setLoadError(null);
    setDownloadProgress(0);
  };

  const readiness: ShellReadiness = {
    areBooksReady,
    areFontsReady,
    bibleStatus,
    downloadProgress,
    isBibleComplete,
    isMinSplashElapsed,
    isSnapshotReady,
    loadError,
  };

  const bootReady = isBootReady(readiness);

  useEffect(() => {
    if (!bootReady || loadError !== null) {
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
  }, [bootReady, loadError, isMinSplashElapsed]);

  const status = resolveShellStatus(readiness, handleRetry);

  const isBootSplashVisible = status.kind === "splash";

  useEffect(() => {
    if (!isBootSplashVisible) {
      document.querySelector(BOOT_SPLASH_SELECTOR)?.remove();
    }
  }, [isBootSplashVisible]);

  return status;
};

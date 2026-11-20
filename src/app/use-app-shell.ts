import { useEffect, useState } from "react";

import { useBooks } from "../features/reader/hooks/use-books";
import { useReaderSnapshot } from "../features/reader/hooks/use-reader-snapshot";
import { useReaderStore } from "../features/reader/store/reader-store";
import type { BibleStatus } from "../features/setup/hooks/use-bible-status";
import { useBibleStatus } from "../features/setup/hooks/use-bible-status";
import { recordLastCrash } from "../shared/lib/persistence";
import { waitForFonts } from "../shared/lib/wait-for-fonts";

const MINIMUM_SPLASH_DURATION_MS = 500;
const PROGRESS_MESSAGE_DOWNLOADING = "Downloading Bible data...";
const PROGRESS_MESSAGE_PREPARING = "Preparing Bible data...";
const PROGRESS_MESSAGE_SAVING = "Saving Bible for offline use...";
const DOWNLOAD_ERROR_MESSAGE = "Unable to load Bible data. Please try again.";

const READ_ERROR_MESSAGE =
  "Unable to read your Bible data on this device. Please try again.";

const PROGRESS_CAP = 95;

/** The boot splash node id, mirrored by the static markup in index.html. */
export const BOOT_SPLASH_ID = "boot-splash";

const BOOT_SPLASH_SELECTOR = `#${BOOT_SPLASH_ID}`;

// WARNING: moving this import into a component breaks the React Compiler build.
const loadInitializeBible = async () => {
  const setup = await import("../features/setup");

  return setup.initializeBible;
};

/**
 * The boot UI state.
 */
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

/**
 * The inputs that determine the boot UI state.
 */
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

/**
 * Whether every boot gate has passed.
 *
 * @param inputs - The boot inputs.
 * @returns True when the reader can mount.
 */
export const isBootReady = (inputs: BootInputs) => {
  if (inputs.bibleStatus !== "ready" && !inputs.isBibleComplete) {
    return false;
  }

  return inputs.areFontsReady && inputs.areBooksReady && inputs.isSnapshotReady;
};

/**
 * Maps boot inputs to the screen the shell should show.
 *
 * Pure so the boot routing (including error paths) is unit-testable.
 *
 * @param readiness - The boot inputs.
 * @param handleRetry - The retry action for error and progress states.
 * @returns The shell status.
 */
export const resolveShellStatus = (
  readiness: ShellReadiness,
  handleRetry: () => void
) => {
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

/**
 * Orchestrates boot: fonts, seeding, books, the first snapshot, and the splash timer.
 *
 * @returns The current shell status.
 */
export const useAppShell = () => {
  const [areFontsReady, setAreFontsReady] = useState(false);
  const [isMinSplashElapsed, setIsMinSplashElapsed] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(0);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isBibleComplete, setIsBibleComplete] = useState(false);

  const bibleStatus = useBibleStatus();

  const { books, hasLoadedBooks, reloadBooks } = useBooks(
    bibleStatus === "ready" || isBibleComplete
  );

  const book = useReaderStore((state) => state.book);
  const chapter = useReaderStore((state) => state.chapter);

  const {
    snapshot,
    loadError: snapshotError,
    retrySnapshot,
  } = useReaderSnapshot(book, chapter, undefined, hasLoadedBooks);

  const areBooksReady = hasLoadedBooks;
  const isSnapshotReady = snapshot !== null;

  const booksError =
    areBooksReady && books.length === 0 ? READ_ERROR_MESSAGE : null;

  const loadError = downloadError ?? booksError ?? snapshotError;

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
    let mounted = true;

    const initialize = async () => {
      if (bibleStatus !== "missing" || loadError !== null) {
        return;
      }

      try {
        const initializeBible = await loadInitializeBible();

        if (!mounted) {
          return;
        }

        await initializeBible((nextProgress) => {
          if (!mounted) {
            return;
          }

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
        recordLastCrash("Bible initialization failed", String(error));

        if (mounted) {
          setDownloadError(DOWNLOAD_ERROR_MESSAGE);
        }
      }
    };

    void initialize();

    return () => {
      mounted = false;
    };
  }, [bibleStatus, loadError]);

  const handleRetry = () => {
    setDownloadError(null);
    setDownloadProgress(0);

    if (snapshot === null) {
      retrySnapshot();
    }

    if (books.length === 0) {
      reloadBooks();
    }
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
    let timeoutId = 0;

    if (bootReady && loadError === null && !isMinSplashElapsed) {
      timeoutId = setTimeout(
        () => setIsMinSplashElapsed(true),
        MINIMUM_SPLASH_DURATION_MS
      );
    }

    return () => {
      clearTimeout(timeoutId);
    };
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

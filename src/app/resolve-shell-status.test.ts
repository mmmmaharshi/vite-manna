import { beforeAll, describe, expect, it, vi } from "vite-plus/test";

import type * as AppShellApi from "./use-app-shell";

let resolveShellStatus: typeof AppShellApi.resolveShellStatus;
let ready: AppShellApi.ShellReadiness;

const handleRetry = vi.fn<() => void>();

const createStorage = () => {
  const entries = new Map<string, string>();

  return {
    clear: () => entries.clear(),
    getItem: (key: string) => entries.get(key) ?? null,
    removeItem: (key: string) => entries.delete(key),
    setItem: (key: string, value: string) => entries.set(key, value),
  };
};

describe("shell status", () => {
  beforeAll(async () => {
    vi.stubGlobal("window", { location: { search: "" } });
    vi.stubGlobal("localStorage", createStorage());

    ({ resolveShellStatus } = await import("./use-app-shell"));

    ready = {
      areBooksReady: true,
      areFontsReady: true,
      bibleStatus: "ready",
      downloadProgress: null,
      isBibleComplete: false,
      isMinSplashElapsed: true,
      isSnapshotReady: true,
      loadError: null,
    };
  });

  it("routes load failures to the error screen", () => {
    const status = resolveShellStatus(
      { ...ready, loadError: "Unable to read your Bible data" },
      handleRetry
    );

    expect(status).toMatchObject({
      handleRetry,
      kind: "error",
      message: "Unable to read your Bible data",
    });
  });

  it("prefers the error screen over the download progress", () => {
    const status = resolveShellStatus(
      {
        ...ready,
        bibleStatus: "missing",
        isMinSplashElapsed: false,
        loadError: "boom",
      },
      handleRetry
    );

    expect(status.kind).toBe("error");
  });

  it("runs the progress bar indeterminate without a content length", () => {
    const status = resolveShellStatus(
      {
        ...ready,
        areBooksReady: false,
        bibleStatus: "missing",
        downloadProgress: null,
        isMinSplashElapsed: false,
        isSnapshotReady: false,
      },
      handleRetry
    );

    expect(status.kind).toBe("progress");

    expect(status).toMatchObject({
      message: "Downloading Bible data...",
      progress: null,
    });
  });

  it("shows the download percentage while receiving", () => {
    const status = resolveShellStatus(
      {
        ...ready,
        areBooksReady: false,
        bibleStatus: "missing",
        downloadProgress: 50,
        isMinSplashElapsed: false,
        isSnapshotReady: false,
      },
      handleRetry
    );

    expect(status).toMatchObject({
      kind: "progress",
      message: "Downloading Bible data... 50%",
      progress: 50,
    });
  });

  it("holds the bar at the saving step once the download completes", () => {
    const status = resolveShellStatus(
      {
        ...ready,
        areBooksReady: false,
        bibleStatus: "missing",
        downloadProgress: 100,
        isBibleComplete: true,
        isMinSplashElapsed: false,
        isSnapshotReady: false,
      },
      handleRetry
    );

    expect(status).toMatchObject({
      kind: "progress",
      message: "Saving Bible for offline use...",
      progress: 95,
    });
  });

  it("shows the splash until the minimum duration elapses", () => {
    const status = resolveShellStatus(
      { ...ready, isMinSplashElapsed: false },
      handleRetry
    );

    expect(status).toStrictEqual({ kind: "splash" });
  });

  it("shows the splash while the snapshot loads", () => {
    const status = resolveShellStatus(
      { ...ready, isSnapshotReady: false },
      handleRetry
    );

    expect(status).toStrictEqual({ kind: "splash" });
  });

  it("reaches the reader when everything is ready", () => {
    expect(resolveShellStatus(ready, handleRetry)).toStrictEqual({
      kind: "ready",
    });
  });
});

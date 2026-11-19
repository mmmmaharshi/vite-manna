import { beforeAll, describe, expect, it, vi } from "vite-plus/test";

import type * as FontSizeStoreApi from "./font-size-store";

let useFontSizeStore: typeof FontSizeStoreApi.useFontSizeStore;

const createStorage = () => {
  const entries = new Map<string, string>();

  return {
    clear: () => entries.clear(),
    getItem: (key: string) => entries.get(key) ?? null,
    removeItem: (key: string) => entries.delete(key),
    setItem: (key: string, value: string) => entries.set(key, value),
  };
};

describe("font size store", () => {
  beforeAll(async () => {
    vi.stubGlobal("window", { location: { search: "" } });
    vi.stubGlobal("localStorage", createStorage());

    ({ useFontSizeStore } = await import("./font-size-store"));
  });

  it("persists the chosen size", () => {
    useFontSizeStore.getState().setFontSize("xl");

    expect(useFontSizeStore.getState().fontSize).toBe("xl");
    expect(localStorage.getItem("manna.reader-font-size")).toBe("xl");
  });
});

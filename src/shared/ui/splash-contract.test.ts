import { beforeAll, describe, expect, it, vi } from "vite-plus/test";

import indexHtml from "../../../index.html?raw";
import { MAIN_CONTENT_ID } from "./page";
import { SPLASH_TRACK } from "./splash-progress";
import { SPLASH_DEFAULT_MESSAGE } from "./splash-view";

let BOOT_SPLASH_ID: string;

beforeAll(async () => {
  vi.stubGlobal("window", { location: { search: "" } });
  vi.stubGlobal("localStorage", {
    clear: () => {},
    getItem: () => null,
    removeItem: () => {},
    setItem: () => {},
  });

  ({ BOOT_SPLASH_ID } = await import("../../app/use-app-shell"));
});

const readIndexHtml = () => indexHtml;

describe("boot splash contract", () => {
  it("keeps the static splash geometry in sync with the React splash", () => {
    const html = readIndexHtml();

    expect(html).toContain(`width:${SPLASH_TRACK.width}px`);
    expect(html).toContain(`height:${SPLASH_TRACK.height}px`);
    expect(html).toContain(`width:${SPLASH_TRACK.barWidth}px`);
    expect(html).toContain(`${SPLASH_TRACK.durationMs}ms`);
    expect(html).toContain(`translateX(-${SPLASH_TRACK.barWidth}px)`);
    expect(html).toContain(`translateX(${SPLASH_TRACK.width}px)`);
  });

  it("keeps the static message in sync with the React splash", () => {
    expect(readIndexHtml()).toContain(SPLASH_DEFAULT_MESSAGE);
  });

  it("links the skip link, the boot node, and the app landmark", () => {
    const html = readIndexHtml();

    expect(html).toContain(`href="#${MAIN_CONTENT_ID}"`);
    expect(html).toContain(`id="${BOOT_SPLASH_ID}"`);
  });
});

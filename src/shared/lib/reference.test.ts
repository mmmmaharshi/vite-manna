import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";

import { buildPermalinkUrl, formatReference } from "./reference";

describe(formatReference, () => {
  it("names the book and chapter, and appends the verse when given", () => {
    expect(formatReference(1, 1)).toBe("ఆదికాండము 1");
    expect(formatReference(43, 3)).toBe("యోహాను 3");
    expect(formatReference(43, 3, 16)).toBe("యోహాను 3:16");
  });
});

describe(buildPermalinkUrl, () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      location: new URL("https://manna.test/?book=1&chapter=1#stale"),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sets the verse params and drops hash and stale params", () => {
    expect(buildPermalinkUrl(43, 3, 16)).toBe(
      "https://manna.test/?book=43&chapter=3&verse=16"
    );
  });
});

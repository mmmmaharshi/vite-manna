import { describe, expect, it } from "vite-plus/test";

import { fontSizeClass, isFontSize } from "../font-size";

describe(isFontSize, () => {
  it("accepts the sizes and rejects anything else", () => {
    expect(isFontSize("sm")).toBeTruthy();
    expect(isFontSize("2xl")).toBeTruthy();
    expect(isFontSize("huge")).toBeFalsy();
    expect(isFontSize(16)).toBeFalsy();
  });
});

describe(fontSizeClass, () => {
  it("maps every size to a text size class", () => {
    expect(fontSizeClass("sm")).toBe("text-sm");
    expect(fontSizeClass("2xl")).toBe("text-2xl");
  });
});

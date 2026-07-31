import { describe, expect, it } from "vitest";

import { MAX_REASONABLE_ID, parsePositiveInteger } from "../parsePositiveInteger";

describe("parsePositiveInteger", () => {
  it("parses valid positive integers", () => {
    expect(parsePositiveInteger("3")).toBe(3);
    expect(parsePositiveInteger("199")).toBe(199);
    expect(parsePositiveInteger("1")).toBe(1);
  });

  it("rejects non-numeric input", () => {
    expect(parsePositiveInteger("abc")).toBeNull();
    expect(parsePositiveInteger(null)).toBeNull();
    expect(parsePositiveInteger("")).toBeNull();
  });

  it("rejects zero, negatives, and out-of-range values", () => {
    expect(parsePositiveInteger("0")).toBeNull();
    expect(parsePositiveInteger("-5")).toBeNull();
    expect(parsePositiveInteger(String(MAX_REASONABLE_ID + 1))).toBeNull();
  });

  it("rejects non-integers", () => {
    expect(parsePositiveInteger("3.5")).toBeNull();
  });

  it("respects a custom max", () => {
    expect(parsePositiveInteger("150", 100)).toBeNull();
    expect(parsePositiveInteger("99", 100)).toBe(99);
  });
});

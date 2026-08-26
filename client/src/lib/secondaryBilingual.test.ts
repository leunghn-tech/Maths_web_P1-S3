import { describe, expect, it } from "vitest";
import { localizeSecondaryOption } from "./secondaryBilingual";

describe("localizeSecondaryOption", () => {
  it("shows the Chinese half of a paired CMI option", () => {
    expect(localizeSecondaryOption("相等 / Equal", "zh")).toBe("相等");
  });

  it("shows the English half or translated English option in EMI mode", () => {
    expect(localizeSecondaryOption("相等 / Equal", "en")).toBe("Equal");
    expect(localizeSecondaryOption("互補", "en")).toBe("Supplementary");
    expect(localizeSecondaryOption("任何很大的數", "en")).toBe("Any very large number");
    expect(localizeSecondaryOption("原本金", "en")).toBe("Original principal");
  });
});

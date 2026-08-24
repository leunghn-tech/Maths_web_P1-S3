import { describe, expect, it } from "vitest";
import { evaluatePasswordStrength } from "./passwordStrength";

describe("evaluatePasswordStrength", () => {
  it("identifies common or repeated passwords as weak", () => {
    expect(evaluatePasswordStrength("password123").score).toBeLessThanOrEqual(1);
    expect(evaluatePasswordStrength("aaaa1111").score).toBeLessThanOrEqual(1);
  });

  it("recommends a long mixed unique password", () => {
    const result = evaluatePasswordStrength("Maths!Quest2026");
    expect(result.score).toBe(4);
    expect(result.label).toBe("強健");
  });
});

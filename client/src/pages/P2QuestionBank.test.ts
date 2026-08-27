import { describe, expect, it } from "vitest";
import { randomChoices } from "./P2Practice";
import { fractionLabel } from "./P2P3StarterPractice";

describe("P2 question-bank checks", () => {
  it("provides four distinct positive options for small multiplication and division answers", () => {
    for (const answer of [1, 3, 8, 49, 81]) {
      const choices = randomChoices(answer);
      expect(choices).toHaveLength(4);
      expect(new Set(choices).size).toBe(4);
      expect(choices).toContain(answer);
      expect(choices.every((choice) => choice >= 1)).toBe(true);
    }
  });

  it("calculates change and pictograph totals from the stated quantities", () => {
    expect(10 - 8).toBe(2);
    expect(50 - 35).toBe(15);
    expect(3 * 2).toBe(6);
    expect(4 * 5).toBe(20);
  });

  it("uses the formal fraction wording for one quarter", () => {
    expect(fractionLabel(2)).toBe("一半");
    expect(fractionLabel(4)).toBe("四分之一");
  });
});

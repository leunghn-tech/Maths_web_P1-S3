import { describe, expect, it } from "vitest";
import { choicesFor } from "./P1NumbersPractice";
import { numberLineChoices } from "./P1NumberLinePractice";
import { rotationItems } from "./P1SpatialPractice";

describe("P1 question-bank boundary checks", () => {
  it("provides four distinct, in-range options when 100 is the answer", () => {
    const choices = choicesFor(100);
    expect(choices).toHaveLength(4);
    expect(new Set(choices).size).toBe(4);
    expect(choices).toContain(100);
    expect(choices.every((choice) => choice >= 1 && choice <= 100)).toBe(true);
  });

  it("provides four distinct, in-range choices at both ends of the P1 number line", () => {
    for (const choices of [numberLineChoices(0, 2, "backward"), numberLineChoices(20, 2, "forward")]) {
      expect(choices).toHaveLength(4);
      expect(new Set(choices).size).toBe(4);
      expect(choices.every((choice) => choice >= 0 && choice <= 20)).toBe(true);
    }
  });

  it("uses only rotation targets reachable through 45-degree turns", () => {
    expect(rotationItems.every((item) => item.degree % 45 === 0)).toBe(true);
  });
});

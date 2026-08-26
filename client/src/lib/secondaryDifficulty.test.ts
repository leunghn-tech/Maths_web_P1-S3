import { describe, expect, it } from "vitest";
import { getDifficultyQuestionIndex, getSecondaryDifficulty } from "./secondaryDifficulty";

describe("secondary difficulty routing", () => {
  it("reads a valid difficulty and defaults safely to standard", () => {
    expect(getSecondaryDifficulty("?difficulty=basic")).toBe("basic");
    expect(getSecondaryDifficulty("?difficulty=challenge")).toBe("challenge");
    expect(getSecondaryDifficulty("?difficulty=unknown")).toBe("standard");
  });

  it("routes the eight-question flow to foundation, full, or challenge bands", () => {
    expect(getDifficultyQuestionIndex("basic", 5, 8)).toBe(1);
    expect(getDifficultyQuestionIndex("standard", 5, 8)).toBe(5);
    expect(getDifficultyQuestionIndex("challenge", 5, 8)).toBe(5);
    expect(getDifficultyQuestionIndex("challenge", 0, 8)).toBe(4);
  });
});

import { describe, expect, it } from "vitest";
import { getDifficultyQuestionIndex, getSecondaryDifficulty } from "./secondaryDifficulty";

describe("secondary question routing", () => {
  it("always uses the single standard learning mode", () => {
    expect(getSecondaryDifficulty("?difficulty=basic")).toBe("standard");
    expect(getSecondaryDifficulty("?difficulty=challenge")).toBe("standard");
    expect(getSecondaryDifficulty("?difficulty=unknown")).toBe("standard");
  });

  it("keeps every learner on the same continuous eight-question sequence", () => {
    expect(getDifficultyQuestionIndex("basic", 0, 8)).toBe(0);
    expect(getDifficultyQuestionIndex("standard", 5, 8)).toBe(5);
    expect(getDifficultyQuestionIndex("challenge", 7, 8)).toBe(7);
  });
});

import { describe, expect, it } from "vitest";
import { formatQuestionProgress } from "./PracticeQuestionProgress";

describe("formatQuestionProgress", () => {
  it("以正式中文顯示目前題數與總題數", () => {
    expect(formatQuestionProgress(1, 8)).toBe("第 1 題／共 8 題");
  });

  it("把不合範圍的目前題數限制在有效範圍", () => {
    expect(formatQuestionProgress(0, 8)).toBe("第 1 題／共 8 題");
    expect(formatQuestionProgress(12, 8)).toBe("第 8 題／共 8 題");
  });
});

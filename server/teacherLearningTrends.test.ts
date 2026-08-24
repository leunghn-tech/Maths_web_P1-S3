import { describe, expect, it } from "vitest";
import { buildTeacherLearningTrends, getLearningDomain } from "./teacherLearningTrends";

describe("teacher learning trends", () => {
  it("maps practice keys to the intended learning domains", () => {
    expect(getLearningDomain("P1-time")).toBe("度量");
    expect(getLearningDomain("S3-probability")).toBe("數據處理");
    expect(getLearningDomain("P4-triangle-area")).toBe("圖形與空間");
  });

  it("builds score and domain trends from real completion and review records", () => {
    const result = buildTeacherLearningTrends([
      { practiceKey: "P1-add-subtract", bestScore: 6, completedAt: new Date("2026-08-01") },
      { practiceKey: "P1-time", bestScore: 8, completedAt: new Date("2026-08-02") },
      { practiceKey: "P1-time", bestScore: 8, completedAt: new Date("2026-08-03") },
    ], [{ practiceKey: "P1-add-subtract", misses: 2 }]);
    expect(result.scoreTrend.map((item) => item.scorePercent)).toEqual([75, 100, 100]);
    expect(result.domainTrend.find((item) => item.domain === "數與代數")).toMatchObject({ completed: 1, accuracy: 75 });
    expect(result.domainTrend.find((item) => item.domain === "度量")).toMatchObject({ completed: 1, accuracy: 100 });
  });
});

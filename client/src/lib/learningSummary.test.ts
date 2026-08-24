import { describe, expect, it } from "vitest";
import { buildLearningSummary } from "./learningSummary";

describe("buildLearningSummary", () => {
  it("groups the current student's stations by grade and domain, including recorded mistakes in accuracy", () => {
    const summary = buildLearningSummary(
      [{ practiceKey: "p1-add-subtract", bestScore: 6 }, { practiceKey: "p1-time", bestScore: 8 }, { practiceKey: "s3-probability", bestScore: 7 }],
      [{ practiceKey: "p1-add-subtract", misses: 2 }, { practiceKey: "s3-probability", misses: 1 }],
    );
    const p1 = summary.find((item) => item.grade === "P1");
    const s3 = summary.find((item) => item.grade === "S3");
    expect(p1?.domains.find((item) => item.domain === "數與代數")).toMatchObject({ completed: 1, total: 4, completionPercent: 25, accuracy: 75 });
    expect(p1?.domains.find((item) => item.domain === "度量")).toMatchObject({ completed: 1, total: 2, accuracy: 100 });
    expect(s3?.domains.find((item) => item.domain === "數據處理")).toMatchObject({ completed: 1, total: 2, accuracy: 88 });
  });
});

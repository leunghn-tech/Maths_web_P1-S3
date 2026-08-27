import { describe, expect, it } from "vitest";
import { getPriorityReviewItems, getStudentStartHref } from "./studentDashboard";

describe("student dashboard helpers", () => {
  it("starts from the learner's saved primary grade and falls back to P1", () => {
    expect(getStudentStartHref("P5")).toBe("/practice/p5-fractions");
    expect(getStudentStartHref("S3")).toBe("/practice/p1-add-subtract");
  });

  it("lists primary review items by misses, omitting removed secondary routes", () => {
    const items = getPriorityReviewItems([
      { grade: "P1", title: "加法", href: "/practice/p1-add-subtract", misses: 2, updatedAt: "2026-08-20" },
      { grade: "P5", title: "體積", href: "/practice/p5-volume", misses: 4, updatedAt: "2026-08-19" },
      { grade: "S3", title: "不等式", href: "/practice/s3-inequality", misses: 9, updatedAt: "2026-08-21" },
    ]);
    expect(items.map((item) => item.title)).toEqual(["體積", "加法"]);
  });
});

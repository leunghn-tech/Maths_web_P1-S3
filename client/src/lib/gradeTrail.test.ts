import { describe, expect, it } from "vitest";
import { orderGradeTrail } from "./gradeTrail";

describe("orderGradeTrail", () => {
  it("keeps the complete P1–S3 route in curriculum order", () => {
    const grades = orderGradeTrail([
      { grade: "S2" }, { grade: "P6" }, { grade: "P1" }, { grade: "S3" }, { grade: "P4" },
      { grade: "S1" }, { grade: "P2" }, { grade: "P5" }, { grade: "P3" },
    ]);

    expect(grades.map((item) => item.grade)).toEqual(["P1", "P2", "P3", "P4", "P5", "P6", "S1", "S2", "S3"]);
  });
});

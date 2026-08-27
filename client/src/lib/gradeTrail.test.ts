import { describe, expect, it } from "vitest";
import { orderGradeTrail } from "./gradeTrail";

describe("orderGradeTrail", () => {
  it("keeps the P1–P6 route in curriculum order", () => {
    const grades = orderGradeTrail([
      { grade: "P6" }, { grade: "P1" }, { grade: "P4" }, { grade: "P2" }, { grade: "P5" }, { grade: "P3" },
    ]);

    expect(grades.map((item) => item.grade)).toEqual(["P1", "P2", "P3", "P4", "P5", "P6"]);
  });
});

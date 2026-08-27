import { describe, expect, it } from "vitest";
import { getPrimaryGradeFromPracticePath, isPrimaryGrade } from "./primaryGradeNavigation";

describe("primary grade navigation", () => {
  it("recognises every retained primary practice route and rejects removed secondary routes", () => {
    expect(getPrimaryGradeFromPracticePath("/practice/p5-fractions")).toBe("P5");
    expect(getPrimaryGradeFromPracticePath("/practice/p1-time")).toBe("P1");
    expect(getPrimaryGradeFromPracticePath("/practice/p6-profit")).toBe("P6");
    expect(getPrimaryGradeFromPracticePath("/practice/s3-interactive")).toBeNull();
  });

  it("only accepts P1–P6 as remembered homepage grades", () => {
    expect(isPrimaryGrade("P5")).toBe(true);
    expect(isPrimaryGrade("S1")).toBe(false);
    expect(isPrimaryGrade(null)).toBe(false);
  });
});

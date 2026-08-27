import { describe, expect, it } from "vitest";
import { displayFraction, generateFraction } from "./P5FractionPractice";
import { generateUnlikeFractions, reduce } from "./P5UnlikeFractionsPractice";
import { fractions } from "./P5CorePractice";

describe("P5 分數題庫品質", () => {
  it("最簡分數以正式中文分數名稱呈現，整數不顯示分母一", () => {
    expect(displayFraction(3, 4)).toBe("四分之三");
    expect(displayFraction(6, 8)).toBe("四分之三");
    expect(displayFraction(12, 3)).toBe("四");
    expect(reduce(10, 15)).toBe("三分之二");
  });

  it("分數乘除的三個難度均提供四個互異選項且含正確答案", () => {
    for (const difficulty of ["easy", "standard", "challenge"] as const) {
      for (let sample = 0; sample < 24; sample += 1) {
        const problem = generateFraction(difficulty);
        expect(problem.choices).toHaveLength(4);
        expect(new Set(problem.choices).size).toBe(4);
        expect(problem.choices).toContain(problem.answer);
        expect(`${problem.equation} ${problem.answer} ${problem.choices.join(" ")}`).not.toMatch(/\d+\/\d+/);
      }
    }
  });

  it("異分母加減在挑戰難度仍有四個互異選項，且學生題面不用斜線分數", () => {
    for (let sample = 0; sample < 36; sample += 1) {
      const problem = generateUnlikeFractions("challenge");
      expect(problem.choices).toHaveLength(4);
      expect(new Set(problem.choices).size).toBe(4);
      expect(problem.choices).toContain(problem.answer);
      expect(`${problem.equation} ${problem.answer} ${problem.choices.join(" ")}`).not.toMatch(/\d+\/\d+/);
    }
  });

  it("固定異分母分數加法八題同樣使用中文分數名稱與四個互異選項", () => {
    expect(fractions).toHaveLength(8);
    for (const question of fractions) {
      expect(`${question.equation} ${question.answer} ${question.choices.join(" ")}`).not.toMatch(/\d+\/\d+/);
      expect(question.choices).toHaveLength(4);
      expect(new Set(question.choices).size).toBe(4);
      expect(question.choices).toContain(question.answer);
    }
  });
});

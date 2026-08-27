import { describe, expect, it } from "vitest";
import { questionSets } from "./P4Practice";
import { fractionQuestions } from "./P4VisualPractice";
import { quadrilateralQuestions } from "./P4CompletePractice";
import { comparisonChoices, comparisonQuestions } from "./P4AdvancedDataPractice";

describe("P4 題庫品質", () => {
  it("每個分數與小數題組均有八題、四個互異選項及正確答案", () => {
    for (const questions of Object.values(questionSets)) {
      expect(questions).toHaveLength(8);
      for (const question of questions) {
        expect(question.choices).toHaveLength(4);
        expect(new Set(question.choices).size).toBe(4);
        expect(question.choices).toContain(question.answer);
      }
    }
  });

  it("P4 分數題面以中文分數名稱呈現，不以斜線作學生答案格式", () => {
    for (const question of [...questionSets.fractions, ...questionSets.convert]) {
      expect(question.expression).not.toMatch(/\d+\/\d+/);
      expect(question.answer).not.toMatch(/\d+\/\d+/);
      expect(question.choices.join(" ")).not.toMatch(/\d+\/\d+/);
    }
  });

  it("分數視覺站八題均有四個互異選項並包含正確答案", () => {
    expect(fractionQuestions).toHaveLength(8);
    for (const question of fractionQuestions) {
      expect(new Set(question.choices).size).toBe(4);
      expect(question.choices).toContain(question.answer);
      expect(question.left + question.right).toBe(question.shaded);
    }
  });

  it("四邊形站提供八條不同的性質題目", () => {
    expect(quadrilateralQuestions).toHaveLength(8);
    expect(new Set(quadrilateralQuestions.map((question) => question.feature)).size).toBe(8);
  });

  it("棒形圖比較題的答案正確，並一直提供四個互異正數選項", () => {
    for (const question of comparisonQuestions) {
      expect(question.answer).toBe(Math.abs(question.a - question.b) * question.unit);
      const options = comparisonChoices(question);
      expect(options).toHaveLength(4);
      expect(new Set(options).size).toBe(4);
      expect(options).toContain(`${question.answer} 人`);
    }
  });
});

import { describe, expect, it } from "vitest";
import { generateLevelQuestions } from "./P3Practice";

describe("P3 mixed-operation question bank", () => {
  it("generates eight positive-answer questions with four distinct choices at every level", () => {
    for (const level of [1, 2, 3] as const) {
      for (const question of generateLevelQuestions(level)) {
        expect(question.answer).toBeGreaterThan(0);
        expect(question.choices).toHaveLength(4);
        expect(new Set(question.choices).size).toBe(4);
        expect(question.choices).toContain(question.answer);
      }
    }
  });
});

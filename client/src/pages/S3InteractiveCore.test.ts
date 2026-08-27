import { describe, expect, it } from "vitest";
import { inequalityQuestions, isCorrectInequalityChoice } from "./S3InteractiveCore";

describe("S3 inequality number-line choices", () => {
  it("provides exactly four distinct complete representations and a unique answer for every task", () => {
    expect(inequalityQuestions).toHaveLength(8);
    inequalityQuestions.forEach((question) => {
      const keys = question.choices.map((choice) => choice.key);
      expect(new Set(keys).size).toBe(4);
      expect(keys).toContain(question.correct);
      expect(isCorrectInequalityChoice(question, question.correct)).toBe(true);
      keys.filter((key) => key !== question.correct).forEach((key) => {
        expect(isCorrectInequalityChoice(question, key)).toBe(false);
      });
    });
  });

  it("uses the correct open point and rightward ray for x > 3", () => {
    const firstQuestion = inequalityQuestions[0];
    expect(firstQuestion.correct).toBe("open-right-3");
    expect(firstQuestion.choices.find((choice) => choice.key === firstQuestion.correct)?.zh).toBe("○ 3，向右");
  });
});

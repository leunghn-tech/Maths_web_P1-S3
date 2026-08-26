export type SecondaryDifficulty = "basic" | "standard" | "challenge";

export const secondaryDifficultyOrder: SecondaryDifficulty[] = ["basic", "standard", "challenge"];

export function getSecondaryDifficulty(search = window.location.search): SecondaryDifficulty {
  const value = new URLSearchParams(search).get("difficulty");
  return value === "basic" || value === "challenge" ? value : "standard";
}

export function getDifficultyQuestionIndex(difficulty: SecondaryDifficulty, progressIndex: number, total: number) {
  if (total < 1) return 0;
  const normalizedProgress = Math.max(progressIndex, 0) % 8;
  const basicRange = Math.min(4, total);
  const challengeStart = Math.max(total - 4, 0);
  if (difficulty === "basic") return normalizedProgress % basicRange;
  if (difficulty === "challenge") return challengeStart + (normalizedProgress % Math.min(4, total));
  return normalizedProgress % total;
}

export function getDifficultyLabels(difficulty: SecondaryDifficulty, language: "zh" | "en") {
  const labels = {
    basic: ["基礎", "Foundation"],
    standard: ["標準", "Standard"],
    challenge: ["挑戰", "Challenge"],
  } as const;
  return labels[difficulty][language === "zh" ? 0 : 1];
}

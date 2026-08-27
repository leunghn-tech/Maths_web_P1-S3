export type SecondaryDifficulty = "basic" | "standard" | "challenge";

export const secondaryDifficultyOrder: SecondaryDifficulty[] = ["basic", "standard", "challenge"];

export function getSecondaryDifficulty(search = window.location.search): SecondaryDifficulty {
  void search;
  return "standard";
}

export function getDifficultyQuestionIndex(difficulty: SecondaryDifficulty, progressIndex: number, total: number) {
  void difficulty;
  if (total < 1) return 0;
  return Math.min(Math.max(progressIndex, 0), total - 1);
}

export function getDifficultyLabels(difficulty: SecondaryDifficulty, language: "zh" | "en") {
  const labels = {
    basic: ["基礎", "Foundation"],
    standard: ["標準", "Standard"],
    challenge: ["挑戰", "Challenge"],
  } as const;
  return labels[difficulty][language === "zh" ? 0 : 1];
}

export function getDifficultyDescription(difficulty: SecondaryDifficulty, language: "zh" | "en") {
  const descriptions = {
    basic: ["單一概念、較小數值、三個選項及完整提示", "One concept, smaller values, three choices and full guidance"],
    standard: ["完整課程題型、常規數值、四個選項及一般提示", "Full syllabus format, standard values, four choices and a normal cue"],
    challenge: ["較複雜題組、多步推理、四個選項及無提示", "Harder item set, multi-step reasoning, four choices and no cue"],
  } as const;
  return descriptions[difficulty][language === "zh" ? 0 : 1];
}

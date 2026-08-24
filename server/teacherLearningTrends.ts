export type LearningDomain = "數與代數" | "度量" | "圖形與空間" | "數據處理";

type ProgressRecord = { practiceKey: string; bestScore: number; completedAt: Date };
type ReviewRecord = { practiceKey: string; misses: number };

const domains: LearningDomain[] = ["數與代數", "度量", "圖形與空間", "數據處理"];

export function getLearningDomain(practiceKey: string): LearningDomain {
  const value = practiceKey.toLowerCase();
  if (/(chart|data|stats|pictograph|pie|central|probability)/.test(value)) return "數據處理";
  if (/(shape|spatial|geometry|angle|coordinate|direction|line|polygon|triangle|quad|transform|similarity|pythagoras|trig|slope|proof|mensuration|nets)/.test(value)) return "圖形與空間";
  if (/(time|measure|length|weight|capacity|perimeter|area|volume|money|water|circle|estimation)/.test(value)) return "度量";
  return "數與代數";
}

export function buildTeacherLearningTrends(progress: ProgressRecord[], reviews: ReviewRecord[]) {
  const missesByPractice = new Map(reviews.map((review) => [review.practiceKey, review.misses]));
  const scoreTrend = [...progress].sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime()).slice(-8).map((item, index) => ({
    sequence: index + 1,
    completedAt: item.completedAt,
    scorePercent: Math.round((item.bestScore / 8) * 100),
  }));
  const domainTrend = domains.map((domain) => {
    const records = progress.filter((record) => getLearningDomain(record.practiceKey) === domain);
    const correctAnswers = records.reduce((total, record) => total + record.bestScore, 0);
    const incorrectAnswers = records.reduce((total, record) => total + (missesByPractice.get(record.practiceKey) ?? 0), 0);
    const attempts = correctAnswers + incorrectAnswers;
    return { domain, completed: new Set(records.map((record) => record.practiceKey)).size, accuracy: attempts ? Math.round((correctAnswers / attempts) * 100) : null as number | null };
  });
  return { scoreTrend, domainTrend };
}

export type LearningDomain = "數與代數" | "度量" | "圖形與空間" | "數據處理";
export type LearningGrade = "P1" | "P2" | "P3" | "P4" | "P5" | "P6";

type ProgressRecord = { practiceKey: string; bestScore: number };
type ReviewRecord = { practiceKey: string; misses: number };

const grades: LearningGrade[] = ["P1", "P2", "P3", "P4", "P5", "P6"];
const curriculumTotals: Record<LearningGrade, Record<LearningDomain, number>> = {
  P1: { "數與代數": 4, "度量": 2, "圖形與空間": 3, "數據處理": 1 }, P2: { "數與代數": 4, "度量": 3, "圖形與空間": 3, "數據處理": 1 }, P3: { "數與代數": 3, "度量": 3, "圖形與空間": 3, "數據處理": 2 }, P4: { "數與代數": 4, "度量": 2, "圖形與空間": 3, "數據處理": 1 }, P5: { "數與代數": 3, "度量": 2, "圖形與空間": 3, "數據處理": 2 }, P6: { "數與代數": 4, "度量": 3, "圖形與空間": 2, "數據處理": 2 },
};
const domainOrder: LearningDomain[] = ["數與代數", "度量", "圖形與空間", "數據處理"];

function getGrade(key: string): LearningGrade | null { const match = key.toUpperCase().match(/^P[1-6]-/); return match ? match[0].slice(0, 2) as LearningGrade : null; }
function getDomain(key: string, grade: LearningGrade): LearningDomain {
  const value = key.toLowerCase();
  if (/(chart|data|stats|pictograph|pie|central|probability)/.test(value)) return "數據處理";
  if (/(shape|spatial|geometry|angle|coordinate|direction|line|polygon|triangle|quad|transform|similarity|pythagoras|trig|slope|proof|mensuration|nets)/.test(value)) return "圖形與空間";
  if (/(time|measure|length|weight|capacity|perimeter|area|volume|money|water|circle|estimation)/.test(value)) return "度量";
  return "數與代數";
}

export type DomainLearningSummary = { domain: LearningDomain; completed: number; total: number; completionPercent: number; correctAnswers: number; attempts: number; accuracy: number | null };
export type GradeLearningSummary = { grade: LearningGrade; domains: DomainLearningSummary[]; completed: number; total: number; completionPercent: number; correctAnswers: number; attempts: number; accuracy: number | null };

export function buildLearningSummary(progress: ProgressRecord[] = [], reviews: ReviewRecord[] = []): GradeLearningSummary[] {
  const mistakes = new Map(reviews.map((record) => [record.practiceKey, record.misses]));
  return grades.map((grade) => {
    const domains = domainOrder.filter((domain) => curriculumTotals[grade][domain] > 0).map((domain) => {
      const records = progress.filter((record) => getGrade(record.practiceKey) === grade && getDomain(record.practiceKey, grade) === domain);
      const completed = new Set(records.map((record) => record.practiceKey)).size;
      const correctAnswers = records.reduce((sum, record) => sum + record.bestScore, 0);
      const incorrectAnswers = records.reduce((sum, record) => sum + (mistakes.get(record.practiceKey) ?? 0), 0);
      const attempts = correctAnswers + incorrectAnswers;
      const total = curriculumTotals[grade][domain];
      return { domain, completed, total, completionPercent: Math.min(100, Math.round((completed / total) * 100)), correctAnswers, attempts, accuracy: attempts ? Math.round((correctAnswers / attempts) * 100) : null };
    });
    const completed = domains.reduce((sum, domain) => sum + domain.completed, 0);
    const total = domains.reduce((sum, domain) => sum + domain.total, 0);
    const correctAnswers = domains.reduce((sum, domain) => sum + domain.correctAnswers, 0);
    const attempts = domains.reduce((sum, domain) => sum + domain.attempts, 0);
    return { grade, domains, completed, total, completionPercent: Math.min(100, Math.round((completed / total) * 100)), correctAnswers, attempts, accuracy: attempts ? Math.round((correctAnswers / attempts) * 100) : null };
  });
}

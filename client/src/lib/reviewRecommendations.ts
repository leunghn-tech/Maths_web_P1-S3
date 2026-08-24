export type ReviewRecord = { key: string; grade: string; title: string; href: string; misses: number; updatedAt: number };
const KEY = "maths-quest:review-recommendations";
export const REVIEW_RECOMMENDATIONS_EVENT = "maths-quest:review-updated";

export function getReviewRecords(): ReviewRecord[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]") as ReviewRecord[]; } catch { return []; }
}

export function recordPracticeMistake(input: Omit<ReviewRecord, "misses" | "updatedAt">) {
  if (typeof window === "undefined") return;
  const records = getReviewRecords(); const match = records.find((item) => item.key === input.key);
  const next = match ? records.map((item) => item.key === input.key ? { ...item, misses: item.misses + 1, updatedAt: Date.now() } : item) : [{ ...input, misses: 1, updatedAt: Date.now() }, ...records];
  localStorage.setItem(KEY, JSON.stringify(next)); window.dispatchEvent(new CustomEvent(REVIEW_RECOMMENDATIONS_EVENT));
}

export function getReviewRecommendations(limit = 4) { return getReviewRecords().sort((a, b) => b.misses - a.misses || b.updatedAt - a.updatedAt).slice(0, limit); }
export function resetReviewRecommendations() { if (typeof window !== "undefined") localStorage.removeItem(KEY); }

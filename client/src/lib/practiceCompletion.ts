/** Maths Quest completion records are kept in local storage so the student can see progress when returning to the library. */
export const PRACTICE_COMPLETION_EVENT = "maths-quest:completion-updated";
const STORAGE_KEY = "maths-quest:completed-practices";

export function getCompletedPractices(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) as string[] : [];
  } catch {
    return [];
  }
}

export function markPracticeCompleted(practiceId: string) {
  if (typeof window === "undefined") return;
  const completed = new Set(getCompletedPractices());
  completed.add(practiceId);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(completed)));
  window.dispatchEvent(new CustomEvent(PRACTICE_COMPLETION_EVENT));
}

export function resetPracticeProgress() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(PRACTICE_COMPLETION_EVENT));
}

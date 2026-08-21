/** 每日練習與連續打卡資料只保存在學生的瀏覽器中，不收集任何個人資料。 */
export const DAILY_TARGET = 3;
export const DAILY_PROGRESS_EVENT = "maths-quest:daily-progress-updated";
const STORAGE_KEY = "maths-quest:daily-practice";

type DailyHistory = Record<string, string[]>;

export type DailyPracticeProgress = {
  completed: number;
  target: number;
  streak: number;
  reachedGoal: boolean;
};

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateOffset(key: string, amount: number) {
  const date = new Date(`${key}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return getDateKey(date);
}

function getHistory(): DailyHistory {
  if (typeof window === "undefined") return {};
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) as DailyHistory : {};
  } catch {
    return {};
  }
}

function getStreak(history: DailyHistory, today: string) {
  let cursor = history[today]?.length ? today : dateOffset(today, -1);
  let streak = 0;
  while (history[cursor]?.length) {
    streak += 1;
    cursor = dateOffset(cursor, -1);
  }
  return streak;
}

export function getDailyPracticeProgress(): DailyPracticeProgress {
  const history = getHistory();
  const today = getDateKey();
  const completed = history[today]?.length ?? 0;
  return { completed, target: DAILY_TARGET, streak: getStreak(history, today), reachedGoal: completed >= DAILY_TARGET };
}

export function recordDailyPractice(practiceId: string) {
  if (typeof window === "undefined") return getDailyPracticeProgress();
  const history = getHistory();
  const today = getDateKey();
  const todayRecords = new Set(history[today] ?? []);
  todayRecords.add(practiceId);
  history[today] = Array.from(todayRecords);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  window.dispatchEvent(new CustomEvent(DAILY_PROGRESS_EVENT));
  return getDailyPracticeProgress();
}

export function resetDailyPractice() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(DAILY_PROGRESS_EVENT));
}

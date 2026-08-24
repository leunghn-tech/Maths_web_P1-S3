/**
 * Maths Quest — login migration boundary.
 * The current guest experience remains local-first; after the full-stack upgrade,
 * the authenticated sync flow will submit this typed snapshot through protected tRPC procedures.
 */
export const LOCAL_LEARNING_STORAGE_KEYS = {
  completedPractices: "maths-quest:completed-practices",
  dailyHistory: "maths-quest:daily-practice",
  dailyTarget: "maths-quest:daily-target",
  reviewRecords: "maths-quest:review-recommendations",
  pinnedPractices: "maths-quest:pinned-practices",
} as const;

export type LocalLearningSnapshot = {
  schemaVersion: 1;
  exportedAt: number;
  completedPractices: string[];
  dailyHistory: Record<string, string[]>;
  dailyTarget: number | null;
  reviewRecords: Array<{ key: string; grade: string; title: string; href: string; misses: number; updatedAt: number }>;
  pinnedPractices: string[];
};

export type CloudLearningOverview = {
  profile: { dailyTarget: number };
  progress: Array<{ practiceKey: string }>;
  dailyRecords: Array<{ practicedOn: Date | string; practiceKey: string }>;
  reviewRecords: Array<{ practiceKey: string; grade: string; title: string; href: string; misses: number; updatedAt: Date | string }>;
  pinnedPractices: Array<{ practiceKey: string; position: number }>;
};

function readJson(value: string | null): unknown {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return null; }
}

function toStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function toDailyHistory(value: unknown): Record<string, string[]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).map(([date, ids]) => [date, toStringList(ids)]));
}

function toReviewRecords(value: unknown): LocalLearningSnapshot["reviewRecords"] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is LocalLearningSnapshot["reviewRecords"][number] => Boolean(
    item && typeof item === "object" && typeof item.key === "string" && typeof item.grade === "string" && typeof item.title === "string" && typeof item.href === "string" && typeof item.misses === "number" && typeof item.updatedAt === "number",
  ));
}

/** Creates a non-destructive, schema-versioned export for the first successful account sync. */
export function getLocalLearningSnapshot(): LocalLearningSnapshot {
  if (typeof window === "undefined") {
    return { schemaVersion: 1, exportedAt: Date.now(), completedPractices: [], dailyHistory: {}, dailyTarget: null, reviewRecords: [], pinnedPractices: [] };
  }
  const targetValue = Number(window.localStorage.getItem(LOCAL_LEARNING_STORAGE_KEYS.dailyTarget));
  return {
    schemaVersion: 1,
    exportedAt: Date.now(),
    completedPractices: toStringList(readJson(window.localStorage.getItem(LOCAL_LEARNING_STORAGE_KEYS.completedPractices))),
    dailyHistory: toDailyHistory(readJson(window.localStorage.getItem(LOCAL_LEARNING_STORAGE_KEYS.dailyHistory))),
    dailyTarget: Number.isInteger(targetValue) && targetValue >= 1 && targetValue <= 6 ? targetValue : null,
    reviewRecords: toReviewRecords(readJson(window.localStorage.getItem(LOCAL_LEARNING_STORAGE_KEYS.reviewRecords))),
    pinnedPractices: toStringList(readJson(window.localStorage.getItem(LOCAL_LEARNING_STORAGE_KEYS.pinnedPractices))),
  };
}

export function hasLocalLearningData(snapshot = getLocalLearningSnapshot()) {
  return snapshot.completedPractices.length > 0 || Object.keys(snapshot.dailyHistory).length > 0 || snapshot.dailyTarget !== null || snapshot.reviewRecords.length > 0 || snapshot.pinnedPractices.length > 0;
}

/** Local records must never be erased automatically; this marker only records a confirmed cloud import. */
export function markLocalSnapshotMigrated(openId: string) {
  if (typeof window === "undefined" || !openId) return;
  window.localStorage.setItem(`maths-quest:migration-v1:${openId}`, String(Date.now()));
}

/**
 * Hydrates an authenticated device from cloud data without dropping newer local work.
 * Event dispatches preserve the existing React UI's local-first update flow.
 */
export function applyCloudLearningOverview(overview: CloudLearningOverview) {
  if (typeof window === "undefined") return;
  const local = getLocalLearningSnapshot();
  const completedPractices = Array.from(new Set([...local.completedPractices, ...overview.progress.map((item) => item.practiceKey)]));
  const dailyHistory = { ...local.dailyHistory };
  for (const record of overview.dailyRecords) {
    const date = new Date(record.practicedOn).toISOString().slice(0, 10);
    dailyHistory[date] = Array.from(new Set([...(dailyHistory[date] ?? []), record.practiceKey]));
  }
  const reviewByKey = new Map(local.reviewRecords.map((record) => [record.key, record]));
  for (const record of overview.reviewRecords) {
    const updatedAt = new Date(record.updatedAt).getTime();
    const localRecord = reviewByKey.get(record.practiceKey);
    reviewByKey.set(record.practiceKey, {
      key: record.practiceKey,
      grade: record.grade,
      title: record.title,
      href: record.href,
      misses: Math.max(localRecord?.misses ?? 0, record.misses),
      updatedAt: Math.max(localRecord?.updatedAt ?? 0, updatedAt),
    });
  }
  const pinnedPractices = overview.pinnedPractices.length
    ? [...overview.pinnedPractices].sort((a, b) => a.position - b.position).map((item) => item.practiceKey)
    : local.pinnedPractices;
  window.localStorage.setItem(LOCAL_LEARNING_STORAGE_KEYS.completedPractices, JSON.stringify(completedPractices));
  window.localStorage.setItem(LOCAL_LEARNING_STORAGE_KEYS.dailyHistory, JSON.stringify(dailyHistory));
  window.localStorage.setItem(LOCAL_LEARNING_STORAGE_KEYS.dailyTarget, String(overview.profile.dailyTarget));
  window.localStorage.setItem(LOCAL_LEARNING_STORAGE_KEYS.reviewRecords, JSON.stringify(Array.from(reviewByKey.values())));
  window.localStorage.setItem(LOCAL_LEARNING_STORAGE_KEYS.pinnedPractices, JSON.stringify(pinnedPractices));
  for (const event of ["maths-quest:completion-updated", "maths-quest:daily-progress-updated", "maths-quest:review-updated", "maths-quest:pinned-practices"]) window.dispatchEvent(new CustomEvent(event));
}

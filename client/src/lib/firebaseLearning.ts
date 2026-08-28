import { doc, getDoc, runTransaction } from "firebase/firestore";
import { firebaseDb } from "./firebaseClient";
import type { CloudLearningOverview, LocalLearningSnapshot } from "./localLearningSnapshot";

export type FirebaseLearningDocument = {
  schemaVersion: 1;
  ownerUid: string;
  email: string | null;
  displayName: string | null;
  exportedAt: number;
  completedPractices: string[];
  dailyHistory: Record<string, string[]>;
  dailyTarget: number | null;
  reviewRecords: LocalLearningSnapshot["reviewRecords"];
  pinnedPractices: string[];
  syncRevision: number;
  lastSyncedAt: number;
};

export type FirebaseLearningIdentity = { uid: string; email: string | null; displayName: string | null };

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function dailyHistory(value: unknown): Record<string, string[]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).map(([day, ids]) => [day, stringList(ids)]));
}

function reviews(value: unknown): LocalLearningSnapshot["reviewRecords"] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is LocalLearningSnapshot["reviewRecords"][number] => Boolean(item && typeof item === "object" && typeof item.key === "string" && typeof item.grade === "string" && typeof item.title === "string" && typeof item.href === "string" && typeof item.misses === "number" && typeof item.updatedAt === "number"));
}

export function normaliseFirebaseLearningDocument(value: unknown): FirebaseLearningDocument | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.ownerUid !== "string" || !record.ownerUid) return null;
  return {
    schemaVersion: 1, ownerUid: record.ownerUid, email: typeof record.email === "string" ? record.email : null, displayName: typeof record.displayName === "string" ? record.displayName : null,
    exportedAt: typeof record.exportedAt === "number" ? record.exportedAt : Date.now(), completedPractices: stringList(record.completedPractices), dailyHistory: dailyHistory(record.dailyHistory),
    dailyTarget: typeof record.dailyTarget === "number" && record.dailyTarget >= 1 && record.dailyTarget <= 6 ? record.dailyTarget : null, reviewRecords: reviews(record.reviewRecords), pinnedPractices: stringList(record.pinnedPractices),
    syncRevision: typeof record.syncRevision === "number" ? record.syncRevision : 0, lastSyncedAt: typeof record.lastSyncedAt === "number" ? record.lastSyncedAt : 0,
  };
}

export function toCloudLearningOverview(document: FirebaseLearningDocument): CloudLearningOverview {
  return {
    profile: { dailyTarget: document.dailyTarget ?? 3, syncRevision: document.syncRevision, lastSyncedAt: document.lastSyncedAt ? new Date(document.lastSyncedAt) : null },
    progress: document.completedPractices.map((practiceKey) => ({ practiceKey })),
    dailyRecords: Object.entries(document.dailyHistory).flatMap(([day, practiceKeys]) => practiceKeys.map((practiceKey) => ({ practicedOn: `${day}T00:00:00.000Z`, practiceKey }))),
    reviewRecords: document.reviewRecords.map((record) => ({ practiceKey: record.key, grade: record.grade, title: record.title, href: record.href, misses: record.misses, updatedAt: new Date(record.updatedAt) })),
    pinnedPractices: document.pinnedPractices.map((practiceKey, position) => ({ practiceKey, position })),
  };
}

export function mergeFirebaseLearningDocument(existing: FirebaseLearningDocument | null, identity: FirebaseLearningIdentity, snapshot: LocalLearningSnapshot, now = Date.now()): FirebaseLearningDocument {
  const completedPractices = Array.from(new Set([...(existing?.completedPractices ?? []), ...snapshot.completedPractices]));
  const mergedHistory = dailyHistory(existing?.dailyHistory);
  for (const [day, keys] of Object.entries(snapshot.dailyHistory)) mergedHistory[day] = Array.from(new Set([...(mergedHistory[day] ?? []), ...keys]));
  const reviewByKey = new Map((existing?.reviewRecords ?? []).map((record) => [record.key, record]));
  for (const record of snapshot.reviewRecords) {
    const current = reviewByKey.get(record.key);
    reviewByKey.set(record.key, !current || record.misses >= current.misses || record.updatedAt > current.updatedAt ? { ...record, misses: Math.max(record.misses, current?.misses ?? 0), updatedAt: Math.max(record.updatedAt, current?.updatedAt ?? 0) } : current);
  }
  return { schemaVersion: 1, ownerUid: identity.uid, email: identity.email ?? existing?.email ?? null, displayName: identity.displayName ?? existing?.displayName ?? null, exportedAt: snapshot.exportedAt, completedPractices, dailyHistory: mergedHistory, dailyTarget: snapshot.dailyTarget ?? existing?.dailyTarget ?? 3, reviewRecords: Array.from(reviewByKey.values()), pinnedPractices: Array.from(new Set([...(existing?.pinnedPractices ?? []), ...snapshot.pinnedPractices])), syncRevision: (existing?.syncRevision ?? 0) + 1, lastSyncedAt: now };
}

export async function loadFirebaseLearning(uid: string) {
  const snapshot = await getDoc(doc(firebaseDb, "studentLearning", uid));
  return snapshot.exists() ? normaliseFirebaseLearningDocument(snapshot.data()) : null;
}

export async function syncFirebaseLearning(identity: FirebaseLearningIdentity, snapshot: LocalLearningSnapshot) {
  const reference = doc(firebaseDb, "studentLearning", identity.uid);
  const merged = await runTransaction(firebaseDb, async (transaction) => {
    const remote = await transaction.get(reference);
    const existing = remote.exists() ? normaliseFirebaseLearningDocument(remote.data()) : null;
    const next = mergeFirebaseLearningDocument(existing, identity, snapshot);
    transaction.set(reference, next);
    return next;
  });
  return toCloudLearningOverview(merged);
}

import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  studentAccessGrants,
  studentDailyRecords,
  studentPinnedPractices,
  studentPracticeProgress,
  studentProfiles,
  studentReviewRecords,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export type LearningSnapshotInput = {
  schemaVersion: number;
  completedPractices: string[];
  dailyHistory: Record<string, string[]>;
  dailyTarget: number | null;
  reviewRecords: Array<{ key: string; grade: string; title: string; href: string; misses: number; updatedAt: number }>;
  pinnedPractices: string[];
};

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: values.lastSignedIn };
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function ensureStudentProfile(userId: number) {
  const db = await requireDb();
  await db.insert(studentProfiles).values({ userId }).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });
  const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId)).limit(1);
  if (!profile) throw new Error("Could not create student profile");
  return profile;
}

async function getLearningOverviewByProfile(profile: Awaited<ReturnType<typeof ensureStudentProfile>>) {
  const db = await requireDb();
  const [progress, dailyRecords, reviewRecords, pinnedPractices] = await Promise.all([
    db.select().from(studentPracticeProgress).where(eq(studentPracticeProgress.studentId, profile.id)).orderBy(desc(studentPracticeProgress.completedAt)),
    db.select().from(studentDailyRecords).where(eq(studentDailyRecords.studentId, profile.id)).orderBy(desc(studentDailyRecords.practicedOn)).limit(180),
    db.select().from(studentReviewRecords).where(eq(studentReviewRecords.studentId, profile.id)).orderBy(desc(studentReviewRecords.misses), desc(studentReviewRecords.updatedAt)),
    db.select().from(studentPinnedPractices).where(eq(studentPinnedPractices.studentId, profile.id)).orderBy(studentPinnedPractices.position),
  ]);
  return { profile, progress, dailyRecords, reviewRecords, pinnedPractices };
}

export async function getStudentLearningOverview(userId: number) {
  return getLearningOverviewByProfile(await ensureStudentProfile(userId));
}

export async function setStudentDailyTarget(userId: number, dailyTarget: number) {
  const db = await requireDb();
  const profile = await ensureStudentProfile(userId);
  await db.update(studentProfiles).set({ dailyTarget, updatedAt: new Date() }).where(eq(studentProfiles.id, profile.id));
  return { ...profile, dailyTarget };
}

export async function updateStudentProfile(userId: number, input: { displayName: string | null; classCode: string | null }) {
  const db = await requireDb();
  const profile = await ensureStudentProfile(userId);
  await db.update(studentProfiles).set({ displayName: input.displayName, classCode: input.classCode, updatedAt: new Date() }).where(eq(studentProfiles.id, profile.id));
  return getStudentLearningOverview(userId);
}

export async function recordStudentPracticeCompletion(userId: number, practiceKey: string, bestScore = 8, perfectRun = false) {
  const db = await requireDb();
  const profile = await ensureStudentProfile(userId);
  await db.insert(studentPracticeProgress).values({ studentId: profile.id, practiceKey, bestScore, perfectRun, completedAt: new Date() }).onDuplicateKeyUpdate({
    set: { bestScore: sql`GREATEST(${studentPracticeProgress.bestScore}, ${bestScore})`, perfectRun: sql`${studentPracticeProgress.perfectRun} OR ${perfectRun}` },
  });
  return profile;
}

export async function recordStudentDailyPractice(userId: number, practicedOn: string, practiceKey: string) {
  const db = await requireDb();
  const profile = await ensureStudentProfile(userId);
  await db.insert(studentDailyRecords).values({ studentId: profile.id, practicedOn: new Date(`${practicedOn}T00:00:00.000Z`), practiceKey, recordedAt: new Date() }).onDuplicateKeyUpdate({ set: { recordedAt: sql`${studentDailyRecords.recordedAt}` } });
  return profile;
}

export async function recordStudentReviewMistake(userId: number, input: LearningSnapshotInput["reviewRecords"][number]) {
  const db = await requireDb();
  const profile = await ensureStudentProfile(userId);
  await db.insert(studentReviewRecords).values({
    studentId: profile.id,
    practiceKey: input.key,
    grade: input.grade,
    title: input.title,
    href: input.href,
    misses: Math.max(1, input.misses),
    updatedAt: new Date(input.updatedAt),
  }).onDuplicateKeyUpdate({
    set: {
      grade: input.grade,
      title: input.title,
      href: input.href,
      misses: sql`GREATEST(${studentReviewRecords.misses}, ${Math.max(1, input.misses)})`,
      updatedAt: new Date(input.updatedAt),
    },
  });
  return profile;
}

export async function setStudentPinnedPractice(userId: number, practiceKey: string, pinned: boolean, position = 0) {
  const db = await requireDb();
  const profile = await ensureStudentProfile(userId);
  if (!pinned) {
    await db.delete(studentPinnedPractices).where(and(eq(studentPinnedPractices.studentId, profile.id), eq(studentPinnedPractices.practiceKey, practiceKey)));
    return profile;
  }
  await db.insert(studentPinnedPractices).values({ studentId: profile.id, practiceKey, position }).onDuplicateKeyUpdate({ set: { position, updatedAt: new Date() } });
  return profile;
}

async function applyLearningSnapshot(userId: number, snapshot: LearningSnapshotInput, markMigration: boolean) {
  const db = await requireDb();
  const profile = await ensureStudentProfile(userId);
  const migrationVersion = markMigration ? Math.max(profile.migrationVersion, snapshot.schemaVersion) : profile.migrationVersion;
  if (snapshot.dailyTarget !== null) await db.update(studentProfiles).set({ dailyTarget: snapshot.dailyTarget, migrationVersion, updatedAt: new Date() }).where(eq(studentProfiles.id, profile.id));
  else if (markMigration) await db.update(studentProfiles).set({ migrationVersion, updatedAt: new Date() }).where(eq(studentProfiles.id, profile.id));
  for (const practiceKey of snapshot.completedPractices) await recordStudentPracticeCompletion(userId, practiceKey);
  for (const [practicedOn, practiceKeys] of Object.entries(snapshot.dailyHistory)) for (const practiceKey of practiceKeys) await recordStudentDailyPractice(userId, practicedOn, practiceKey);
  for (const reviewRecord of snapshot.reviewRecords) await recordStudentReviewMistake(userId, reviewRecord);
  await db.delete(studentPinnedPractices).where(eq(studentPinnedPractices.studentId, profile.id));
  for (const [position, practiceKey] of Array.from(snapshot.pinnedPractices.entries())) await db.insert(studentPinnedPractices).values({ studentId: profile.id, practiceKey, position });
  await db.update(studentProfiles).set({ syncRevision: sql`${studentProfiles.syncRevision} + 1`, lastSyncedAt: new Date(), updatedAt: new Date() }).where(eq(studentProfiles.id, profile.id));
  return getStudentLearningOverview(userId);
}

export async function migrateLocalLearningSnapshot(userId: number, snapshot: LearningSnapshotInput) {
  const profile = await ensureStudentProfile(userId);
  if (profile.migrationVersion >= snapshot.schemaVersion) return getLearningOverviewByProfile(profile);
  return applyLearningSnapshot(userId, snapshot, true);
}

/** Optimistic cross-device backup: a stale device receives the cloud state and retries through the local merge flow. */
export async function syncLocalLearningSnapshot(userId: number, snapshot: LearningSnapshotInput, expectedSyncRevision: number) {
  const profile = await ensureStudentProfile(userId);
  if (profile.syncRevision !== expectedSyncRevision) return { status: "conflict" as const, overview: await getLearningOverviewByProfile(profile) };
  return { status: "synced" as const, overview: await applyLearningSnapshot(userId, snapshot, false) };
}

function makeInviteCode() {
  return `MQ-${crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
}

export async function createViewerInvite(studentUserId: number, viewerRole: "parent" | "teacher") {
  const db = await requireDb();
  const profile = await ensureStudentProfile(studentUserId);
  let inviteCode = makeInviteCode();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const existing = await db.select({ id: studentAccessGrants.id }).from(studentAccessGrants).where(eq(studentAccessGrants.inviteCode, inviteCode)).limit(1);
    if (!existing[0]) break;
    inviteCode = makeInviteCode();
  }
  await db.insert(studentAccessGrants).values({ studentId: profile.id, viewerRole, inviteCode, status: "pending" });
  const [grant] = await db.select().from(studentAccessGrants).where(eq(studentAccessGrants.inviteCode, inviteCode)).limit(1);
  return grant!;
}

export async function acceptViewerInvite(viewerUserId: number, inviteCode: string) {
  const db = await requireDb();
  const [grant] = await db.select().from(studentAccessGrants).where(and(eq(studentAccessGrants.inviteCode, inviteCode), eq(studentAccessGrants.status, "pending"))).limit(1);
  if (!grant) return null;
  const [student] = await db.select().from(studentProfiles).where(eq(studentProfiles.id, grant.studentId)).limit(1);
  if (!student || student.userId === viewerUserId) return null;
  const existing = await db.select({ id: studentAccessGrants.id }).from(studentAccessGrants).where(and(eq(studentAccessGrants.studentId, grant.studentId), eq(studentAccessGrants.viewerUserId, viewerUserId), eq(studentAccessGrants.viewerRole, grant.viewerRole))).limit(1);
  if (existing[0]) return null;
  await db.update(studentAccessGrants).set({ viewerUserId, status: "active", acceptedAt: new Date() }).where(eq(studentAccessGrants.id, grant.id));
  return { ...grant, viewerUserId, status: "active" as const, acceptedAt: new Date() };
}

export async function getStudentAccessGrants(studentUserId: number) {
  const db = await requireDb();
  const profile = await ensureStudentProfile(studentUserId);
  return db.select({ grant: studentAccessGrants, viewerName: users.name, viewerEmail: users.email }).from(studentAccessGrants).leftJoin(users, eq(studentAccessGrants.viewerUserId, users.id)).where(eq(studentAccessGrants.studentId, profile.id)).orderBy(desc(studentAccessGrants.createdAt));
}

export async function revokeStudentAccessGrant(studentUserId: number, grantId: number) {
  const db = await requireDb();
  const profile = await ensureStudentProfile(studentUserId);
  await db.update(studentAccessGrants).set({ status: "revoked", revokedAt: new Date() }).where(and(eq(studentAccessGrants.id, grantId), eq(studentAccessGrants.studentId, profile.id)));
}

export async function getViewerStudents(viewerUserId: number) {
  const db = await requireDb();
  return db.select({ grantId: studentAccessGrants.id, viewerRole: studentAccessGrants.viewerRole, studentId: studentProfiles.id, studentName: studentProfiles.displayName, classCode: studentProfiles.classCode, studentUserName: users.name, dailyTarget: studentProfiles.dailyTarget, lastSyncedAt: studentProfiles.lastSyncedAt, acceptedAt: studentAccessGrants.acceptedAt }).from(studentAccessGrants).innerJoin(studentProfiles, eq(studentAccessGrants.studentId, studentProfiles.id)).innerJoin(users, eq(studentProfiles.userId, users.id)).where(and(eq(studentAccessGrants.viewerUserId, viewerUserId), eq(studentAccessGrants.status, "active"))).orderBy(desc(studentAccessGrants.acceptedAt));
}

export async function getViewerStudentLearningOverview(viewerUserId: number, studentId: number) {
  const db = await requireDb();
  const [grant] = await db.select({ id: studentAccessGrants.id }).from(studentAccessGrants).where(and(eq(studentAccessGrants.viewerUserId, viewerUserId), eq(studentAccessGrants.studentId, studentId), eq(studentAccessGrants.status, "active"))).limit(1);
  if (!grant) return null;
  const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.id, studentId)).limit(1);
  return profile ? getLearningOverviewByProfile(profile) : null;
}

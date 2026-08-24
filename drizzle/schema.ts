import { boolean, date, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  localUsername: varchar("localUsername", { length: 48 }).unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** A learner profile is created lazily for each account that chooses to save learning data. */
export const studentProfiles = mysqlTable("student_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  displayName: varchar("displayName", { length: 80 }),
  classCode: varchar("classCode", { length: 32 }),
  timezone: varchar("timezone", { length: 64 }).notNull().default("Asia/Hong_Kong"),
  dailyTarget: int("dailyTarget").notNull().default(3),
  migrationVersion: int("migrationVersion").notNull().default(0),
  syncRevision: int("syncRevision").notNull().default(0),
  lastSyncedAt: timestamp("lastSyncedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const studentPracticeProgress = mysqlTable("student_practice_progress", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull().references(() => studentProfiles.id, { onDelete: "cascade" }),
  practiceKey: varchar("practiceKey", { length: 120 }).notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  bestScore: int("bestScore").notNull().default(0),
  perfectRun: boolean("perfectRun").notNull().default(false),
}, (table) => [
  uniqueIndex("student_practice_progress_unique").on(table.studentId, table.practiceKey),
  index("student_practice_progress_student_idx").on(table.studentId),
]);

export const studentDailyRecords = mysqlTable("student_daily_records", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull().references(() => studentProfiles.id, { onDelete: "cascade" }),
  practicedOn: date("practicedOn").notNull(),
  practiceKey: varchar("practiceKey", { length: 120 }).notNull(),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("student_daily_record_unique").on(table.studentId, table.practicedOn, table.practiceKey),
  index("student_daily_records_student_date_idx").on(table.studentId, table.practicedOn),
]);

export const studentReviewRecords = mysqlTable("student_review_records", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull().references(() => studentProfiles.id, { onDelete: "cascade" }),
  practiceKey: varchar("practiceKey", { length: 120 }).notNull(),
  grade: varchar("grade", { length: 8 }).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  href: varchar("href", { length: 255 }).notNull(),
  misses: int("misses").notNull().default(1),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  uniqueIndex("student_review_record_unique").on(table.studentId, table.practiceKey),
  index("student_review_records_student_idx").on(table.studentId),
]);

export const studentPinnedPractices = mysqlTable("student_pinned_practices", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull().references(() => studentProfiles.id, { onDelete: "cascade" }),
  practiceKey: varchar("practiceKey", { length: 120 }).notNull(),
  position: int("position").notNull().default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  uniqueIndex("student_pinned_practice_unique").on(table.studentId, table.practiceKey),
  index("student_pinned_practices_student_position_idx").on(table.studentId, table.position),
]);

/**
 * A student controls every relationship. Parent and teacher accounts receive no data until
 * a student accepts their single-use invitation code, and a revoked grant is never readable.
 */
export const studentAccessGrants = mysqlTable("student_access_grants", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull().references(() => studentProfiles.id, { onDelete: "cascade" }),
  viewerUserId: int("viewerUserId").references(() => users.id, { onDelete: "cascade" }),
  viewerRole: mysqlEnum("viewerRole", ["parent", "teacher"]).notNull(),
  status: mysqlEnum("status", ["pending", "active", "revoked"]).notNull().default("pending"),
  inviteCode: varchar("inviteCode", { length: 16 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  acceptedAt: timestamp("acceptedAt"),
  revokedAt: timestamp("revokedAt"),
}, (table) => [
  uniqueIndex("student_access_grant_relationship_unique").on(table.studentId, table.viewerUserId, table.viewerRole),
  index("student_access_grants_student_idx").on(table.studentId, table.status),
  index("student_access_grants_viewer_idx").on(table.viewerUserId, table.status),
]);

export type StudentProfile = typeof studentProfiles.$inferSelect;
export type StudentPracticeProgress = typeof studentPracticeProgress.$inferSelect;
export type StudentDailyRecord = typeof studentDailyRecords.$inferSelect;
export type StudentReviewRecord = typeof studentReviewRecords.$inferSelect;
export type StudentPinnedPractice = typeof studentPinnedPractices.$inferSelect;
export type StudentAccessGrant = typeof studentAccessGrants.$inferSelect;

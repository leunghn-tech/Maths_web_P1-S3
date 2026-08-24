import { z } from "zod";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  authenticateLocalAccount,
  changeTeacherPassword,
  getStudentLearningOverview,
  getTeacherManagedStudents,
  migrateLocalLearningSnapshot,
  recordStudentDailyPractice,
  recordStudentPracticeCompletion,
  recordStudentReviewMistake,
  registerLocalStudent,
  requestStudentPasswordReset,
  resetStudentPassword,
  rotateStudentRecoveryCode,
  setStudentDailyTarget,
  setStudentPinnedPractice,
  syncLocalLearningSnapshot,
  updateStudentProfile,
} from "./db";

const practiceKey = z.string().min(1).max(120);
const reviewRecord = z.object({ key: practiceKey, grade: z.string().min(1).max(8), title: z.string().min(1).max(160), href: z.string().min(1).max(255), misses: z.number().int().min(1).max(999), updatedAt: z.number().int().positive() });
const localSnapshot = z.object({ schemaVersion: z.literal(1), completedPractices: z.array(practiceKey).max(300), dailyHistory: z.record(z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.array(practiceKey).max(50)), dailyTarget: z.number().int().min(1).max(6).nullable(), reviewRecords: z.array(reviewRecord).max(300), pinnedPractices: z.array(practiceKey).max(100) });
const localUsername = z.string().trim().toLowerCase().regex(/^[a-z0-9._-]{3,48}$/, "用戶名稱須為 3–48 個英文小寫字母、數字或 . _ -。");
const localPassword = z.string().min(6, "密碼至少需要 6 個字元。").max(128);

async function issueLocalSession(ctx: { req: Parameters<typeof getSessionCookieOptions>[0]; res: { cookie: (name: string, value: string, options: Record<string, unknown>) => void } }, user: { openId: string; name: string | null; localUsername: string | null; role: "user" | "admin"; sessionVersion: number }) {
  const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name || user.localUsername || "Maths Quest User", expiresInMs: ONE_YEAR_MS, sessionVersion: user.sessionVersion });
  ctx.res.cookie(COOKIE_NAME, sessionToken, { ...getSessionCookieOptions(ctx.req), maxAge: ONE_YEAR_MS });
  return { id: user.openId, name: user.name || user.localUsername || "Maths Quest User", username: user.localUsername, role: user.role };
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    registerStudent: publicProcedure.input(z.object({ username: localUsername, password: localPassword, displayName: z.string().trim().min(1, "請輸入暱稱。").max(80) })).mutation(async ({ ctx, input }) => {
      const { user, recoveryCode } = await registerLocalStudent(input);
      return { ...await issueLocalSession(ctx, user), recoveryCode };
    }),
    loginStudent: publicProcedure.input(z.object({ username: localUsername, password: z.string().min(1).max(128) })).mutation(async ({ ctx, input }) => {
      const user = await authenticateLocalAccount({ ...input, expectedRole: "user" });
      if (!user) throw new Error("學生用戶名稱或密碼不正確。");
      return issueLocalSession(ctx, user);
    }),
    loginTeacher: publicProcedure.input(z.object({ username: localUsername, password: z.string().min(1).max(128) })).mutation(async ({ ctx, input }) => {
      const user = await authenticateLocalAccount({ ...input, expectedRole: "admin" });
      if (!user) throw new Error("教師帳戶或密碼不正確。");
      return issueLocalSession(ctx, user);
    }),
    requestStudentPasswordReset: publicProcedure.input(z.object({ username: localUsername, recoveryCode: z.string().trim().min(8).max(64) })).mutation(({ input }) => requestStudentPasswordReset(input)),
    resetStudentPassword: publicProcedure.input(z.object({ resetToken: z.string().min(32).max(128), newPassword: localPassword })).mutation(({ input }) => resetStudentPassword(input)),
    rotateStudentRecoveryCode: protectedProcedure.mutation(({ ctx }) => rotateStudentRecoveryCode(ctx.user.id)),
    changeTeacherPassword: adminProcedure.input(z.object({ currentPassword: z.string().min(1).max(128), newPassword: localPassword })).mutation(async ({ ctx, input }) => {
      const user = await changeTeacherPassword(ctx.user.id, input.currentPassword, input.newPassword);
      return issueLocalSession(ctx, user);
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  learning: router({
    overview: protectedProcedure.query(({ ctx }) => getStudentLearningOverview(ctx.user.id)),
    migrateLocal: protectedProcedure.input(localSnapshot).mutation(({ ctx, input }) => migrateLocalLearningSnapshot(ctx.user.id, input)),
    syncLocal: protectedProcedure.input(z.object({ snapshot: localSnapshot, expectedSyncRevision: z.number().int().min(0) })).mutation(({ ctx, input }) => syncLocalLearningSnapshot(ctx.user.id, input.snapshot, input.expectedSyncRevision)),
    updateProfile: protectedProcedure.input(z.object({ displayName: z.string().trim().max(80).transform((value) => value || null) })).mutation(({ ctx, input }) => updateStudentProfile(ctx.user.id, input)),
    completePractice: protectedProcedure.input(z.object({ practiceKey, bestScore: z.number().int().min(0).max(8).default(8), perfectRun: z.boolean().default(false) })).mutation(async ({ ctx, input }) => {
      await recordStudentPracticeCompletion(ctx.user.id, input.practiceKey, input.bestScore, input.perfectRun);
      return getStudentLearningOverview(ctx.user.id);
    }),
    recordDailyPractice: protectedProcedure.input(z.object({ practiceKey, practicedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })).mutation(async ({ ctx, input }) => {
      await recordStudentDailyPractice(ctx.user.id, input.practicedOn, input.practiceKey);
      return getStudentLearningOverview(ctx.user.id);
    }),
    setDailyTarget: protectedProcedure.input(z.object({ dailyTarget: z.number().int().min(1).max(6) })).mutation(({ ctx, input }) => setStudentDailyTarget(ctx.user.id, input.dailyTarget)),
    recordMistake: protectedProcedure.input(reviewRecord).mutation(async ({ ctx, input }) => {
      await recordStudentReviewMistake(ctx.user.id, input);
      return getStudentLearningOverview(ctx.user.id);
    }),
    setPinned: protectedProcedure.input(z.object({ practiceKey, pinned: z.boolean(), position: z.number().int().min(0).max(100).default(0) })).mutation(async ({ ctx, input }) => {
      await setStudentPinnedPractice(ctx.user.id, input.practiceKey, input.pinned, input.position);
      return getStudentLearningOverview(ctx.user.id);
    }),
  }),
  teacher: router({
    managedStudents: adminProcedure.query(() => getTeacherManagedStudents()),
  }),
});

export type AppRouter = typeof appRouter;

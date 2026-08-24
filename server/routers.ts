import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  acceptViewerInvite,
  createViewerInvite,
  getStudentAccessGrants,
  getStudentLearningOverview,
  getViewerStudentLearningOverview,
  getViewerStudents,
  migrateLocalLearningSnapshot,
  recordStudentDailyPractice,
  recordStudentPracticeCompletion,
  recordStudentReviewMistake,
  revokeStudentAccessGrant,
  setStudentDailyTarget,
  setStudentPinnedPractice,
  syncLocalLearningSnapshot,
} from "./db";

const practiceKey = z.string().min(1).max(120);
const reviewRecord = z.object({ key: practiceKey, grade: z.string().min(1).max(8), title: z.string().min(1).max(160), href: z.string().min(1).max(255), misses: z.number().int().min(1).max(999), updatedAt: z.number().int().positive() });
const localSnapshot = z.object({ schemaVersion: z.literal(1), completedPractices: z.array(practiceKey).max(300), dailyHistory: z.record(z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.array(practiceKey).max(50)), dailyTarget: z.number().int().min(1).max(6).nullable(), reviewRecords: z.array(reviewRecord).max(300), pinnedPractices: z.array(practiceKey).max(100) });

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  learning: router({
    overview: protectedProcedure.query(({ ctx }) => getStudentLearningOverview(ctx.user.id)),
    migrateLocal: protectedProcedure.input(localSnapshot).mutation(({ ctx, input }) => migrateLocalLearningSnapshot(ctx.user.id, input)),
    syncLocal: protectedProcedure.input(localSnapshot).mutation(({ ctx, input }) => syncLocalLearningSnapshot(ctx.user.id, input)),
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
  familyAccess: router({
    listMyGrants: protectedProcedure.query(({ ctx }) => getStudentAccessGrants(ctx.user.id)),
    createInvite: protectedProcedure.input(z.object({ viewerRole: z.enum(["parent", "teacher"]) })).mutation(({ ctx, input }) => createViewerInvite(ctx.user.id, input.viewerRole)),
    revokeInvite: protectedProcedure.input(z.object({ grantId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      await revokeStudentAccessGrant(ctx.user.id, input.grantId);
      return { success: true } as const;
    }),
    acceptInvite: protectedProcedure.input(z.object({ inviteCode: z.string().trim().toUpperCase().regex(/^MQ-[A-Z0-9]{10}$/) })).mutation(async ({ ctx, input }) => {
      const grant = await acceptViewerInvite(ctx.user.id, input.inviteCode);
      if (!grant) throw new Error("邀請碼無效、已被使用，或不能關聯到自己的帳戶。");
      return grant;
    }),
    viewerStudents: protectedProcedure.query(({ ctx }) => getViewerStudents(ctx.user.id)),
    viewerStudentOverview: protectedProcedure.input(z.object({ studentId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const overview = await getViewerStudentLearningOverview(ctx.user.id, input.studentId);
      if (!overview) throw new Error("你未獲授權檢視這位學生的學習資料。");
      return overview;
    }),
  }),
});

export type AppRouter = typeof appRouter;

import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createGuestContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createStudentContext(): TrpcContext {
  return {
    user: { id: 99, openId: "local:student:test", localUsername: "student.test", passwordHash: null, email: null, name: "測試學生", loginMethod: "local-password", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("learning and teacher-only authorisation", () => {
  it("does not expose a learner overview to a guest", async () => {
    const caller = appRouter.createCaller(createGuestContext());
    await expect(caller.learning.overview()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("does not let a guest alter student identity or submit a device sync", async () => {
    const caller = appRouter.createCaller(createGuestContext());
    await expect(caller.learning.updateProfile({ displayName: "學生甲" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.learning.syncLocal({ snapshot: { schemaVersion: 1, completedPractices: [], dailyHistory: {}, dailyTarget: 3, reviewRecords: [], pinnedPractices: [] }, expectedSyncRevision: 0 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects student passwords shorter than four characters or containing non-alphanumeric characters", async () => {
    const caller = appRouter.createCaller(createGuestContext());
    await expect(caller.auth.registerStudent({ username: "learner.one", password: "abc", displayName: "學生甲" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.auth.registerStudent({ username: "learner.one", password: "ab!c", displayName: "學生甲" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("does not let guests or student accounts access the teacher directory", async () => {
    await expect(appRouter.createCaller(createGuestContext()).teacher.managedStudents()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(appRouter.createCaller(createStudentContext()).teacher.managedStudents()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(appRouter.createCaller(createGuestContext()).teacher.studentDetail({ userId: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(appRouter.createCaller(createStudentContext()).teacher.studentDetail({ userId: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("requires an authenticated student to rotate a recovery code while keeping teacher routes unavailable", async () => {
    await expect(appRouter.createCaller(createGuestContext()).auth.rotateStudentRecoveryCode()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(appRouter.createCaller(createStudentContext()).teacher.managedStudents()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

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

describe("learning and family access authorisation", () => {
  it("does not expose a learner overview to a guest", async () => {
    const caller = appRouter.createCaller(createGuestContext());
    await expect(caller.learning.overview()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("does not let a guest create or accept a student relationship", async () => {
    const caller = appRouter.createCaller(createGuestContext());
    await expect(caller.familyAccess.createInvite({ viewerRole: "parent" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.familyAccess.acceptInvite({ inviteCode: "MQ-ABCDEFGHIJ" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("does not let a guest alter student identity or submit a device sync", async () => {
    const caller = appRouter.createCaller(createGuestContext());
    await expect(caller.learning.updateProfile({ displayName: "學生甲", classCode: "3A" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.learning.syncLocal({ snapshot: { schemaVersion: 1, completedPractices: [], dailyHistory: {}, dailyTarget: 3, reviewRecords: [], pinnedPractices: [] }, expectedSyncRevision: 0 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("does not let guests or student accounts access the teacher directory", async () => {
    await expect(appRouter.createCaller(createGuestContext()).teacher.managedStudents()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(appRouter.createCaller(createStudentContext()).teacher.managedStudents()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

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
});

import { describe, expect, it } from "vitest";
import { sdk } from "./_core/sdk";

describe("local session transport", () => {
  it("signs a local account session that can be verified from a Bearer transport", async () => {
    const token = await sdk.createSessionToken("local-student-session-test", {
      name: "Local student",
      sessionVersion: 3,
    });

    await expect(sdk.verifySession(token)).resolves.toMatchObject({
      openId: "local-student-session-test",
      sessionVersion: 3,
    });
  });
});

import { describe, expect, it } from "vitest";
import { getInitialTeacherPassword, hashLocalPassword, verifyLocalPassword } from "./localAuth";

describe("initial teacher password secret", () => {
  it("loads the configured teacher secret and validates it through the password hash boundary", async () => {
    const password = getInitialTeacherPassword();
    const hash = await hashLocalPassword(password);
    await expect(verifyLocalPassword(password, hash)).resolves.toBe(true);
    await expect(verifyLocalPassword(`${password}-incorrect`, hash)).resolves.toBe(false);
  });
});

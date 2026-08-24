import { describe, expect, it } from "vitest";
import { getSessionCookieOptions } from "./_core/cookies";

describe("session cookie options", () => {
  it("uses Lax cookies for an unencrypted local request so browsers retain the session", () => {
    const options = getSessionCookieOptions({ protocol: "http", headers: {} } as any);
    expect(options).toMatchObject({ secure: false, sameSite: "lax", httpOnly: true, path: "/" });
  });

  it("uses Secure SameSite=None cookies when HTTPS is available through a proxy", () => {
    const options = getSessionCookieOptions({ protocol: "http", headers: { "x-forwarded-proto": "https" } } as any);
    expect(options).toMatchObject({ secure: true, sameSite: "none" });
  });
});

import { describe, expect, it } from "vitest";
import { createPasswordResetToken, createStudentRecoveryCode, getInitialTeacherPassword, hashLocalPassword, hashOpaqueSecret, isPasswordResetTokenUsable, normalizeRecoveryCode, verifyLocalPassword } from "./localAuth";

describe("initial teacher password secret", () => {
  it("loads the configured teacher secret and validates it through the password hash boundary", async () => {
    const password = getInitialTeacherPassword();
    const hash = await hashLocalPassword(password);
    await expect(verifyLocalPassword(password, hash)).resolves.toBe(true);
    await expect(verifyLocalPassword(`${password}-incorrect`, hash)).resolves.toBe(false);
  });
});

describe("student account recovery secrets", () => {
  it("creates a readable recovery code that is normalized and verified only through its scrypt hash", async () => {
    const recoveryCode = createStudentRecoveryCode();
    expect(recoveryCode).toMatch(/^[A-F0-9]{4}(?:-[A-F0-9]{4}){3}$/);
    const storedHash = await hashLocalPassword(normalizeRecoveryCode(recoveryCode));
    await expect(verifyLocalPassword(normalizeRecoveryCode(recoveryCode.toLowerCase()), storedHash)).resolves.toBe(true);
    await expect(verifyLocalPassword(normalizeRecoveryCode("0000-0000-0000-0000"), storedHash)).resolves.toBe(false);
  });

  it("creates opaque reset tokens whose stored representation cannot reveal the token", () => {
    const token = createPasswordResetToken();
    const hash = hashOpaqueSecret(token);
    expect(token).toHaveLength(43);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).not.toContain(token);
    expect(hashOpaqueSecret(token)).toBe(hash);
    expect(hashOpaqueSecret(createPasswordResetToken())).not.toBe(hash);
  });

  it("rejects expired and already-used password reset tokens", () => {
    const now = new Date("2026-08-24T00:00:00.000Z");
    expect(isPasswordResetTokenUsable({ expiresAt: new Date(now.getTime() + 1), usedAt: null }, now)).toBe(true);
    expect(isPasswordResetTokenUsable({ expiresAt: now, usedAt: null }, now)).toBe(false);
    expect(isPasswordResetTokenUsable({ expiresAt: new Date(now.getTime() + 1), usedAt: now }, now)).toBe(false);
  });
});

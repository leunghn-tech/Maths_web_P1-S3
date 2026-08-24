import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export function normalizeLocalUsername(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeRecoveryCode(value: string) {
  return value.replace(/[\s-]/g, "").toUpperCase();
}

export function createStudentRecoveryCode() {
  const compact = randomBytes(8).toString("hex").toUpperCase();
  return compact.match(/.{1,4}/g)?.join("-") ?? compact;
}

export function createPasswordResetToken() {
  return randomBytes(32).toString("base64url");
}

export function hashOpaqueSecret(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function isPasswordResetTokenUsable(token: { expiresAt: Date; usedAt: Date | null }, now = new Date()) {
  return token.usedAt === null && token.expiresAt.getTime() > now.getTime();
}

export async function hashLocalPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, KEY_LENGTH) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyLocalPassword(password: string, storedHash: string) {
  const [algorithm, salt, encodedHash] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !encodedHash) return false;
  const expected = Buffer.from(encodedHash, "hex");
  const derived = await scrypt(password, salt, expected.length) as Buffer;
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

export function getInitialTeacherPassword() {
  const password = process.env.TEACHER_INITIAL_PASSWORD;
  if (!password) throw new Error("TEACHER_INITIAL_PASSWORD is required to bootstrap the teacher account");
  return password;
}

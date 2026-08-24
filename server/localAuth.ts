import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export function normalizeLocalUsername(value: string) {
  return value.trim().toLowerCase();
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

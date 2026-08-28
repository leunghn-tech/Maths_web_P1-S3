import { describe, expect, it } from "vitest";
import { FIREBASE_TEACHER_EMAIL, isFirebaseTeacherEmail } from "./firebaseTeacherAccess";

describe("唯一 Firebase 教師身份", () => {
  it("只接受指定電郵，並以大小寫不敏感方式比對", () => {
    expect(isFirebaseTeacherEmail(FIREBASE_TEACHER_EMAIL)).toBe(true);
    expect(isFirebaseTeacherEmail("JustSayHi0915@Gmail.com")).toBe(true);
    expect(isFirebaseTeacherEmail("student@example.com")).toBe(false);
    expect(isFirebaseTeacherEmail(null)).toBe(false);
  });
});

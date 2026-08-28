import { describe, expect, it } from "vitest";
import { shouldSyncFirebaseLearning } from "./CloudLearningSync";

describe("Firebase 學習同步身份保護", () => {
  it("只同步已登入的 Firebase 學生，不同步 Firebase 教師", () => {
    expect(shouldSyncFirebaseLearning(true, true, { role: "user" })).toBe(true);
    expect(shouldSyncFirebaseLearning(true, true, { role: "admin" })).toBe(false);
    expect(shouldSyncFirebaseLearning(true, false, { role: "user" })).toBe(false);
    expect(shouldSyncFirebaseLearning(false, true, { role: "user" })).toBe(false);
  });
});

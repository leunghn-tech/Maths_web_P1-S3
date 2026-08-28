import { describe, expect, it } from "vitest";
import { toFirebaseTeacherStudent } from "./firebaseTeacherLearning";

describe("Firebase 教師唯讀摘要", () => {
  it("只由學生快照導出完成、錯題、年級及同步摘要", () => {
    const summary = toFirebaseTeacherStudent({ schemaVersion: 1, ownerUid: "uid-a", email: "student@example.com", displayName: "數學小朋友", exportedAt: 1, completedPractices: ["/practice/p1-numbers", "/practice/p6-profit"], dailyHistory: {}, dailyTarget: 4, reviewRecords: [{ key: "x", grade: "P1", title: "題目", href: "/practice/p1-numbers", misses: 3, updatedAt: 1 }], pinnedPractices: [], syncRevision: 1, lastSyncedAt: 99 });
    expect(summary).toMatchObject({ uid: "uid-a", completedPractices: 2, reviewCount: 1, totalMisses: 3, dailyTarget: 4, gradeCompletion: { P1: 1, P6: 1 } });
  });
});

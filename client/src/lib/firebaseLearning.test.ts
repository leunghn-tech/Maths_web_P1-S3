import { describe, expect, it } from "vitest";
import { mergeFirebaseLearningDocument, toCloudLearningOverview } from "./firebaseLearning";

describe("Firebase 學習快照合併", () => {
  it("保留兩部裝置的完成紀錄、較高錯題次數及釘選", () => {
    const base = { schemaVersion: 1 as const, ownerUid: "student-1", email: "a@example.com", displayName: "小明", exportedAt: 1, completedPractices: ["/practice/p1-numbers"], dailyHistory: { "2026-08-28": ["/practice/p1-numbers"] }, dailyTarget: 3, reviewRecords: [{ key: "/practice/p1-numbers", grade: "P1", title: "數數", href: "/practice/p1-numbers", misses: 4, updatedAt: 40 }], pinnedPractices: ["/practice/p1-numbers"], syncRevision: 2, lastSyncedAt: 5 };
    const merged = mergeFirebaseLearningDocument(base, { uid: "student-1", email: "a@example.com", displayName: "小明" }, { schemaVersion: 1, exportedAt: 6, completedPractices: ["/practice/p2-numbers"], dailyHistory: { "2026-08-28": ["/practice/p2-numbers"] }, dailyTarget: null, reviewRecords: [{ key: "/practice/p1-numbers", grade: "P1", title: "數數", href: "/practice/p1-numbers", misses: 2, updatedAt: 50 }], pinnedPractices: ["/practice/p2-numbers"] }, 100);
    expect(merged.completedPractices).toEqual(["/practice/p1-numbers", "/practice/p2-numbers"]);
    expect(merged.dailyHistory["2026-08-28"]).toEqual(["/practice/p1-numbers", "/practice/p2-numbers"]);
    expect(merged.reviewRecords[0]).toMatchObject({ misses: 4, updatedAt: 50 });
    expect(merged.pinnedPractices).toEqual(["/practice/p1-numbers", "/practice/p2-numbers"]);
    expect(toCloudLearningOverview(merged).profile.dailyTarget).toBe(3);
  });
});

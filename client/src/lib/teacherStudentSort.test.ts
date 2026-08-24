import { describe, expect, it } from "vitest";
import { sortTeacherStudents } from "./teacherStudentSort";

const students = [
  { userId: 1, completedPractices: 5, lastSyncedAt: "2026-08-01T00:00:00.000Z" },
  { userId: 2, completedPractices: 9, lastSyncedAt: null },
  { userId: 3, completedPractices: 2, lastSyncedAt: "2026-08-03T00:00:00.000Z" },
];

describe("sortTeacherStudents", () => {
  it("sorts by highest completion", () => expect(sortTeacherStudents(students, "completion").map((student) => student.userId)).toEqual([2, 1, 3]));
  it("sorts by most recent sync and puts unsynced entries last", () => expect(sortTeacherStudents(students, "recentSync").map((student) => student.userId)).toEqual([3, 1, 2]));
});

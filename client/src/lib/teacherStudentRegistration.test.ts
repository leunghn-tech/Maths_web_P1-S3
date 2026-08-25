import { describe, expect, it } from "vitest";
import { filterStudentsByRegistration, sortStudentsByRegistration } from "./teacherStudentRegistration";

const now = new Date("2026-08-25T12:00:00.000Z");
const students = [
  { id: "old", createdAt: "2026-06-01T12:00:00.000Z" },
  { id: "week", createdAt: "2026-08-22T12:00:00.000Z" },
  { id: "today", createdAt: "2026-08-25T08:00:00.000Z" },
];

describe("teacher student registration controls", () => {
  it("filters students by the requested real registration period", () => {
    expect(filterStudentsByRegistration(students, "last7", now).map((student) => student.id)).toEqual(["week", "today"]);
    expect(filterStudentsByRegistration(students, "last30", now).map((student) => student.id)).toEqual(["week", "today"]);
    expect(filterStudentsByRegistration(students, "all", now).map((student) => student.id)).toEqual(["old", "week", "today"]);
  });

  it("orders students by registration date without mutating the input", () => {
    expect(sortStudentsByRegistration(students, "registeredNewest").map((student) => student.id)).toEqual(["today", "week", "old"]);
    expect(sortStudentsByRegistration(students, "registeredOldest").map((student) => student.id)).toEqual(["old", "week", "today"]);
    expect(students.map((student) => student.id)).toEqual(["old", "week", "today"]);
  });
});

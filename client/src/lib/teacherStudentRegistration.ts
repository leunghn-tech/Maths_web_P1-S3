export type RegistrationPeriod = "all" | "last7" | "last30" | "thisYear";
export type RegistrationSort = "registeredNewest" | "registeredOldest";

type RegisteredStudent = { createdAt: Date | string | null };

function toTimestamp(value: Date | string | null) {
  if (!value) return Number.NEGATIVE_INFINITY;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

export function filterStudentsByRegistration<T extends RegisteredStudent>(students: T[], period: RegistrationPeriod, now = new Date()) {
  if (period === "all") return students;
  const today = now.getTime();
  const start = new Date(now.getFullYear(), 0, 1).getTime();
  const threshold = period === "last7" ? today - 7 * 24 * 60 * 60 * 1000 : period === "last30" ? today - 30 * 24 * 60 * 60 * 1000 : start;
  return students.filter((student) => toTimestamp(student.createdAt) >= threshold);
}

export function sortStudentsByRegistration<T extends RegisteredStudent>(students: T[], sort: RegistrationSort) {
  return [...students].sort((left, right) => {
    const difference = toTimestamp(left.createdAt) - toTimestamp(right.createdAt);
    return sort === "registeredNewest" ? -difference : difference;
  });
}

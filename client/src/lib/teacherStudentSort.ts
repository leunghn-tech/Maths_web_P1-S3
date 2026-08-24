export type StudentSort = "recentSync" | "completion";
export type DirectoryStudent = { userId: number; completedPractices: number; lastSyncedAt: Date | string | null };

export function sortTeacherStudents<T extends DirectoryStudent>(students: T[], sort: StudentSort): T[] {
  return [...students].sort((left, right) => {
    if (sort === "completion") return right.completedPractices - left.completedPractices || right.userId - left.userId;
    const leftTime = left.lastSyncedAt ? new Date(left.lastSyncedAt).getTime() : -1;
    const rightTime = right.lastSyncedAt ? new Date(right.lastSyncedAt).getTime() : -1;
    return rightTime - leftTime || right.userId - left.userId;
  });
}

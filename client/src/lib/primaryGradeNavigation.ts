export const primaryGrades = ["P1", "P2", "P3", "P4", "P5", "P6"] as const;

export function getPrimaryGradeFromPracticePath(pathname: string): typeof primaryGrades[number] | null {
  const grade = pathname.match(/^\/practice\/(p[1-6])(?:-|\/|$)/i)?.[1]?.toUpperCase();
  return primaryGrades.includes(grade as typeof primaryGrades[number]) ? grade as typeof primaryGrades[number] : null;
}

export function isPrimaryGrade(value: string | null): value is typeof primaryGrades[number] {
  return primaryGrades.includes(value as typeof primaryGrades[number]);
}

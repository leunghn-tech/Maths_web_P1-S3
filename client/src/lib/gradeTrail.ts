export type GradeTrailItem = { grade: string };

const gradeOrder = ["P1", "P2", "P3", "P4", "P5", "P6"];

export function orderGradeTrail<T extends GradeTrailItem>(items: T[]) {
  return [...items].sort((left, right) => gradeOrder.indexOf(left.grade) - gradeOrder.indexOf(right.grade));
}

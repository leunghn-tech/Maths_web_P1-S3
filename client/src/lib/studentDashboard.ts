export type StudentReviewItem = {
  grade: string;
  title: string;
  href: string;
  misses: number;
  updatedAt: Date | string;
};

const firstPracticeByGrade: Record<string, string> = {
  P1: "/practice/p1-add-subtract",
  P2: "/practice/p2-numbers",
  P3: "/practice/p3-mixed-operations",
  P4: "/practice/p4-fractions-decimals",
  P5: "/practice/p5-fractions",
  P6: "/practice/p6-discount",
};

export function getStudentStartHref(savedGrade: string | null) {
  return firstPracticeByGrade[savedGrade ?? ""] ?? firstPracticeByGrade.P1;
}

export function getPriorityReviewItems(items: StudentReviewItem[], limit = 3) {
  return items
    .filter((item) => /^P[1-6]$/.test(item.grade) && /^\/practice\/p[1-6](?:-|\/|$)/i.test(item.href))
    .sort((left, right) => right.misses - left.misses || new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, limit);
}

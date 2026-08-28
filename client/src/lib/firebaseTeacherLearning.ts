import { collection, getDocs } from "firebase/firestore";
import { firebaseDb } from "./firebaseClient";
import { normaliseFirebaseLearningDocument, type FirebaseLearningDocument } from "./firebaseLearning";

export type FirebaseTeacherStudent = { uid: string; displayName: string; email: string | null; completedPractices: number; reviewCount: number; totalMisses: number; dailyTarget: number; lastSyncedAt: number | null; gradeCompletion: Record<string, number>; document: FirebaseLearningDocument };

function gradeFromPractice(practiceKey: string) {
  const matched = practiceKey.match(/\/p([1-6])(?:-|\/|$)/i);
  return matched ? `P${matched[1]}` : null;
}

export function toFirebaseTeacherStudent(document: FirebaseLearningDocument): FirebaseTeacherStudent {
  const gradeCompletion = Object.fromEntries(["P1", "P2", "P3", "P4", "P5", "P6"].map((grade) => [grade, 0])) as Record<string, number>;
  for (const practiceKey of document.completedPractices) { const grade = gradeFromPractice(practiceKey); if (grade) gradeCompletion[grade] += 1; }
  return { uid: document.ownerUid, displayName: document.displayName?.trim() || "學生帳戶", email: document.email, completedPractices: document.completedPractices.length, reviewCount: document.reviewRecords.length, totalMisses: document.reviewRecords.reduce((total, item) => total + item.misses, 0), dailyTarget: document.dailyTarget ?? 3, lastSyncedAt: document.lastSyncedAt || null, gradeCompletion, document };
}

export async function loadFirebaseTeacherStudents() {
  const snapshots = await getDocs(collection(firebaseDb, "studentLearning"));
  return snapshots.docs.map((item) => normaliseFirebaseLearningDocument(item.data())).filter((item): item is FirebaseLearningDocument => item !== null).map(toFirebaseTeacherStudent).sort((first, second) => (second.lastSyncedAt ?? 0) - (first.lastSyncedAt ?? 0));
}

/** This is the only Firebase identity allowed to view student learning summaries. */
export const FIREBASE_TEACHER_EMAIL = "justsayhi0915@gmail.com";

export function isFirebaseTeacherEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() === FIREBASE_TEACHER_EMAIL;
}

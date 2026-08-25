export const LOCAL_SESSION_STORAGE_KEY = "maths-quest-local-session";

export function saveLocalSession(token: string | undefined) {
  if (!token) return;
  try {
    sessionStorage.setItem(LOCAL_SESSION_STORAGE_KEY, token);
  } catch {
    // The normal HttpOnly cookie remains the primary transport when storage is unavailable.
  }
}

export function readLocalSession() {
  try {
    return sessionStorage.getItem(LOCAL_SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearLocalSession() {
  try {
    sessionStorage.removeItem(LOCAL_SESSION_STORAGE_KEY);
  } catch {
    // No storage access to clear.
  }
}

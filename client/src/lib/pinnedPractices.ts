const KEY = "maths-quest:pinned-practices";
export const PINNED_PRACTICES_EVENT = "maths-quest:pinned-practices";
export function getPinnedPractices(): string[] { if (typeof window === "undefined") return []; try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } }
export function togglePinnedPractice(key: string) { const current = getPinnedPractices(); const next = current.includes(key) ? current.filter((item) => item !== key) : [key, ...current]; localStorage.setItem(KEY, JSON.stringify(next)); window.dispatchEvent(new CustomEvent(PINNED_PRACTICES_EVENT)); return next; }

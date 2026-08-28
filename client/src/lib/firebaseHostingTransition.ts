/** Firebase Hosting has no legacy MySQL API; retain the old portal only for voluntary account migration. */
export const LEGACY_PORTAL_URL = "https://mathsquest-tkus7mjn.manus.space/sign-in";

export function isFirebaseHostingHostname(hostname = typeof window === "undefined" ? "" : window.location.hostname) {
  return hostname === "mathsquest-primary.web.app" || hostname === "mathsquest-primary.firebaseapp.com";
}

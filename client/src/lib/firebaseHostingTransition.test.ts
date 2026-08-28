import { describe, expect, it } from "vitest";
import { isFirebaseHostingHostname } from "./firebaseHostingTransition";

describe("Firebase Hosting 偵測", () => {
  it("只辨識 MathsQuest-Primary 的兩個正式 Firebase 網域", () => {
    expect(isFirebaseHostingHostname("mathsquest-primary.web.app")).toBe(true);
    expect(isFirebaseHostingHostname("mathsquest-primary.firebaseapp.com")).toBe(true);
    expect(isFirebaseHostingHostname("mathsquest-tkus7mjn.manus.space")).toBe(false);
  });
});

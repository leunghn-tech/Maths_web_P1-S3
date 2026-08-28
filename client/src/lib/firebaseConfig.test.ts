import { describe, expect, it } from "vitest";
import { firebaseWebConfig } from "./firebaseConfig";

describe("Firebase Web 公開設定", () => {
  it("指向獨立的 MathsQuest-Primary 專案", () => {
    expect(firebaseWebConfig.projectId).toBe("mathsquest-primary");
    expect(firebaseWebConfig.authDomain).toBe("mathsquest-primary.firebaseapp.com");
    expect(firebaseWebConfig.appId).toMatch(/^1:609534588931:web:/);
  });
});

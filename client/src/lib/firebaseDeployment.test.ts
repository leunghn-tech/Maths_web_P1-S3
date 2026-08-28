import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Firebase 靜態部署設定", () => {
  it("發布 Vite 前端並以 SPA rewrite 保留所有 P1–P6 路由", () => {
    const config = JSON.parse(readFileSync(resolve(process.cwd(), "firebase.json"), "utf8"));
    expect(config.hosting.public).toBe("dist/public");
    expect(config.hosting.rewrites).toContainEqual({ source: "**", destination: "/index.html" });
    expect(config.firestore.rules).toBe("firestore.rules");
  });
});

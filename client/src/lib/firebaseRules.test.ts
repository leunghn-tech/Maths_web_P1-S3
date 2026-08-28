import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Firestore 學生資料規則", () => {
  it("學生只可讀寫本人文件，唯一教師只有讀取權限且一律不可刪除", () => {
    const rules = readFileSync(resolve(process.cwd(), "firestore.rules"), "utf8");
    expect(rules).toContain("request.auth.uid == uid");
    expect(rules).toContain("request.auth.token.email == 'justsayhi0915@gmail.com'");
    expect(rules).toContain("allow list: if isTeacher()");
    expect(rules).toContain("allow delete: if false");
    expect(rules).not.toContain("allow update: if isTeacher()");
  });
});

/**
 * Maths Quest quality gate — validates the public P1–S3 learning map without a browser runtime.
 * It guards the notebook's core promise: every Recommended Route card has a route, and S1–S3
 * retain eight CMI/EMI questions plus completion, daily-practice and error-review hooks.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (relativePath) => readFileSync(resolve(root, relativePath), "utf8");
const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const home = read("client/src/pages/Home.tsx");
const app = read("client/src/App.tsx");
const homeRoutes = [...home.matchAll(/href: "([^"?]+)(?:\?[^\"]*)?"/g)].map((match) => match[1]);
const appRoutes = new Set([...app.matchAll(/path="([^\"]+)"/g)].map((match) => match[1]));
for (const route of [...new Set(homeRoutes)]) assert(appRoutes.has(route), `首頁路徑未註冊：${route}`);

const auditSecondaryBank = (file, grade, expectedTopics, questionProperty) => {
  const source = read(file);
  const topicPattern = questionProperty === "questions: make"
    ? /\s{2}([a-z]+):\s*\{[^\n]*?questions:\s*make\(\[\[(.*?)\]\]\)/g
    : /(?:^|[,\n])\s*([a-z]+):\s*\{[^\n]*?r:\s*q\(\[\[(.*?)\]\]\)/g;
  const topicMatches = [...source.matchAll(topicPattern)];
  assert(topicMatches.length === expectedTopics, `${grade} 題庫數量應為 ${expectedTopics}，目前為 ${topicMatches.length}`);
  for (const match of topicMatches) {
    const [, id, rows] = match;
    const baseRows = (rows.match(/\],\s*\[/g) ?? []).length + 1;
    const renderedQuestions = questionProperty === "questions: make" ? baseRows : baseRows * 2;
    assert(renderedQuestions === 8, `${grade}「${id}」應提供 8 題，目前為 ${renderedQuestions}`);
  }
  for (const required of ["CMI 中文", "EMI English", "markPracticeCompleted", "recordDailyPractice", "recordPracticeMistake"]) {
    assert(source.includes(required), `${grade} 缺少必要流程：${required}`);
  }
};

auditSecondaryBank("client/src/pages/S1BilingualPractice.tsx", "S1", 15, "questions: make");
auditSecondaryBank("client/src/pages/S2BilingualPractice.tsx", "S2", 13, "r:q");
auditSecondaryBank("client/src/pages/S3BilingualPractice.tsx", "S3", 9, "r:q");

const p1Routes = [
  "/practice/p1-add-subtract", "/practice/p1-numbers", "/practice/p1-time", "/practice/p1-number-line",
  "/practice/p1-measure", "/practice/p1-length-compare", "/practice/p1-shapes", "/practice/p1-solids",
  "/practice/p1-shape-rotation", "/practice/p1-length-sort", "/practice/p1-counting", "/practice/p1-calendar",
  "/practice/p1-lines", "/practice/p1-pictograph",
];
for (const route of p1Routes) assert(appRoutes.has(route), `P1 練習路徑未註冊：${route}`);

const p1Foundations = read("client/src/pages/P1FoundationsPractice.tsx");
assert(!p1Foundations.includes('days: ["星期日", "星期一", "星期二"]'), "P1 星期排序不可把星期日排在星期一之前");
assert(p1Foundations.includes("每個圖形代表 1 個單位"), "P1 象形圖須明確標示每個圖形代表 1 個單位");
assert(p1Foundations.includes("for (let distance = 1; choices.size < 4"), "P1 數數題必須提供四個不重複選項");

const p1Numbers = read("client/src/pages/P1NumbersPractice.tsx");
assert(p1Numbers.includes("value >= 90 ? value - 10"), "P1 比大小題必須避免產生兩個相同數字");

const p1Time = read("client/src/pages/P1TimePractice.tsx");
assert(p1Time.includes("`${hour}時正`"), "P1 鐘面整點答案須採正式時間書寫");
assert(p1Time.includes("[5, 10, 15, 20, 25, 35, 40, 45, 50, 55]"), "P1 幾時幾分題只可使用五分鐘刻度");

const p1NumberLine = read("client/src/pages/P1NumberLinePractice.tsx");
assert(p1NumberLine.includes("const span = step * 2"), "P1 數線跳格題必須以兩次跳躍計算終點");
assert(p1NumberLine.includes("value >= 0 && value <= 20"), "P1 數線答案必須限制在 0 至 20");

const p1Spatial = read("client/src/pages/P1SpatialPractice.tsx");
assert(p1Spatial.includes('name: "橙", answer: "球體"'), "P1 立體圖形生活物件須使用分類明確的球體例子");
assert(p1Spatial.includes("const shuffle = <T,>(items: T[]) => [...items];"), "P1 長度排序選項不可在作答時重新排列");

if (failures.length) {
  console.error("Maths Quest content audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Maths Quest content audit passed: ${new Set(homeRoutes).size} learning-map routes, S1/S2/S3 bilingual stations and eight-question flows verified.`);

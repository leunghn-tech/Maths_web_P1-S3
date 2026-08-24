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

if (failures.length) {
  console.error("Maths Quest content audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Maths Quest content audit passed: ${new Set(homeRoutes).size} learning-map routes, S1/S2/S3 bilingual stations and eight-question flows verified.`);

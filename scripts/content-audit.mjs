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

const p2Routes = [
  "/practice/p2-multiplication", "/practice/p2-numbers", "/practice/p2-money", "/practice/p2-time",
  "/practice/p2-numbers-compare", "/practice/p2-multiply-visual", "/practice/p2-money-coins", "/practice/p2-directions",
  "/practice/p2-division", "/practice/p2-direction-route", "/practice/p2-array-builder", "/practice/p2-measure",
  "/practice/p2-angles", "/practice/p2-division-remainder", "/practice/p2-quadrilaterals", "/practice/p2-pictograph-multiple",
  "/practice/p2-meter-centimeter", "/practice/p2-fractions-basic",
];
for (const route of p2Routes) assert(appRoutes.has(route), `P2 練習路徑未註冊：${route}`);

const p2Practice = read("client/src/pages/P2Practice.tsx");
assert(p2Practice.includes('difficulty === "standard" ? 8 : 9'), "P2 乘法挑戰題必須限制於九九乘法表");
assert(p2Practice.includes("for (let distance = 1; values.size < 4"), "P2 乘除題必須提供四個不重複選項");
assert(p2Practice.includes("const useDivision = mode === \"mixed\" && index % 2 === 1"), "P2 混合運算題必須包含整除運算");

const p2Numbers = read("client/src/pages/P2NumbersPractice.tsx");
assert(p2Numbers.includes("由 2 個百、4 個十和 5 個一組成"), "P2 三位數題幹須使用正式百十個位表達");

const p2Money = read("client/src/pages/P2MoneyPractice.tsx");
assert(p2Money.includes(">HK${v}</span>"), "P2 港幣找錢題所有金額須採 HK$ 標示");

const p2Time = read("client/src/pages/P2TimePractice.tsx");
assert(p2Time.includes('min={name === "時" ? "1" : "0"}'), "P2 時計時針只可設定為 1 至 12 時");

const p2Concept = read("client/src/pages/P2ConceptPractice.tsx");
assert(p2Concept.includes("const coinOptions ="), "P2 硬幣組合題須採用受控選項資料");
assert(p2Concept.includes("!== question.target"), "P2 硬幣錯誤選項不可剛好湊到目標金額");

const p2NumberLine = read("client/src/pages/P2NumberLinePractice.tsx");
assert(p2NumberLine.includes('ans:q.a>q.b?">":"<"'), "P2 數線比較符號須依兩數大小計算");

const p2Applied = read("client/src/pages/P2AppliedPractice.tsx");
assert(p2Applied.includes("a:q.n%q.g"), "P2 有餘數題須以除法餘數計算答案");

const p2Further = read("client/src/pages/P2FurtherPractice.tsx");
assert(p2Further.includes("a:q.n*q.k"), "P2 象形圖答案須為圖案數量乘上圖例數值");
assert(p2Further.includes("1 米 = 100 厘米"), "P2 米厘米換算須明確使用 1 米等於 100 厘米");

const p2Starter = read("client/src/pages/P2P3StarterPractice.tsx");
assert(p2Starter.includes("const fractionParts"), "P2 分數初步須使用受控的一半與四分一題組");
assert(p2Starter.includes("function weightChoices"), "P3 克公斤題必須提供四個不重複選項");

const p3Routes = [
  "/practice/p3-weight", "/practice/p3-capacity", "/practice/p3-24hour", "/practice/p3-weight-builder",
  "/practice/p3-large-numbers", "/practice/p3-charts", "/practice/p3-parallel-perpendicular", "/practice/p3-mixed-steps",
  "/practice/p3-parallelogram-trapezium", "/practice/p3-perimeter-area", "/practice/p3-mixed-stories", "/practice/p3-shopping-measure",
  "/practice/p3-mixed-operations",
];
for (const route of p3Routes) assert(appRoutes.has(route), `P3 練習路徑未註冊：${route}`);

const p3Practice = read("client/src/pages/P3Practice.tsx");
assert(p3Practice.includes("const passed = levelScore >= 5"), "P3 混合運算須答對至少 5 題才可過關");
assert(p3Practice.includes("答對至少 5 題即可解鎖"), "P3 混合運算過關文案須與五題門檻一致");

const p3Data = read("client/src/pages/P3DataPractice.tsx");
assert(p3Data.includes("const numberComparisons"), "P3 大數比較題須使用受控的兩數資料");
assert(p3Data.includes('answer: question.left > question.right ? "＞" : "＜"'), "P3 大數比較符號必須依兩數大小計算");
assert(p3Data.includes("const barTargets"), "P3 棒形圖題須使用受控的目標格數");
assert(p3Data.includes("if (index === 7)"), "P3 大數與統計圖站須完成八題才可結算");

const p3Progress = read("client/src/pages/P3ProgressPractice.tsx");
assert(p3Progress.includes('prompt: "中午 12 時"'), "P3 二十四小時制題幹須使用中午 12 時的正式表述");
assert(p3Progress.includes('step="50"'), "P3 量杯刻度須以 50 mL 為單位");
assert(p3Progress.includes("100, 250, 500"), "P3 多法碼天平須提供 100 g、250 g、500 g 法碼");

const p3Core = read("client/src/pages/P3CorePractice.tsx");
assert(p3Core.includes("function choicesFor"), "P3 混合計算題必須提供四個不重複選項");
assert(p3Core.includes("兩組對邊分別平行"), "P3 平行四邊形題幹須使用精確的對邊平行表述");
assert(p3Core.includes("if (index === 7)"), "P3 括號運算及四邊形分類站須完成八題才可結算");

const p3Final = read("client/src/pages/P3FinalPractice.tsx");
assert(p3Final.includes("面積是多少平方格"), "P3 面積題須使用平方格作答單位");
assert(p3Final.includes("每杯有 300 mL"), "P3 容量生活題須使用合理且明確的毫升數據");
assert(p3Final.includes("先把 kg 換成 g，或把 L 換成 mL"), "P3 超市量度題須提示先統一單位");

const p3Geometry = read("client/src/pages/P3GeometryPractice.tsx");
assert(p3Geometry.includes("同一平面內，兩條永不相交的直線"), "P3 平行線題幹須使用同一平面內永不相交的定義");
assert(p3Geometry.includes("兩條相交後形成直角的直線"), "P3 垂直線題幹須使用直角定義");
assert(p3Geometry.includes("if (index === 7)"), "P3 平行垂直線站須完成八題才可結算");

const p4Routes = [
  "/practice/p4-grid-area", "/practice/p4-fractions-visual", "/practice/p4-decimals-line", "/practice/p4-triangles", "/practice/p4-eight-directions",
  "/practice/p4-quadrilateral-map", "/practice/p4-bar-chart", "/practice/p4-decimal-shopping", "/practice/p4-route-planning", "/practice/p4-bar-compare",
  "/practice/p4-fractions-decimals", "/practice/p4-factors-multiples", "/practice/p4-perimeter-area", "/practice/p4-polygon-area",
];
for (const route of p4Routes) assert(appRoutes.has(route), `P4 練習路徑未註冊：${route}`);

const p4QuestionStation = read("client/src/components/P4QuestionStation.tsx");
assert(p4QuestionStation.includes("Array.from({ length: 8 }"), "P4 隨機題站每組必須產生 8 題");
assert(p4QuestionStation.includes("完成 8 題"), "P4 隨機題站任務文案須與八題流程一致");

const p4Visual = read("client/src/pages/P4VisualPractice.tsx");
assert(p4Visual.includes("area: item.width * item.height"), "P4 方格面積答案必須由長乘闊計算");
assert(p4Visual.includes('answer: "1/2", shaded: 3, choices: ["1/2", "1/6", "2/6", "4/6"]'), "P4 分數題不得同時提供與正解等值的分數選項");
assert(p4Visual.includes("if (index === 7)"), "P4 方格面積及分數站須完成八題才可結算");

const p4Concept = read("client/src/pages/P4ConceptPractice.tsx");
assert(p4Concept.includes("HK$2 和 75 仙"), "P4 小數港幣題須使用 HK$ 與仙的正式寫法");
assert(p4Concept.includes("有兩條邊一樣長"), "P4 等腰三角形題幹須明確指出兩條邊一樣長");
assert(p4Concept.includes('move: "向右 1 格、向上 1 格"'), "P4 八方向題須提供可判定的位置移動資料");

const p4Complete = read("client/src/pages/P4CompletePractice.tsx");
assert(p4Complete.includes("只有一組對邊平行"), "P4 梯形題幹須使用一組對邊平行的定義");
assert(p4Complete.includes("每一格代表"), "P4 棒形圖題須清楚標示每格代表的數量");
assert(p4Complete.includes("HK$2.50"), "P4 小數購物題須以 HK$ 顯示金額");

const p4Factors = read("client/src/pages/P4FactorsPractice.tsx");
assert(p4Factors.includes("const nonFactors"), "P4 因數題須排除其他可整除的干擾項");

const p4Measure = read("client/src/pages/P4MeasurePractice.tsx");
assert(p4Measure.includes("平方厘米"), "P4 面積題的題幹與答案必須標示平方厘米");
assert(p4Measure.includes("周界是多少厘米"), "P4 周界題的題幹與答案必須標示厘米");

const p4Polygon = read("client/src/pages/P4PolygonAreaPractice.tsx");
assert(p4Polygon.includes("const top = proposedTop % 2 === base % 2"), "P4 梯形面積題須控制上下底同奇偶以確保整數答案");
assert(p4Polygon.includes("平方厘米"), "P4 多邊形面積題的選項必須標示平方厘米");

if (failures.length) {
  console.error("Maths Quest content audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Maths Quest content audit passed: ${new Set(homeRoutes).size} learning-map routes, S1/S2/S3 bilingual stations and eight-question flows verified.`);

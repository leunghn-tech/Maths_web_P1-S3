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
    const renderedQuestions = baseRows;
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

const p5Routes = [
  "/practice/p5-fraction-visual", "/practice/p5-decimal-life", "/practice/p5-volume-build", "/practice/p5-fraction-add", "/practice/p5-area",
  "/practice/p5-geometry-data", "/practice/p5-volume-units", "/practice/p5-decimal-carry", "/practice/p5-polygons", "/practice/p5-data-insights",
  "/practice/p5-area-puzzle", "/practice/p5-volume-life", "/practice/p5-fractions", "/practice/p5-decimals", "/practice/p5-unlike-fractions", "/practice/p5-volume",
];
for (const route of p5Routes) assert(appRoutes.has(route), `P5 練習路徑未註冊：${route}`);

const p5Fraction = read("client/src/pages/P5FractionPractice.tsx");
assert(p5Fraction.includes("bottom === 1 ? String(top)"), "P5 分數乘除整數結果不得顯示為分母 1 的分數");
assert(p5Fraction.includes("const choicesFor"), "P5 分數乘除題必須提供四個不重複選項");

const p5Unlike = read("client/src/pages/P5UnlikeFractionsPractice.tsx");
assert(p5Unlike.includes("if (subtract && convertedFirst < convertedSecond)"), "P5 異分母減法須先調整算式順序，避免把負數誤作絕對值");
assert(p5Unlike.includes("先通分，再計算"), "P5 異分母分數題幹須說明通分步驟");

const p5Decimal = read("client/src/pages/P5DecimalPractice.tsx");
assert(p5Decimal.includes("const minuend = Math.max(a, b)"), "P5 小數減法須確保被減數不小於減數");
assert(p5Decimal.includes("const decimalChoices"), "P5 小數題須提供四個不重複選項");

const p5Volume = read("client/src/pages/P5VolumePractice.tsx");
assert(p5Volume.includes("立方厘米"), "P5 體積題的題幹及選項必須標示立方厘米");
assert(p5Volume.includes("高是多少厘米"), "P5 體積反推題須清楚標示高的厘米單位");

const p5Visual = read("client/src/pages/P5FractionVisualPractice.tsx");
assert(p5Visual.includes('answer: "3/8"'), "P5 分數圖形模型須正確計算二分之一乘四分之三為八分之三");
assert(p5Visual.includes('answer: "2"'), "P5 分數除法整數答案須以整數顯示");
assert(p5Visual.includes("if (index === 7)"), "P5 分數圖形模型站須完成八題才可結算");

const p5Core = read("client/src/pages/P5CorePractice.tsx");
assert(p5Core.includes("title: \"三角形面積\""), "P5 面積站須正確標示為三角形面積，不可誤稱混合圖形");
assert(p5Core.includes("平方厘米"), "P5 三角形面積答案必須標示平方厘米");
assert(p5Core.includes("<Minus"), "P5 多日數據站須提供點選調整作為拖曳以外的操作方式");

const p5Expansion = read("client/src/pages/P5ExpansionPractice.tsx");
assert(p5Expansion.includes("1,000,000 立方厘米"), "P5 體積換算須使用一立方公尺等於一百萬立方厘米");
assert(p5Expansion.includes('answer: "60°"'), "P5 旋轉角題的答案必須標示角度符號");
assert(p5Expansion.includes('answer: "下降"'), "P5 數據趨勢題須採用文字趨勢答案");

const p5Complete = read("client/src/pages/P5CompletePractice.tsx");
assert(p5Complete.includes("HK$2.40"), "P5 小數生活題須以 HK$ 顯示港幣");
assert(p5Complete.includes("長 {dims[0]} 厘米、闊 {dims[1]} 厘米、高 {dims[2]} 厘米"), "P5 體積積木站須列出長、闊、高與厘米單位");

const p5Applied = read("client/src/pages/P5AppliedPractice.tsx");
assert(p5Applied.includes("平方厘米"), "P5 面積拼圖答案必須標示平方厘米");
assert(p5Applied.includes("立方公尺"), "P5 體積生活題必須標示立方公尺或立方厘米");
assert(p5Applied.includes("if (index === 7)"), "P5 面積拼圖與生活體積站須完成八題才可結算");

const p6Routes = [
  "/practice/p6-convert", "/practice/p6-measure-rate", "/practice/p6-geometry", "/practice/p6-data-equation", "/practice/p6-finance",
  "/practice/p6-solid-volume", "/practice/p6-statistics", "/practice/p6-water-3d", "/practice/p6-pie-drag", "/practice/p6-equation-steps",
  "/practice/p6-circle-lab", "/practice/p6-nets", "/practice/p6-coordinate-lab", "/practice/p6-discount", "/practice/p6-profit",
];
for (const route of p6Routes) assert(appRoutes.has(route), `P6 練習路徑未註冊：${route}`);

const p6Expansion = read("client/src/pages/P6ExpansionPractice.tsx");
assert(p6Expansion.includes('"0.25 轉成百分數","25%"'), "P6 小數轉百分數必須正確計算 0.25 為 25%");
assert(p6Expansion.includes('"半徑 7 cm，圓周約多少？（π＝22/7）","44 cm"'), "P6 圓周題必須正確計算半徑 7 cm 的圓周為 44 cm");
assert(p6Expansion.includes('"120 km 用 2 小時，速率是多少？","60 km/h"'), "P6 速率題必須正確以路程除時間計算");
assert(p6Expansion.includes('"2x＋3＝11，x 是多少？","4"'), "P6 兩步方程題必須正確求解");

const p6Further = read("client/src/pages/P6FurtherPractice.tsx");
assert(p6Further.includes('"$2,000 以 2% 單利存兩年，利息是多少？", "$80"'), "P6 單利題必須正確計算兩年利息");
assert(p6Further.includes('"水位由 200 mL 升至 260 mL，物件體積是多少？", "60 cm³"'), "P6 排水法題必須正確以水位差求物件體積");
assert(p6Further.includes('"測驗 80 分佔 40%、90 分佔 60%，加權平均是多少？", "86"'), "P6 加權平均題必須正確計算為 86 分");

const p6Interactive = read("client/src/pages/P6InteractivePractice.tsx");
assert(p6Interactive.includes("1 mL ＝ 1 cm³"), "P6 排水法互動站須明確列出 1 mL 等於 1 cm³");
assert(p6Interactive.includes("拖／點"), "P6 圓形圖拖曳站須提供點選替代操作");
assert(p6Interactive.includes('"2x ＋ 3 ＝ 11", "−3，再 ÷2", "4"'), "P6 方程逐步填答必須提供正確的兩步解法");

const p6Complete = read("client/src/pages/P6CompletePractice.tsx");
assert(p6Complete.includes('"半徑 7 cm，圓周是多少？（π＝22/7）", "44 cm"'), "P6 圓形量度站須正確計算圓周");
assert(p6Complete.includes('"正方體展開圖有多少個正方形？", "6"'), "P6 展開圖題必須正確列出正方體有六個正方形面");
assert(p6Complete.includes('"由 (1,1) 向右 3 格、向上 2 格，到哪裡？", "(4,3)"'), "P6 座標移動題必須正確計算終點");

const p6Discount = read("client/src/pages/P6DiscountPractice.tsx");
assert(p6Discount.includes("HK$"), "P6 折扣題須以 HK$ 顯示港幣");
assert(p6Discount.includes("第二次折扣要用第一次折後價計算"), "P6 連續折扣題須避免直接相加百分率的錯誤");

const p6Profit = read("client/src/pages/P6ProfitPractice.tsx");
assert(p6Profit.includes("HK$"), "P6 利潤題須以 HK$ 顯示港幣");
assert(p6Profit.includes("售價 = 成本 + 利潤"), "P6 售價反推題須使用成本加利潤的正確關係");

const s1Routes = ["/practice/s1", "/practice/s1-interactive"];
for (const route of s1Routes) assert(appRoutes.has(route), `S1 練習路徑未註冊：${route}`);

const s1Bilingual = read("client/src/pages/S1BilingualPractice.tsx");
assert(s1Bilingual.includes('"-4 − 6 是多少？", "What is -4 - 6?", "-10"'), "S1 有向數題必須正確計算負四減六為負十");
assert(s1Bilingual.includes('"3x＋2＝17，x 是？", "Solve 3x + 2 = 17.", "5"'), "S1 一元一次方程題必須正確求得 x 為五");
assert(s1Bilingual.includes('"3，6，9，… 的第 n 項是？", "What is the nth term of 3, 6, 9, ...?", "3n"'), "S1 數列第 n 項題必須正確表達為 3n");
assert(s1Bilingual.includes('"一輛車行駛 120 km 用時 2 h，求其平均速率。", "A car travels 120 km in 2 h. Find its average speed.", "60 km/h"'), "S1 速率題必須以正式題幹及路程除時間正確計算");
assert(s1Bilingual.includes('"三角形底 8 cm、高 5 cm，面積是？", "Triangle base 8 cm, height 5 cm. Area?", "20 cm²"'), "S1 三角形面積題必須正確使用二分之一乘底乘高");
assert(s1Bilingual.includes("CMI 中文") && s1Bilingual.includes("EMI English"), "S1 題庫必須提供 CMI 及 EMI 題面切換");
assert(s1Bilingual.includes("if (index === 7)"), "S1 雙語題庫站須完成八題才可結算");
assert(s1Bilingual.includes("下列各數中，哪個數最大？") && s1Bilingual.includes("把 21 按 2:5 分配"), "S1 題庫須採用正式中學數學問法，避免含混口語題幹");

const s1Interactive = read("client/src/pages/S1InteractiveFoundations.tsx");
assert(s1Interactive.includes('target: -7'), "S1 互動數線須包含負數定位任務");
assert(s1Interactive.includes('parts: [6, -2], target: 4'), "S1 互動代數積木須正確合併六 x 減二 x 為四 x");
assert(s1Interactive.includes('start: "2x + 3 = 11"'), "S1 互動方程站須提供標準兩步方程");
assert(s1Interactive.includes("if (index === 7)"), "S1 互動站須完成八題才可結算");

const s2Routes = ["/practice/s2", "/practice/s2-interactive"];
for (const route of s2Routes) assert(appRoutes.has(route), `S2 練習路徑未註冊：${route}`);

const s2Bilingual = read("client/src/pages/S2BilingualPractice.tsx");
assert(s2Bilingual.includes('"化簡 a³ × a²。","Simplify a³ × a².","a⁵"'), "S2 同底數相乘題必須以正式問法並正確相加指數");
assert(s2Bilingual.includes('"把 x²＋5x 因式分解。","Factorise x² + 5x.","x(x+5)"'), "S2 因式分解題必須正確提取 x 公因式");
assert(s2Bilingual.includes('"解聯立方程 x＋y＝7、x−y＝1，求 x。","Solve x + y = 7 and x - y = 1. Find x.","4"'), "S2 聯立方程題必須以正式問法正確求得 x 為四");
assert(s2Bilingual.includes('"一直角三角形的兩條直角邊長分別為 3 cm 及 4 cm，求斜邊長。","A right-angled triangle has legs 3 cm and 4 cm. Find the hypotenuse.","5 cm"'), "S2 畢氏定理題必須清楚標示條件、單位及答案");
assert(s2Bilingual.includes('"求點 (0,0) 與 (3,4) 之間的距離。","Find the distance between (0,0) and (3,4).","5"'), "S2 坐標距離題必須採用正式距離問法");
assert(s2Bilingual.includes("CMI 中文") && s2Bilingual.includes("EMI English"), "S2 題庫必須提供 CMI 及 EMI 題面切換");
assert(s2Bilingual.includes("if(index===7)"), "S2 雙語題庫站須完成八題才可結算");
assert(!s2Bilingual.includes("（延伸）") && !s2Bilingual.includes("(extension)"), "S2 每站八題必須為不重複正式題目，不能以延伸標籤重覆");

const s2Interactive = read("client/src/pages/S2InteractiveCore.tsx");
assert(s2Interactive.includes('{a:5,b:0,rule:"add",result:5}'), "S2 互動指數站須正確處理 a⁵×a⁰ 為 a⁵");
assert(s2Interactive.includes('expr:"x² + 5x",factor:"x",inside:"x + 5"'), "S2 互動因式分解須正確提取 x 公因式");
assert(s2Interactive.includes('answer:"x = 4, y = 3"'), "S2 互動聯立方程須正確求解 x 為四、y 為三");
assert(s2Interactive.includes("if(index===7)"), "S2 互動站須完成八題才可結算");
assert(s2Interactive.includes("item=station.items[index]") && s2Interactive.includes("items:[{a:3,b:2"), "S2 互動站須逐題使用八條不重複任務");

const s3Routes = ["/practice/s3", "/practice/s3-interactive", "/practice/s3-sim", "/practice/s3-deep", "/practice/s3-lab"];
for (const route of s3Routes) assert(appRoutes.has(route), `S3 練習路徑未註冊：${route}`);

const s3Bilingual = read("client/src/pages/S3BilingualPractice.tsx");
assert(s3Bilingual.includes('"展開 (a+b)²。","Expand (a+b)².","a²+2ab+b²"'), "S3 恆等式題必須以正式問法正確展開完全平方");
assert(s3Bilingual.includes('"解不等式 −2x > 8。","Solve −2x > 8.","x < −4"'), "S3 負數係數不等式題必須以標準間距反轉不等號");
assert(s3Bilingual.includes('"方位角由哪個方向順時針量起？","A bearing is measured clockwise from which direction?","北方 / North"'), "S3 方位角題必須由北方順時針量起");
assert(s3Bilingual.includes('"球體的體積公式是甚麼？","What is the volume formula of a sphere?","4/3πr³"'), "S3 球體積公式必須正確為四分之三 πr³");
assert(s3Bilingual.includes('"擲一個公平骰子，出現 6 的概率是多少？","What is the probability of rolling a 6 on a fair die?","1/6"'), "S3 骰子概率題必須正確為六分之一");
assert(s3Bilingual.includes("CMI 中文") && s3Bilingual.includes("EMI English"), "S3 題庫必須提供 CMI 及 EMI 題面切換");
assert(s3Bilingual.includes("if(index===7)"), "S3 雙語題庫站須完成八題才可結算");
assert(!s3Bilingual.includes("（延伸）") && !s3Bilingual.includes("(extension)"), "S3 每站八題必須為不重複正式題目，不能以延伸標籤重覆");

const s3Interactive = read("client/src/pages/S3InteractiveCore.tsx");
assert(s3Interactive.includes('form:"(a+b)²",answer:"a² + 2ab + b²"'), "S3 互動恆等式站須正確配對完全平方公式");
assert(s3Interactive.includes('bound:-2,direction:"left",solid:true'), "S3 互動不等式站須正確表示 x≤−2 的實心點向左");
assert(s3Interactive.includes('claim:"證明 ∠B = ∠C"'), "S3 互動幾何站須包含等腰三角形底角證明");
assert(s3Interactive.includes("if(index===7)"), "S3 互動站須完成八題才可結算");
assert(s3Interactive.includes("item=station.items[index]") && s3Interactive.includes("三條邊的垂直平分線相交"), "S3 互動站須使用八條不重複任務及正確三角形中心術語");

const s3Advanced = read("client/src/pages/S3AdvancedSimulations.tsx");
assert(s3Advanced.includes("const item = station.items[index]") && s3Advanced.includes("target: \"H\"") && s3Advanced.includes("target: \"T\""), "S3 基礎概率模擬須以八題索引呈現一致的硬幣樹狀圖概率");
assert(s3Advanced.includes("principal: 1000, rate: 10, kind: \"interest\", years: 3") && s3Advanced.includes("principal: 5000, rate: 12, kind: \"depreciation\", years: 4"), "S3 複利模擬須提供八個可驗證的本金、利率及年數資料");
assert(s3Advanced.includes("bearing === item.bearing && kind === item.kind && angle === item.angle"), "S3 方位及仰俯角模擬須核對全部設定");

const s3Deep = read("client/src/pages/S3DeepSimulations.tsx");
assert(s3Deep.includes('answer==="1/3"&&draws.length===2'), "S3 不放回樹狀圖須正確驗證先紅後藍的概率為三分之一");
assert(s3Deep.includes("h = {distance} × tan {angle}°"), "S3 三角學高度站須顯示正切的距離與高度關係");

const s3Lab = read("client/src/pages/S3LabPlus.tsx");
assert(s3Lab.includes("height / Math.tan(angle * Math.PI / 180)"), "S3 反算三角學站須以高度除正切求水平距離");
assert(s3Lab.includes("Math.atan(height / distance)"), "S3 反算三角學站須以反正切求角度");
assert(s3Lab.includes("bag.filter((_, i) => i !== pick)"), "S3 自訂抽樣袋必須在不放回抽樣後移除已抽球");
assert(s3Lab.includes("principal * Math.pow(1 + monthlyRate, months)"), "S3 儲蓄目標站須以複利公式計算本金增長");
assert(s3Lab.includes("monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)"), "S3 每月供款模擬須使用年金終值公式");

if (failures.length) {
  console.error("Maths Quest content audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Maths Quest content audit passed: ${new Set(homeRoutes).size} learning-map routes, S1/S2/S3 bilingual stations and eight-question flows verified.`);

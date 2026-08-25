import P4QuestionStation, { type Difficulty, type RandomProblem } from "@/components/P4QuestionStation";

const unique = (values: number[]) => Array.from(new Set(values)).filter((value) => value > 0);
const choices = (answer: number) => [...unique([answer, answer + 2, answer - 2, answer + 4])].slice(0, 4).sort(() => Math.random() - 0.5).map((value) => `${value} 平方厘米`);

function generatePolygonArea(difficulty: Difficulty): RandomProblem {
  const shapes = difficulty === "easy" ? ["triangle"] : difficulty === "standard" ? ["triangle", "parallelogram"] : ["triangle", "parallelogram", "trapezoid"];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  const base = difficulty === "easy" ? 4 + Math.floor(Math.random() * 5) : 6 + Math.floor(Math.random() * 9);
  const height = difficulty === "easy" ? 2 + Math.floor(Math.random() * 4) : 3 + Math.floor(Math.random() * 8);
  if (shape === "triangle") {
    const adjustedBase = base % 2 === 0 ? base : base + 1;
    const answer = adjustedBase * height / 2;
    return { id: `triangle-${adjustedBase}-${height}`, prompt: `一個三角形的底是 ${adjustedBase} 厘米，高是 ${height} 厘米。面積是多少平方厘米？`, equation: `(${adjustedBase} × ${height}) ÷ 2`, answer: `${answer} 平方厘米`, choices: choices(answer), hint: "三角形面積 = 底 × 高 ÷ 2，答案要用平方厘米。", diagram: { width: adjustedBase, height, label: `底 ${adjustedBase} 厘米 · 高 ${height} 厘米`, shape: "triangle" } };
  }
  if (shape === "parallelogram") {
    const answer = base * height;
    return { id: `parallelogram-${base}-${height}`, prompt: `一個平行四邊形的底是 ${base} 厘米，高是 ${height} 厘米。面積是多少平方厘米？`, equation: `${base} × ${height}`, answer: `${answer} 平方厘米`, choices: choices(answer), hint: "平行四邊形面積 = 底 × 高，答案要用平方厘米。", diagram: { width: base, height, label: `底 ${base} 厘米 · 高 ${height} 厘米`, shape: "parallelogram" } };
  }
  const proposedTop = Math.max(2, base - (2 + Math.floor(Math.random() * 4)));
  const top = proposedTop % 2 === base % 2 ? proposedTop : proposedTop + 1;
  const adjustedHeight = height % 2 === 0 || (base + top) % 2 === 0 ? height : height + 1;
  const answer = (base + top) * adjustedHeight / 2;
  return { id: `trapezoid-${base}-${top}-${adjustedHeight}`, prompt: `一個梯形的上底是 ${top} 厘米，下底是 ${base} 厘米，高是 ${adjustedHeight} 厘米。面積是多少平方厘米？`, equation: `(${top} + ${base}) × ${adjustedHeight} ÷ 2`, answer: `${answer} 平方厘米`, choices: choices(answer), hint: "梯形面積 =（上底 + 下底）× 高 ÷ 2，答案要用平方厘米。", diagram: { width: base, height: adjustedHeight, label: `上底 ${top} 厘米 · 下底 ${base} 厘米 · 高 ${adjustedHeight} 厘米`, shape: "trapezoid" } };
}

export default function P4PolygonAreaPractice() { return <P4QuestionStation stationCode="P4 面積站 · 04" title="多邊形面積" subtitle="選擇難度後，隨機挑戰三角形、平行四邊形與梯形的面積計算。" accent="#4f6eae" practiceKey="p4-polygon-area" generateProblem={generatePolygonArea} />; }

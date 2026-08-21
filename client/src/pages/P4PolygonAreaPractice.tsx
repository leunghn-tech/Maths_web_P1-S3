/** P4 三角形、平行四邊形與梯形面積隨機練習頁。 */
import P4QuestionStation, { type Difficulty, type RandomProblem } from "@/components/P4QuestionStation";

const unique = (values: number[]) => Array.from(new Set(values));
const shuffled = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

function options(answer: number) { return shuffled(unique([answer, answer + 2, Math.max(1, answer - 2), answer + 4])).map(String); }

function generatePolygonArea(difficulty: Difficulty): RandomProblem {
  const shapes = difficulty === "easy" ? ["triangle"] : difficulty === "standard" ? ["triangle", "parallelogram"] : ["triangle", "parallelogram", "trapezoid"];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  const base = difficulty === "easy" ? 4 + Math.floor(Math.random() * 5) : 6 + Math.floor(Math.random() * 9);
  const height = difficulty === "easy" ? 2 + Math.floor(Math.random() * 4) : 3 + Math.floor(Math.random() * 8);
  if (shape === "triangle") {
    const adjustedBase = base % 2 === 0 ? base : base + 1;
    const answer = adjustedBase * height / 2;
    return { id: `triangle-${adjustedBase}-${height}`, prompt: `三角形底是 ${adjustedBase} cm，高是 ${height} cm，面積是多少？`, equation: `(${adjustedBase} × ${height}) ÷ 2`, answer: String(answer), choices: options(answer), hint: "三角形面積 = 底 × 高 ÷ 2。", diagram: { width: adjustedBase, height, label: `底 ${adjustedBase} cm · 高 ${height} cm`, shape: "triangle" } };
  }
  if (shape === "parallelogram") {
    const answer = base * height;
    return { id: `parallelogram-${base}-${height}`, prompt: `平行四邊形底是 ${base} cm，高是 ${height} cm，面積是多少？`, equation: `${base} × ${height}`, answer: String(answer), choices: options(answer), hint: "平行四邊形面積 = 底 × 高。", diagram: { width: base, height, label: `底 ${base} cm · 高 ${height} cm`, shape: "parallelogram" } };
  }
  const top = Math.max(2, base - (2 + Math.floor(Math.random() * 4)));
  const answer = (base + top) * height / 2;
  return { id: `trapezoid-${base}-${top}-${height}`, prompt: `梯形上底 ${top} cm、下底 ${base} cm、高 ${height} cm，面積是多少？`, equation: `(${top} + ${base}) × ${height} ÷ 2`, answer: String(answer), choices: options(answer), hint: "梯形面積 =（上底 + 下底）× 高 ÷ 2。", diagram: { width: base, height, label: `上 ${top} · 下 ${base} · 高 ${height}`, shape: "trapezoid" } };
}

export default function P4PolygonAreaPractice() { return <P4QuestionStation stationCode="P4 面積站 · 04" title="多邊形面積" subtitle="選擇難度後，隨機挑戰三角形、平行四邊形與梯形的面積計算。" accent="#4f6eae" practiceKey="p4-polygon-area" generateProblem={generatePolygonArea} />; }

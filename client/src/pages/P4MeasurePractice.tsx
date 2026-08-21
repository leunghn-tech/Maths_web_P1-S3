/** P4 周界與面積隨機練習頁。 */
import P4QuestionStation, { type Difficulty, type RandomProblem } from "@/components/P4QuestionStation";

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

function generateMeasure(difficulty: Difficulty): RandomProblem {
  const width = difficulty === "easy" ? 3 + Math.floor(Math.random() * 5) : 5 + Math.floor(Math.random() * 8);
  const height = difficulty === "easy" ? 2 + Math.floor(Math.random() * 4) : 3 + Math.floor(Math.random() * 7);
  if (difficulty === "easy") {
    const answer = 2 * (width + height);
    return { id: `perimeter-${width}-${height}`, prompt: `長方形長 ${width} cm、闊 ${height} cm，周界是多少？`, equation: `2 × (${width} + ${height})`, answer: String(answer), choices: shuffle([answer, width * height, answer + 2, answer - 2]).map(String), hint: "周界是四條邊的總長度：長加闊，再乘 2。", diagram: { width, height, label: `${width} cm × ${height} cm` } };
  }
  if (difficulty === "standard") {
    const answer = width * height;
    return { id: `area-${width}-${height}`, prompt: `長方形長 ${width} cm、闊 ${height} cm，面積是多少？`, equation: `${width} × ${height}`, answer: String(answer), choices: shuffle([answer, 2 * (width + height), answer + width, answer - height]).map(String), hint: "面積是長乘闊，單位是平方厘米。", diagram: { width, height, label: `${width} cm × ${height} cm` } };
  }
  const area = width * height;
  const answer = 2 * (width + height);
  return { id: `mixed-${width}-${height}`, prompt: `一個長方形的面積是 ${area} cm²，長是 ${width} cm，周界是多少？`, equation: `2 × (${width} + ${height})`, answer: String(answer), choices: shuffle([answer, area, answer + 4, answer - 2]).map(String), hint: "先用面積 ÷ 長找出闊，再計算周界。", diagram: { width, height, label: `面積 ${area} cm²` } };
}

export default function P4MeasurePractice() { return <P4QuestionStation stationCode="P4 量度站 · 03" title="周界與面積" subtitle="選擇難度後，系統會隨機產生長方形周界、面積與反推量度挑戰。" accent="#4f6eae" practiceKey="p4-measure" generateProblem={generateMeasure} />; }

import P4QuestionStation, { type Difficulty, type RandomProblem } from "@/components/P4QuestionStation";

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
const uniqueNumbers = (values: number[]) => Array.from(new Set(values)).filter((value) => value > 0);
const choicesWithUnit = (answer: number, unit: string, offsets: number[]) => shuffle(uniqueNumbers([answer, ...offsets.map((offset) => answer + offset)]).slice(0, 4).map((value) => `${value} ${unit}`));

function generateMeasure(difficulty: Difficulty): RandomProblem {
  const length = difficulty === "easy" ? 3 + Math.floor(Math.random() * 5) : 5 + Math.floor(Math.random() * 8);
  const width = difficulty === "easy" ? 2 + Math.floor(Math.random() * 4) : 3 + Math.floor(Math.random() * 7);
  if (difficulty === "easy") {
    const answer = 2 * (length + width);
    const unit = "厘米";
    return { id: `perimeter-${length}-${width}`, prompt: `一個長方形的長是 ${length} 厘米，闊是 ${width} 厘米。周界是多少厘米？`, equation: `2 × (${length} + ${width})`, answer: `${answer} ${unit}`, choices: choicesWithUnit(answer, unit, [2, -2, 4]), hint: "周界是四條邊的總長度：先算長加闊，再乘 2。", diagram: { width: length, height: width, label: `長 ${length} 厘米 · 闊 ${width} 厘米` } };
  }
  if (difficulty === "standard") {
    const answer = length * width;
    const unit = "平方厘米";
    return { id: `area-${length}-${width}`, prompt: `一個長方形的長是 ${length} 厘米，闊是 ${width} 厘米。面積是多少平方厘米？`, equation: `${length} × ${width}`, answer: `${answer} ${unit}`, choices: choicesWithUnit(answer, unit, [length, -width, 2]), hint: "長方形面積 = 長 × 闊，答案要用平方厘米。", diagram: { width: length, height: width, label: `長 ${length} 厘米 · 闊 ${width} 厘米` } };
  }
  const area = length * width;
  const answer = 2 * (length + width);
  const unit = "厘米";
  return { id: `mixed-${length}-${width}`, prompt: `一個長方形的面積是 ${area} 平方厘米，長是 ${length} 厘米。周界是多少厘米？`, equation: `先算 ${area} ÷ ${length}，再算 2 × (${length} + 闊)`, answer: `${answer} ${unit}`, choices: choicesWithUnit(answer, unit, [4, -2, 2]), hint: "先用面積 ÷ 長找出闊，再計算周界。", diagram: { width: length, height: width, label: `面積 ${area} 平方厘米` } };
}

export default function P4MeasurePractice() { return <P4QuestionStation stationCode="P4 量度站 · 03" title="周界與面積" subtitle="選擇難度後，隨機挑戰長方形周界、面積與反推量度。" accent="#4f6eae" practiceKey="p4-measure" generateProblem={generateMeasure} />; }

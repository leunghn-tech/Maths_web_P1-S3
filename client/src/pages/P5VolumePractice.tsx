import P4QuestionStation, { type Difficulty, type RandomProblem } from "@/components/P4QuestionStation";

const shuffled = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
const optionsWithUnit = (answer: number, unit: string, offsets: number[]) => shuffled(Array.from(new Set([answer, ...offsets.map((offset) => Math.max(1, answer + offset))]))).slice(0, 4).map((value) => `${value} ${unit}`);

function generateVolume(difficulty: Difficulty): RandomProblem {
  const length = difficulty === "easy" ? 2 + Math.floor(Math.random() * 4) : 4 + Math.floor(Math.random() * 7);
  const width = difficulty === "easy" ? 2 + Math.floor(Math.random() * 3) : 3 + Math.floor(Math.random() * 6);
  const height = difficulty === "easy" ? 2 + Math.floor(Math.random() * 3) : 3 + Math.floor(Math.random() * 5);
  const volume = length * width * height;
  if (difficulty === "challenge") {
    const unit = "厘米";
    return { id: `volume-missing-${length}-${width}-${height}-${Math.random()}`, prompt: `一個長方體的體積是 ${volume} 立方厘米，長是 ${length} 厘米，闊是 ${width} 厘米。高是多少厘米？`, equation: `${volume} ÷ (${length} × ${width})`, answer: `${height} ${unit}`, choices: optionsWithUnit(height, unit, [-1, 1, 2, -2]), hint: "長方體體積 = 長 × 闊 × 高；要求高，就用體積除以長和闊。", diagram: { width: length, height: Math.max(width, height), label: `長 ${length} 厘米 · 闊 ${width} 厘米 · 高？`, shape: "cuboid" } };
  }
  const unit = "立方厘米";
  return { id: `volume-${length}-${width}-${height}-${Math.random()}`, prompt: `一個長方體的長是 ${length} 厘米，闊是 ${width} 厘米，高是 ${height} 厘米。體積是多少立方厘米？`, equation: `${length} × ${width} × ${height}`, answer: `${volume} ${unit}`, choices: optionsWithUnit(volume, unit, [-2, 2, length * width - volume, height * width]), hint: "長方體體積 = 長 × 闊 × 高，答案要用立方厘米。", diagram: { width: length, height: Math.max(width, height), label: `長 ${length} 厘米 · 闊 ${width} 厘米 · 高 ${height} 厘米`, shape: "cuboid" } };
}

export default function P5VolumePractice() { return <P4QuestionStation stationCode="P5 體積站 · 04" title="體積計算" subtitle="選擇難度後，隨機練習長方體體積與反推高的計算。" accent="#2c7c8a" practiceKey="p5-volume" gradeLabel="P5" generateProblem={generateVolume} />; }

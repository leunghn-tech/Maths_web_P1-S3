/** P5 體積計算隨機練習頁。 */
import P4QuestionStation, { type Difficulty, type RandomProblem } from "@/components/P4QuestionStation";

const shuffled = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
const distinctOptions = (answer: number, offsets: number[]) => shuffled(Array.from(new Set([answer, ...offsets.map((offset) => Math.max(1, answer + offset))]))).slice(0, 4).map(String);

function generateVolume(difficulty: Difficulty): RandomProblem {
  const length = difficulty === "easy" ? 2 + Math.floor(Math.random() * 4) : 4 + Math.floor(Math.random() * 7);
  const width = difficulty === "easy" ? 2 + Math.floor(Math.random() * 3) : 3 + Math.floor(Math.random() * 6);
  const height = difficulty === "easy" ? 2 + Math.floor(Math.random() * 3) : 3 + Math.floor(Math.random() * 5);
  const volume = length * width * height;
  if (difficulty === "challenge") {
    const answer = height;
    return {
      id: `volume-missing-${length}-${width}-${height}-${Math.random()}`,
      prompt: `一個長方體體積是 ${volume} cm³，長 ${length} cm、闊 ${width} cm，高是多少 cm？`,
      equation: `${volume} ÷ (${length} × ${width})`,
      answer: String(answer),
      choices: distinctOptions(answer, [-1, 1, 2, -2]),
      hint: "長方體體積 = 長 × 闊 × 高；要求高，就用體積除以長和闊。",
      diagram: { width: length, height: Math.max(width, height), label: `${length} × ${width} × ? cm`, shape: "cuboid" },
    };
  }
  return {
    id: `volume-${length}-${width}-${height}-${Math.random()}`,
    prompt: `一個長方體長 ${length} cm、闊 ${width} cm、高 ${height} cm，體積是多少 cm³？`,
    equation: `${length} × ${width} × ${height}`,
    answer: String(volume),
    choices: distinctOptions(volume, [length * width - volume, height * width, length * height, 6]),
    hint: "長方體體積 = 長 × 闊 × 高，記得單位是立方厘米。",
    diagram: { width: length, height: Math.max(width, height), label: `${length} × ${width} × ${height} cm`, shape: "cuboid" },
  };
}

export default function P5VolumePractice() {
  return <P4QuestionStation stationCode="P5 體積站 · 04" title="體積計算" subtitle="選擇難度後，隨機練習長方體體積與反推高的計算。" accent="#2c7c8a" practiceKey="p5-volume" gradeLabel="P5" generateProblem={generateVolume} />;
}

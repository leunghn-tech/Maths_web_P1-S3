import P4QuestionStation, { type Difficulty, type RandomProblem } from "@/components/P4QuestionStation";

const unique = (values: number[]) => Array.from(new Set(values));
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
const nonFactors = (total: number, count: number) => {
  const values: number[] = [];
  for (let candidate = 2; values.length < count; candidate += 1) if (total % candidate !== 0) values.push(candidate);
  return values;
};

function generateFactors(difficulty: Difficulty): RandomProblem {
  const base = difficulty === "easy" ? 3 + Math.floor(Math.random() * 5) : difficulty === "standard" ? 5 + Math.floor(Math.random() * 7) : 6 + Math.floor(Math.random() * 9);
  const multiplier = difficulty === "easy" ? 2 + Math.floor(Math.random() * 3) : 3 + Math.floor(Math.random() * 5);
  const total = base * multiplier;
  if (difficulty === "challenge") {
    const first = [12, 18, 20, 24, 30][Math.floor(Math.random() * 5)];
    const second = [18, 24, 30, 36, 42][Math.floor(Math.random() * 5)];
    const answer = Math.max(...unique(Array.from({ length: Math.min(first, second) }, (_, index) => index + 1).filter((value) => first % value === 0 && second % value === 0)));
    const options = unique([answer, Math.max(1, answer - 1), answer + 1, answer + 2]).slice(0, 4);
    return { id: `hcf-${first}-${second}`, prompt: `找出 ${first} 和 ${second} 的最大公因數。`, equation: `${first}，${second}`, answer: String(answer), choices: shuffle(options).map(String), hint: "同時能整除兩個數的最大數，就是最大公因數。" };
  }
  if (difficulty === "easy") {
    const answer = base;
    return { id: `factor-${total}-${answer}`, prompt: `下列哪個數是 ${total} 的因數？`, equation: `${total} ÷ ?`, answer: String(answer), choices: shuffle([answer, ...nonFactors(total, 3)]).map(String), hint: "因數可以把一個數整除而沒有餘數。" };
  }
  const answer = total * 2;
  return { id: `multiple-${total}-${answer}`, prompt: `下列哪個數是 ${total} 的倍數？`, equation: `${total} × ?`, answer: String(answer), choices: shuffle([answer, answer + 1, total * 3 + 1, total + 2]).map(String), hint: "倍數是原本的數乘上一個整數得到的結果。" };
}

export default function P4FactorsPractice() { return <P4QuestionStation stationCode="P4 因數站 · 02" title="因數與倍數" subtitle="選擇難度後，系統會隨機產生因數、倍數與最大公因數挑戰。" accent="#6c8b4c" practiceKey="p4-factors" generateProblem={generateFactors} />; }

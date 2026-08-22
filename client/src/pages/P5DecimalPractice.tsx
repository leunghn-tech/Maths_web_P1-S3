/** P5 小數四則運算隨機練習頁。 */
import P4QuestionStation, { type Difficulty, type RandomProblem } from "@/components/P4QuestionStation";

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
const format = (value: number) => Number(value.toFixed(2)).toString();
const choices = (answer: number) => shuffle(Array.from(new Set([answer, answer + 0.1, Math.max(0.1, answer - 0.1), answer + 1])).map(format));

function generateDecimal(difficulty: Difficulty): RandomProblem {
  const a = Number((1 + Math.random() * (difficulty === "easy" ? 7 : 14)).toFixed(1));
  const b = Number((0.2 + Math.random() * (difficulty === "easy" ? 4 : 8)).toFixed(1));
  if (difficulty === "easy") {
    const add = Math.random() > 0.5;
    const answer = add ? a + b : Math.max(0.1, a - b);
    return { id: `decimal-easy-${a}-${b}-${add}`, prompt: "把小數點對齊，再進行加法或減法。", equation: `${a} ${add ? "+" : "−"} ${b}`, answer: format(answer), choices: choices(answer), hint: "小數點要對齊，從十分位開始計算。" };
  }
  if (difficulty === "standard") {
    const multiplier = 2 + Math.floor(Math.random() * 5);
    const answer = a * multiplier;
    return { id: `decimal-standard-${a}-${multiplier}`, prompt: "先把小數看成整數運算，再把小數點放回正確位置。", equation: `${a} × ${multiplier}`, answer: format(answer), choices: choices(answer), hint: "小數乘整數後，答案的小數位數要與原數相同。" };
  }
  const divisor = 2 + Math.floor(Math.random() * 4);
  const quotient = Number((1 + Math.random() * 6).toFixed(1));
  const dividend = Number((quotient * divisor).toFixed(1));
  return { id: `decimal-challenge-${dividend}-${divisor}`, prompt: "把除式看成平均分組，檢查商的小數點位置。", equation: `${dividend} ÷ ${divisor}`, answer: format(quotient), choices: choices(quotient), hint: "小數除以整數，商的小數點要對齊被除數的小數點。" };
}

export default function P5DecimalPractice() { return <P4QuestionStation gradeLabel="P5" stationCode="P5 小數站 · 02" title="小數四則運算" subtitle="選擇難度後，隨機練習小數加減、乘法及除法。" accent="#0e8b87" practiceKey="p5-decimal-operations" generateProblem={generateDecimal} />; }
